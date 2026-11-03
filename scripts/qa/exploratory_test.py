"""밥먹자 탐색 테스트: 동시 요청·특수 입력·큰 파일·날짜 경계처럼 명세에 없는 상황에서 서버가 안전한지 본다.

서버 500 응답이나 데이터 불일치를 찾는 것이 목적이다.
실행: python3 scripts/qa/exploratory_test.py
결과: docs/test/results/exploratory-result.json
"""

from __future__ import annotations

import json
import sys
from concurrent.futures import ThreadPoolExecutor
from datetime import date, timedelta, datetime, timezone

from bapqa import ORIGIN, PASSWORD, PNG_BYTES, RESULT_DIR, Client, db_scalar, new_user, now_iso, sql_str

log = []
results = []


def check(title, expected, actual, passed):
    results.append({"title": title, "expected": expected, "actual": str(actual), "passed": bool(passed)})
    print(f"[{'PASS' if passed else 'FAIL'}] {title} (expected {expected}, got {actual})")


def client(tag, profile=True):
    c = Client(log)
    user = new_user(c, tag)
    c.call("POST", "/auth/register", json_body=user, auth=False)
    c.login(user["username"])
    if profile:
        c.call("POST", "/users/profile/initial", json_body={
            "gender": "F", "age": 24, "height": 163.0, "weight": 56.0, "activityLevel": "LIGHT", "goal": "MAINTAIN"})
    return c, user


def meal(eaten_at, name="식사", kcal=500):
    return {"mealType": "LUNCH", "eatenAt": eaten_at, "items": [
        {"name": name, "weightGram": 300, "calorie": kcal, "carb": 50, "protein": 20, "fat": 10}]}


def concurrent_likes():
    author, _ = client("xa", profile=False)
    pid = author.call("POST", "/community/posts", form={"content": "동시 좋아요"}).data["postId"]
    users = [client(f"xl{i}", profile=False)[0] for i in range(10)]
    with ThreadPoolExecutor(10) as pool:
        codes = list(pool.map(lambda u: u.call("POST", f"/community/posts/{pid}/likes").status, users))
    count = author.call("GET", f"/community/posts/{pid}").data["likeCount"]
    check("서로 다른 10명이 동시에 좋아요", "모두 200, likeCount=10", f"{sorted(set(codes))}, {count}",
          set(codes) == {200} and count == 10)
    author2 = users[0]
    with ThreadPoolExecutor(8) as pool:
        codes = list(pool.map(lambda _: author2.call("POST", f"/community/posts/{pid}/likes").status, range(8)))
    rows = db_scalar(f"select count(*) from post_likes where post_id={sql_str(pid)}")
    count = author.call("GET", f"/community/posts/{pid}").data["likeCount"]
    check("같은 사용자가 동시에 좋아요 연타", "500 없음, 카운트 = 실제 행 수", f"{sorted(set(codes))}, count={count}, rows={rows}",
          500 not in codes and str(count) == rows)
    with ThreadPoolExecutor(10) as pool:
        codes = list(pool.map(lambda i: users[i].call(
            "POST", f"/community/posts/{pid}/comments", json_body={"content": f"댓글 {i}"}).status, range(10)))
    count = author.call("GET", f"/community/posts/{pid}").data["commentCount"]
    check("10명이 동시에 댓글", "모두 201, commentCount=10", f"{sorted(set(codes))}, {count}",
          set(codes) == {201} and count == 10)
    for u in users:
        u.call("DELETE", "/users/account", json_body={"currentPassword": PASSWORD})
    after = author.call("GET", f"/community/posts/{pid}").data
    check("댓글·좋아요를 남긴 사용자가 탈퇴한 뒤 게시글", "조회 가능, 카운트 = 실제 데이터",
          f"likeCount={after['likeCount']}, commentCount={after['commentCount']}, 댓글 {len(after['comments'])}개",
          after["commentCount"] == len(after["comments"]) and after["likeCount"] == 0)
    author.call("DELETE", "/users/account", json_body={"currentPassword": PASSWORD})


def account_cleanup():
    author, _ = client("xc", profile=False)
    pid = author.call("POST", "/community/posts", form={"content": "남의 글"}).data["postId"]
    leaver, _ = client("xq", profile=False)
    leaver.call("POST", f"/community/posts/{pid}/likes")
    leaver.call("POST", f"/community/posts/{pid}/comments", json_body={"content": "곧 탈퇴"})
    own = leaver.call("POST", "/community/posts", form={"content": "내 글"},
                      files={"image": ("a.png", "image/png", PNG_BYTES)}).data["postId"]
    post_image = leaver.call("GET", f"/community/posts/{own}").data["imageUrl"]
    analysis = leaver.call("POST", "/diet/analyze", files={"image": ("rice.png", "image/png", PNG_BYTES)}).data
    item = analysis["items"][0]
    leaver.call("POST", "/diet/records", json_body={"analyzeId": analysis["analyzeId"], "mealType": "LUNCH", "eatenAt": now_iso(),
                "items": [{k: item[k] for k in ("itemId", "name", "weightGram", "calorie", "carb", "protein", "fat")}]})
    meal_image = leaver.call("GET", "/diet/records", params={"date": date.today().isoformat()}).data["records"][0]["thumbnailUrl"]
    fetch = lambda url: author.call("GET", "", raw_url=(url if url.startswith("http") else ORIGIN + url), auth=False).status
    check("탈퇴 전 사진 접근", "200, 200", [fetch(post_image), fetch(meal_image)], [fetch(post_image), fetch(meal_image)] == [200, 200])
    leaver.call("DELETE", "/users/account", json_body={"currentPassword": PASSWORD})
    after = author.call("GET", f"/community/posts/{pid}").data
    check("탈퇴자의 좋아요·댓글이 남의 글 카운터에서 빠짐", "likeCount=0, commentCount=0, 댓글 0개",
          f"likeCount={after['likeCount']}, commentCount={after['commentCount']}, 댓글 {len(after['comments'])}개",
          after["likeCount"] == 0 and after["commentCount"] == 0 and not after["comments"])
    check("탈퇴자의 사진 파일 삭제", "404, 404", [fetch(post_image), fetch(meal_image)], [fetch(post_image), fetch(meal_image)] == [404, 404])
    author.call("DELETE", "/users/account", json_body={"currentPassword": PASSWORD})


def concurrent_register():
    c = Client(log)
    user = new_user(c, "xr")
    with ThreadPoolExecutor(6) as pool:
        codes = list(pool.map(lambda _: Client(log).call("POST", "/auth/register", json_body=user, auth=False).status,
                              range(6)))
    rows = db_scalar(f"select count(*) from users where username={sql_str(user['username'])}")
    check("같은 아이디로 동시 가입", "1건만 201, 나머지 409(500 없음)", f"{sorted(codes)}, rows={rows}",
          codes.count(201) == 1 and rows == "1" and set(codes) <= {201, 409})
    c.login(user["username"])
    c.call("DELETE", "/users/account", json_body={"currentPassword": PASSWORD})


def special_input():
    c, _ = client("xs")
    emoji = "🍅🍚 김치찌개 👍"
    r = c.call("POST", "/community/posts", form={"content": emoji})
    pid = r.data["postId"] if r.status == 201 else None
    got = c.call("GET", f"/community/posts/{pid}").data["content"] if pid else None
    check("이모지 게시글 저장·조회", "원문 그대로", got, got == emoji)
    r = c.call("POST", "/diet/records/manual", json_body=meal(now_iso(), "🍱 도시락"))
    check("이모지 음식명 식단", "201", r.status, r.status == 201)
    r = c.call("POST", "/community/posts", form={"content": "가" * 5001})
    check("5001자 게시글", "400", r.status, r.status == 400)
    r = c.call("POST", "/community/posts", form={"content": "가" * 5000})
    check("5000자 게시글(경계값)", "201", r.status, r.status == 201)
    r = c.call("POST", f"/community/posts/{pid}/comments", json_body={"content": "가" * 1001})
    check("1001자 댓글", "400", r.status, r.status == 400)
    r = c.call("POST", "/diet/records/manual", json_body=meal(now_iso(), "가" * 101))
    check("101자 음식명", "400", r.status, r.status == 400)
    r = c.call("POST", "/fridge/ingredients", json_body={"ingredients": [{"name": "가" * 101, "quantity": 1, "unit": "개"}]})
    check("101자 재료명", "400", r.status, r.status == 400)
    r = c.call("POST", "/diet/records/manual", json_body=dict(meal(now_iso()), mealType="BRUNCH"))
    check("없는 끼니 값", "400", r.status, r.status == 400)
    r = c.call("POST", "/diet/records/manual", json_body=meal("어제 점심"))
    check("잘못된 식사 시각", "400", r.status, r.status == 400)
    r = c.call("POST", "/diet/records/manual", json_body=dict(meal(now_iso()), items=[dict(meal(now_iso())["items"][0], calorie=99999999)]))
    check("범위를 넘는 칼로리", "400", r.status, r.status == 400)
    r = c.call("GET", "/diet/foods/search", params={"keyword": "' OR 1=1 --"})
    check("검색어에 SQL 문구", "200, 결과 0건", r.data and len(r.data["foods"]), r.status == 200 and len(r.data["foods"]) == 0)
    r = c.call("GET", "/diet/foods/search", params={"keyword": "%"})
    check("검색어 % 하나", "500 없음", r.status, r.status < 500)
    r = c.call("GET", "/diet/foods/search", params={"keyword": "달걀", "page": -1})
    check("음수 page", "4xx", r.status, 400 <= r.status < 500)
    r = c.call("GET", "/diet/foods/search", params={"keyword": "달걀", "size": 0})
    check("size 0", "4xx", r.status, 400 <= r.status < 500)
    r = c.call("GET", "/diet/foods/search", params={"keyword": "달걀", "size": 100000})
    check("size 100000", "4xx 또는 제한 적용", r.status, r.status < 500)
    r = c.call("GET", "/statistics/weekly", params={"startDate": "0001-01-01"})
    check("아주 오래된 날짜 통계", "400", r.status, r.status == 400)
    r = c.call("GET", "/statistics/weekly", params={"startDate": "9999-12-31"})
    check("먼 미래 날짜 통계", "400", r.status, r.status == 400)
    for path, params in [("/statistics/daily", {"date": "9999-12-31"}), ("/diet/records", {"date": "9999-12-31"}),
                         ("/ai/feedback/daily", {"date": "9999-12-31"}), ("/ai/feedback/weekly", {"startDate": "9999-12-31"})]:
        r = c.call("GET", path, params=params)
        check(f"먼 미래 날짜 {path}", "400", r.status, r.status == 400)
    r = c.call("GET", "/diet/calendar", params={"year": 2026, "month": 2})
    check("2월 캘린더", "200", r.status, r.status == 200)
    r = c.call("PUT", "/users/profile", json_body={"weight": 0})
    check("몸무게 0", "400", r.status, r.status == 400)
    c.call("DELETE", "/users/account", json_body={"currentPassword": PASSWORD})


def big_uploads():
    c, _ = client("xu")
    just_under = b"\x89PNG\r\n\x1a\n" + b"0" * (10 * 1024 * 1024 - 100)
    r = c.call("POST", "/diet/analyze", files={"image": ("big.png", "image/png", just_under)})
    check("10MB 바로 아래 사진", "200", r.status, r.status == 200)
    over = b"0" * (10 * 1024 * 1024 + 1024)
    r = c.call("POST", "/diet/analyze", files={"image": ("over.png", "image/png", over)})
    check("10MB 초과 사진", "400", f"{r.status} {r.error_code}", r.status == 400)
    r = c.call("POST", "/diet/analyze", files={"image": ("empty.png", "image/png", b"")})
    check("빈 파일", "400", f"{r.status} {r.error_code}", r.status == 400)
    r = c.call("POST", "/community/posts", form={"content": "가짜 사진"}, files={"image": ("a.png", "text/html", b"<script>")})
    check("이미지가 아닌 형식으로 올린 파일", "400", r.status, r.status == 400)
    r = c.call("POST", "/diet/analyze", files={"image": ("../../evil.png", "image/png", PNG_BYTES)})
    check("경로 조작 파일명 업로드", "500 없음, 저장 경로 고정", r.status, r.status < 500)
    c.call("DELETE", "/users/account", json_body={"currentPassword": PASSWORD})


def date_boundary():
    """서버는 UTC로 저장하고 날짜 조회는 한국 시간(KST) 기준이므로 자정 경계가 맞는지 본다."""
    c, _ = client("xd")
    day = date(2026, 3, 10)
    # KST 3/10 00:30 = UTC 3/9 15:30, KST 3/10 23:30 = UTC 3/10 14:30
    c.call("POST", "/diet/records/manual", json_body=meal("2026-03-09T15:30:00Z", "자정 직후", 100))
    c.call("POST", "/diet/records/manual", json_body=meal("2026-03-10T14:30:00Z", "자정 직전", 200))
    # KST 3/9 23:59 = UTC 3/9 14:59, KST 3/11 00:00 = UTC 3/10 15:00 (둘 다 3/10이 아님)
    c.call("POST", "/diet/records/manual", json_body=meal("2026-03-09T14:59:00Z", "전날", 400))
    c.call("POST", "/diet/records/manual", json_body=meal("2026-03-10T15:00:00Z", "다음날", 800))
    r = c.call("GET", "/diet/records", params={"date": day.isoformat()})
    check("한국 시간 3/10 식단 목록", "2건, 300kcal", f"{len(r.data['records'])}건, {r.data['totalCalorie']}kcal",
          len(r.data["records"]) == 2 and r.data["totalCalorie"] == 300)
    r = c.call("GET", "/statistics/daily", params={"date": day.isoformat()})
    check("한국 시간 3/10 일간 통계", "300kcal", r.data["calorieConsumed"], r.data["calorieConsumed"] == 300)
    r = c.call("GET", "/diet/calendar", params={"year": 2026, "month": 3})
    expected = ["2026-03-09", "2026-03-10", "2026-03-11"]
    check("캘린더 날짜(KST 기준)", expected, r.data["recordedDates"], sorted(r.data["recordedDates"]) == expected)
    r = c.call("GET", "/statistics/weekly", params={"startDate": "2026-03-09"})
    daily = {p["date"]: p["calorieConsumed"] for p in r.data["daily"]}
    check("주간 통계 날짜별 합계", "3/9=400, 3/10=300, 3/11=800",
          [daily["2026-03-09"], daily["2026-03-10"], daily["2026-03-11"]],
          [daily["2026-03-09"], daily["2026-03-10"], daily["2026-03-11"]] == [400, 300, 800])
    c.call("DELETE", "/users/account", json_body={"currentPassword": PASSWORD})


def main():
    for fn in (concurrent_likes, account_cleanup, concurrent_register, special_input, big_uploads, date_boundary):
        print("==", fn.__name__)
        try:
            fn()
        except Exception as exc:
            check(f"{fn.__name__} 실행", "예외 없음", repr(exc), False)
    server_errors = sorted({f"{e.method} {e.path.split('?')[0]}" for e in log if e.status >= 500})
    summary = {"executedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "total": len(results),
               "passed": sum(r["passed"] for r in results), "requestCount": len(log), "serverErrors": server_errors}
    RESULT_DIR.mkdir(parents=True, exist_ok=True)
    (RESULT_DIR / "exploratory-result.json").write_text(
        json.dumps({"summary": summary, "cases": results}, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if summary["passed"] == summary["total"] and not server_errors else 1


if __name__ == "__main__":
    sys.exit(main())
