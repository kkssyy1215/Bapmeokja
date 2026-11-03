"""밥먹자 통합 테스트 (API ↔ DB): 실행 중인 서버의 57개 API를 정상·예외 케이스로 호출하고 DB 반영을 확인한다.

실행: python3 scripts/qa/integration_test.py
결과: docs/test/results/integration-result.json, integration-api-log.md
"""

from __future__ import annotations

import json
import sys
from dataclasses import asdict, dataclass
from datetime import date, datetime

from bapqa import (BASE, ORIGIN, PASSWORD, PNG_BYTES, RESULT_DIR, Client, db_scalar, new_user, now_iso,
                   sql_str, write_log_markdown)


@dataclass
class Case:
    case_id: str
    api_no: int
    endpoint: str
    kind: str          # 정상 / 예외 / DB검증
    title: str
    expected: str
    actual: str
    passed: bool


log = []
cases: list[Case] = []
counter = {"n": 0}


def check(api_no, endpoint, kind, title, expected, actual, passed):
    counter["n"] += 1
    cases.append(Case(f"IT-{counter['n']:03d}", api_no, endpoint, kind, title, expected, str(actual), bool(passed)))
    mark = "PASS" if passed else "FAIL"
    print(f"[{mark}] IT-{counter['n']:03d} #{api_no:02d} {endpoint} :: {title} (expected {expected}, got {actual})")


def status_case(api_no, endpoint, kind, title, res, expected_status, extra_ok=True, extra_desc=""):
    actual = f"{res.status}" + (f" {res.error_code}" if res.error_code else "")
    expected = f"{expected_status}" + (f" + {extra_desc}" if extra_desc else "")
    check(api_no, endpoint, kind, title, expected, actual, res.status == expected_status and extra_ok)


def main():
    today = date.today().isoformat()
    a = Client(log)   # 주 사용자
    b = Client(log)   # 권한 검증용 다른 사용자
    anon = Client(log)

    # ---------- 인증 (1~7) ----------
    ua = new_user(a, "a")
    ub = new_user(b, "b")
    r = anon.call("GET", "/auth/check/username", params={"value": ua["username"]}, auth=False)
    status_case(3, "GET /auth/check/username", "정상", "미사용 아이디 중복 확인", r, 200,
                r.data and r.data["isDuplicated"] is False, "isDuplicated=false")
    r = anon.call("GET", "/auth/check/email", params={"value": ua["email"]}, auth=False)
    status_case(4, "GET /auth/check/email", "정상", "미사용 이메일 중복 확인", r, 200,
                r.data and r.data["isDuplicated"] is False, "isDuplicated=false")
    r = anon.call("GET", "/auth/check/email", params={"value": "not-an-email"}, auth=False)
    status_case(4, "GET /auth/check/email", "예외", "이메일 형식 오류", r, 400)
    r = anon.call("GET", "/auth/check/nickname", params={"value": ua["nickname"]}, auth=False)
    status_case(5, "GET /auth/check/nickname", "정상", "미사용 닉네임 중복 확인", r, 200,
                r.data and r.data["isDuplicated"] is False, "isDuplicated=false")

    r = anon.call("POST", "/auth/register", json_body=ua, auth=False)
    status_case(2, "POST /auth/register", "정상", "회원가입", r, 201)
    cnt = db_scalar(f"select count(*) from users where username={sql_str(ua['username'])}")
    check(2, "POST /auth/register", "DB검증", "users 테이블에 사용자 저장", "1 row", cnt, cnt == "1")
    cnt = db_scalar("select count(*) from notification_settings n join users u on u.id=n.user_id "
                    f"where u.username={sql_str(ua['username'])}")
    check(2, "POST /auth/register", "DB검증", "기본 알림 설정 생성", "1 row", cnt, cnt == "1")
    anon.call("POST", "/auth/register", json_body=ub, auth=False)
    r = anon.call("POST", "/auth/register", json_body=ua, auth=False)
    status_case(2, "POST /auth/register", "예외", "중복 아이디 가입 거부", r, 409)
    weak = dict(new_user(a, "w"), password="abc", passwordConfirm="abc")
    r = anon.call("POST", "/auth/register", json_body=weak, auth=False)
    status_case(2, "POST /auth/register", "예외", "비밀번호 규칙 위반", r, 400)
    mismatch = dict(new_user(a, "m"), passwordConfirm="Other!1234")
    r = anon.call("POST", "/auth/register", json_body=mismatch, auth=False)
    status_case(2, "POST /auth/register", "예외", "비밀번호 확인 불일치", r, 400)
    no_terms = dict(new_user(a, "t"), agreeTerms=False)
    r = anon.call("POST", "/auth/register", json_body=no_terms, auth=False)
    status_case(2, "POST /auth/register", "예외", "약관 미동의", r, 400)
    r = anon.call("GET", "/auth/check/username", params={"value": ua["username"]}, auth=False)
    status_case(3, "GET /auth/check/username", "정상", "가입된 아이디는 중복으로 표시", r, 200,
                r.data and r.data["isDuplicated"] is True, "isDuplicated=true")

    r = a.login(ua["username"])
    status_case(1, "POST /auth/login", "정상", "로그인 및 토큰 발급", r, 200,
                r.data and r.data["isNewUser"] is True and bool(r.data["accessToken"]), "isNewUser=true")
    r = anon.call("POST", "/auth/login", json_body={"username": ua["username"], "password": "Wrong!1234"}, auth=False)
    status_case(1, "POST /auth/login", "예외", "잘못된 비밀번호", r, 401)
    b.login(ub["username"])

    old_refresh = a.refresh
    r = anon.call("POST", "/auth/token/refresh", json_body={"refreshToken": old_refresh}, auth=False)
    ok = r.status == 200 and r.data and r.data["refreshToken"] != old_refresh
    status_case(6, "POST /auth/token/refresh", "정상", "토큰 재발급(회전)", r, 200, ok, "새 refresh token")
    if r.status == 200:
        a.access, a.refresh = r.data["accessToken"], r.data["refreshToken"]
    r = anon.call("POST", "/auth/token/refresh", json_body={"refreshToken": old_refresh}, auth=False)
    status_case(6, "POST /auth/token/refresh", "예외", "이미 사용한 refresh token 재사용 거부", r, 401)
    r = anon.call("GET", "/users/profile", auth=False)
    status_case(9, "GET /users/profile", "예외", "토큰 없이 접근", r, 401)
    r = anon.call("GET", "/users/profile", token="invalid.token.value")
    status_case(9, "GET /users/profile", "예외", "위조 토큰 접근", r, 401)

    # ---------- 사용자 (8~16) ----------
    profile = {"gender": "F", "age": 23, "height": 162.0, "weight": 55.0, "activityLevel": "LIGHT", "goal": "MAINTAIN"}
    r = a.call("POST", "/users/profile/initial", json_body=profile)
    status_case(8, "POST /users/profile/initial", "정상", "초기 신체정보 등록 및 목표 계산", r, 200,
                r.data and r.data["dailyCalorieGoal"] > 0, "목표 칼로리 > 0")
    goal = db_scalar(f"select daily_calorie_goal from users where username={sql_str(ua['username'])}")
    check(8, "POST /users/profile/initial", "DB검증", "users.daily_calorie_goal 저장", "> 0", goal,
          goal.isdigit() and int(goal) > 0)
    r = a.call("POST", "/users/profile/initial", json_body=dict(profile, age=0))
    status_case(8, "POST /users/profile/initial", "예외", "나이 범위 오류", r, 400)
    b.call("POST", "/users/profile/initial", json_body=dict(profile, gender="M", height=175.0, weight=70.0))

    r = a.call("GET", "/nothing/here")
    status_case(9, "GET /users/profile", "예외", "없는 주소는 404(BUG-006 회귀)", r, 404)
    r = a.call("DELETE", "/users/profile")
    status_case(9, "GET /users/profile", "예외", "지원하지 않는 메서드는 405(BUG-006 회귀)", r, 405)
    r = a.call("POST", "/diet/analyze", json_body={"image": "x"})
    status_case(17, "POST /diet/analyze", "예외", "multipart가 아닌 요청은 415(BUG-006 회귀)", r, 415)
    r = a.call("GET", "/users/profile")
    status_case(9, "GET /users/profile", "정상", "프로필 조회", r, 200,
                r.data and r.data.get("nickname") == ua["nickname"], "닉네임 일치")
    r = a.call("PUT", "/users/profile", json_body={"weight": 53.5, "goal": "LOSE"})
    status_case(10, "PUT /users/profile", "정상", "프로필 수정 및 목표 재계산", r, 200)
    w = db_scalar(f"select weight from users where username={sql_str(ua['username'])}")
    check(10, "PUT /users/profile", "DB검증", "users.weight 갱신", "53.5", w, w.startswith("53.5"))
    r = a.call("PUT", "/users/settings/notification",
               json_body={"pushEnabled": True, "breakfastTime": "08:30", "lunchTime": "12:30", "dinnerTime": "19:00"})
    status_case(11, "PUT /users/settings/notification", "정상", "알림 설정 수정", r, 200)
    r = a.call("PUT", "/users/settings/notification", json_body={"breakfastTime": "25:99"})
    status_case(11, "PUT /users/settings/notification", "예외", "시각 형식 오류", r, 400)
    r = a.call("PUT", "/users/settings/budget", json_body={"diningOut": 12000, "homeCooking": 8000})
    status_case(12, "PUT /users/settings/budget", "정상", "예산 설정", r, 200)
    bud = db_scalar(f"select default_budget_dining_out from users where username={sql_str(ua['username'])}")
    check(12, "PUT /users/settings/budget", "DB검증", "외식 예산 저장", "12000", bud, bud == "12000")
    r = a.call("PUT", "/users/settings/budget", json_body={"diningOut": -1})
    status_case(12, "PUT /users/settings/budget", "예외", "음수 예산 거부", r, 400)
    r = a.call("POST", "/users/devices", json_body={"deviceToken": "qa-device-token-" + ua["username"], "platform": "IOS"})
    status_case(14, "POST /users/devices", "정상", "푸시 기기 등록", r, 200)
    r = a.call("POST", "/users/devices", json_body={"deviceToken": "x", "platform": "WINDOWS"})
    status_case(14, "POST /users/devices", "예외", "지원하지 않는 플랫폼", r, 400)

    # ---------- 홈·식단 (17~26, 44) ----------
    r = a.call("GET", "/home/dashboard")
    base_consumed = r.data["calorieConsumed"] if r.status == 200 else None
    status_case(44, "GET /home/dashboard", "정상", "오늘 대시보드 조회(기록 전)", r, 200,
                base_consumed == 0, "calorieConsumed=0")

    r = a.call("POST", "/diet/analyze", files={"image": ("salad.png", "image/png", PNG_BYTES)})
    analysis = r.data if r.status == 200 else None
    status_case(17, "POST /diet/analyze", "정상", "음식 사진 분석", r, 200,
                analysis and len(analysis["items"]) > 0, "items ≥ 1")
    cnt = db_scalar(f"select count(*) from ai_analysis_items where analysis_id={sql_str(analysis['analyzeId'])}") if analysis else "0"
    check(17, "POST /diet/analyze", "DB검증", "ai_analyses/ai_analysis_items 저장",
          f"{len(analysis['items']) if analysis else '?'} rows", cnt, analysis and cnt == str(len(analysis["items"])))
    r = a.call("POST", "/diet/analyze", form={"note": "no image"})
    status_case(17, "POST /diet/analyze", "예외", "이미지 누락", r, 400)
    r = a.call("POST", "/diet/analyze", files={"image": ("anim.gif", "image/gif", b"GIF89a")})
    status_case(17, "POST /diet/analyze", "예외", "지원하지 않는 형식(gif)", r, 400)

    item_id = analysis["items"][0]["itemId"] if analysis else "none"
    r = a.call("GET", f"/diet/items/{item_id}")
    status_case(18, "GET /diet/items/{itemId}", "정상", "분석 항목 상세 조회", r, 200)
    r = b.call("GET", f"/diet/items/{item_id}")
    check(18, "GET /diet/items/{itemId}", "예외", "다른 사용자의 분석 항목 접근 차단", "403 또는 404",
          r.status, r.status in (403, 404))
    r = a.call("GET", "/diet/items/item_does_not_exist")
    status_case(18, "GET /diet/items/{itemId}", "예외", "없는 항목", r, 404)

    items = [{"itemId": i["itemId"], "name": i["name"], "weightGram": i["weightGram"], "calorie": i["calorie"],
              "carb": i["carb"], "protein": i["protein"], "fat": i["fat"]} for i in (analysis or {"items": []})["items"]]
    total_kcal = sum(i["calorie"] for i in items)
    r = a.call("POST", "/diet/records", json_body={"analyzeId": analysis["analyzeId"] if analysis else None,
                                                   "mealType": "LUNCH", "eatenAt": now_iso(), "items": items})
    rec1 = r.data["recordId"] if r.status == 201 else None
    status_case(19, "POST /diet/records", "정상", "분석 결과로 식단 저장", r, 201)
    kcal = db_scalar(f"select round(total_calorie) from diet_records where id={sql_str(rec1 or '')}")
    check(19, "POST /diet/records", "DB검증", "diet_records.total_calorie = 항목 합계", str(round(total_kcal)), kcal,
          kcal == str(round(total_kcal)))
    r = b.call("POST", "/diet/records", json_body={"analyzeId": analysis["analyzeId"] if analysis else None,
                                                   "mealType": "LUNCH", "eatenAt": now_iso(), "items": items})
    check(19, "POST /diet/records", "예외", "다른 사용자의 analyzeId로 저장 차단", "403 또는 404",
          r.status, r.status in (403, 404))

    manual = {"mealType": "BREAKFAST", "eatenAt": now_iso(), "items": [
        {"name": "그릭요거트", "weightGram": 150, "calorie": 140, "carb": 8, "protein": 15, "fat": 5}]}
    r = a.call("POST", "/diet/records/manual", json_body=manual)
    rec2 = r.data["recordId"] if r.status == 201 else None
    status_case(20, "POST /diet/records/manual", "정상", "직접 입력 식단 저장", r, 201)
    r = a.call("POST", "/diet/records/manual", json_body=dict(manual, items=[]))
    status_case(20, "POST /diet/records/manual", "예외", "음식 항목 없음", r, 400)
    r = a.call("POST", "/diet/records/manual", json_body=dict(manual, items=[dict(manual["items"][0], calorie=-10)]))
    status_case(20, "POST /diet/records/manual", "예외", "음수 칼로리", r, 400)

    now = datetime.now()
    r = a.call("GET", "/diet/calendar", params={"year": now.year, "month": now.month})
    status_case(21, "GET /diet/calendar", "정상", "월간 캘린더에 오늘 표시", r, 200,
                r.data and today in r.data["recordedDates"], f"{today} 포함")
    r = a.call("GET", "/diet/calendar", params={"year": now.year, "month": 13})
    status_case(21, "GET /diet/calendar", "예외", "잘못된 월(13)", r, 400)
    r = a.call("GET", "/diet/records", params={"date": today})
    status_case(22, "GET /diet/records", "정상", "날짜별 식단 조회", r, 200,
                r.data and len(r.data["records"]) == 2, "records 2건")
    r = a.call("GET", "/diet/records", params={"date": "2026-13-40"})
    status_case(22, "GET /diet/records", "예외", "날짜 형식 오류", r, 400)
    r = a.call("GET", "/diet/calendar", params={"year": "abc", "month": now.month})
    status_case(21, "GET /diet/calendar", "예외", "숫자가 아닌 연도(BUG-001 회귀)", r, 400)
    r = a.call("GET", f"/diet/records/{rec1}")
    status_case(23, "GET /diet/records/{recordId}", "정상", "식단 상세 조회", r, 200)
    r = b.call("GET", f"/diet/records/{rec1}")
    check(23, "GET /diet/records/{recordId}", "예외", "다른 사용자의 식단 조회 차단", "403 또는 404",
          r.status, r.status in (403, 404))

    upd = {"mealType": "DINNER", "eatenAt": now_iso(), "items": [
        {"name": "그릭요거트", "weightGram": 200, "calorie": 190, "carb": 10, "protein": 20, "fat": 7}]}
    r = a.call("PUT", f"/diet/records/{rec2}", json_body=upd)
    status_case(24, "PUT /diet/records/{recordId}", "정상", "식단 수정", r, 200)
    meal = db_scalar(f"select concat(meal_type,'/',round(total_calorie)) from diet_records where id={sql_str(rec2 or '')}")
    check(24, "PUT /diet/records/{recordId}", "DB검증", "끼니·칼로리 갱신", "DINNER/190", meal, meal == "DINNER/190")
    r = b.call("PUT", f"/diet/records/{rec2}", json_body=upd)
    check(24, "PUT /diet/records/{recordId}", "예외", "다른 사용자의 식단 수정 차단", "403 또는 404",
          r.status, r.status in (403, 404))

    r = a.call("GET", "/diet/foods/search", params={"keyword": "닭"})
    status_case(26, "GET /diet/foods/search", "정상", "음식 검색", r, 200,
                r.data and len(r.data["foods"]) > 0, "결과 ≥ 1")
    r = a.call("GET", "/diet/foods/search", params={"keyword": "존재하지않는음식명xyz"})
    status_case(26, "GET /diet/foods/search", "정상", "검색 결과 없음", r, 200,
                r.data is not None and len(r.data["foods"]) == 0, "빈 목록")

    r = a.call("GET", "/home/dashboard")
    status_case(44, "GET /home/dashboard", "정상", "기록 후 섭취 칼로리 반영", r, 200,
                r.data and r.data["calorieConsumed"] == round(total_kcal) + 190,
                f"calorieConsumed={round(total_kcal) + 190}")

    # ---------- 통계·피드백 (27~29, 45~47) ----------
    monday = (now.date().toordinal() - now.weekday())
    week_start = date.fromordinal(monday).isoformat()
    for no, path, params in [(45, "/statistics/daily", {"date": today}), (46, "/statistics/weekly", {"startDate": week_start}),
                             (47, "/statistics/monthly", {"year": now.year, "month": now.month}),
                             (27, "/ai/feedback/daily", {"date": today}), (28, "/ai/feedback/weekly", {"startDate": week_start}),
                             (29, "/ai/feedback/monthly", {"year": now.year, "month": now.month})]:
        r = a.call("GET", path, params=params)
        status_case(no, f"GET {path}", "정상", "기간별 조회", r, 200, r.data is not None, "data 존재")
    r = a.call("GET", "/statistics/daily", params={"date": "yesterday"})
    status_case(45, "GET /statistics/daily", "예외", "날짜 형식 오류", r, 400)
    r = a.call("GET", "/ai/feedback/monthly", params={"year": now.year, "month": 0})
    status_case(29, "GET /ai/feedback/monthly", "예외", "잘못된 월(0)", r, 400)

    # ---------- 메뉴 추천·외식 (48~52) ----------
    r = a.call("GET", "/menu/recommend/summary")
    status_case(48, "GET /menu/recommend/summary", "정상", "잔여 영양·예산 요약", r, 200,
                r.data and r.data["defaultBudget"]["diningOut"] == 12000, "예산 12000 반영")
    r = a.call("GET", "/menu/recommend/dining-out", params={"budget": 15000})
    cats = r.data["recommendedCategories"] if r.status == 200 else []
    status_case(49, "GET /menu/recommend/dining-out", "정상", "외식 카테고리 추천", r, 200, len(cats) > 0, "카테고리 ≥ 1")
    cat_id = cats[0]["categoryId"] if cats else "cat_001"
    r = a.call("GET", f"/menu/categories/{cat_id}/items", params={"budget": 15000})
    menu_items = r.data["items"] if r.status == 200 else []
    status_case(50, "GET /menu/categories/{categoryId}/items", "정상", "카테고리 메뉴 목록", r, 200,
                len(menu_items) > 0, "메뉴 ≥ 1")
    r = a.call("GET", "/menu/categories/cat_none/items")
    status_case(50, "GET /menu/categories/{categoryId}/items", "예외", "없는 카테고리", r, 404)
    mid = menu_items[0]["itemId"] if menu_items else "menu_001"
    r = a.call("GET", f"/menu/items/{mid}")
    status_case(51, "GET /menu/items/{itemId}", "정상", "메뉴 상세·재료", r, 200,
                r.data and len(r.data["ingredients"]) > 0, "재료 ≥ 1")
    r = a.call("GET", "/menu/items/menu_none")
    status_case(51, "GET /menu/items/{itemId}", "예외", "없는 메뉴", r, 404)
    near = {"lat": 37.4985, "lng": 127.0280, "categoryId": "cat_001", "radius": 1000}
    r = a.call("GET", "/menu/nearby-stores", params=near)
    status_case(52, "GET /menu/nearby-stores", "예외", "위치 동의 전 주변 매장 조회 차단", r, 403)
    r = a.call("POST", "/users/location-consent", json_body={"agreed": True})
    status_case(13, "POST /users/location-consent", "정상", "위치 정보 동의", r, 200,
                r.data and r.data["locationConsentGranted"] is True, "granted=true")
    r = a.call("POST", "/users/location-consent", json_body={})
    status_case(13, "POST /users/location-consent", "예외", "agreed 누락", r, 400)
    r = a.call("GET", "/menu/nearby-stores", params=near)
    status_case(52, "GET /menu/nearby-stores", "정상", "동의 후 주변 매장 조회", r, 200,
                r.data and len(r.data["stores"]) > 0, "매장 ≥ 1")
    r = a.call("GET", "/menu/nearby-stores", params=dict(near, lat=123))
    status_case(52, "GET /menu/nearby-stores", "예외", "위도 범위 오류", r, 400)
    r = a.call("GET", "/menu/nearby-stores", params=dict(near, lat="north"))
    status_case(52, "GET /menu/nearby-stores", "예외", "숫자가 아닌 위도(BUG-001 회귀)", r, 400)

    # ---------- 냉장고 (30~33) ----------
    r = a.call("POST", "/fridge/ingredients", json_body={"ingredients": [
        {"name": "닭가슴살", "quantity": 2, "unit": "팩", "expiryDate": today},
        {"name": "두부", "quantity": 1, "unit": "모"},
        {"name": "현미밥", "quantity": 1, "unit": "공기"}]})
    status_case(30, "POST /fridge/ingredients", "정상", "재료 3개 등록", r, 201,
                r.data and r.data["registeredCount"] == 3, "registeredCount=3")
    cnt = db_scalar("select count(*) from fridge_ingredients f join users u on u.id=f.user_id "
                    f"where u.username={sql_str(ua['username'])}")
    check(30, "POST /fridge/ingredients", "DB검증", "fridge_ingredients 3행 저장", "3", cnt, cnt == "3")
    r = a.call("POST", "/fridge/ingredients", json_body={"ingredients": [{"name": "우유", "quantity": 0, "unit": "개"}]})
    status_case(30, "POST /fridge/ingredients", "예외", "수량 0 거부", r, 400)
    r = a.call("GET", "/fridge/ingredients")
    ings = r.data["ingredients"] if r.status == 200 else []
    status_case(31, "GET /fridge/ingredients", "정상", "재료 목록·유통기한 임박 표시", r, 200,
                any(i["isExpiringSoon"] for i in ings), "임박 재료 표시")
    ing_id = next((i["ingredientId"] for i in ings if i["name"] == "두부"), "none")
    r = a.call("PUT", f"/fridge/ingredients/{ing_id}", json_body={"quantity": 3, "unit": "모"})
    status_case(32, "PUT /fridge/ingredients/{ingredientId}", "정상", "재료 수량 수정", r, 200)
    q = db_scalar(f"select round(quantity) from fridge_ingredients where id={sql_str(ing_id)}")
    check(32, "PUT /fridge/ingredients/{ingredientId}", "DB검증", "quantity 갱신", "3", q, q == "3")
    r = b.call("PUT", f"/fridge/ingredients/{ing_id}", json_body={"quantity": 9, "unit": "모"})
    check(32, "PUT /fridge/ingredients/{ingredientId}", "예외", "다른 사용자의 재료 수정 차단", "403 또는 404",
          r.status, r.status in (403, 404))

    # ---------- 집밥·레시피·장보기 (53~57) ----------
    r = a.call("GET", "/menu/recommend/home-cooking", params={"budget": 10000})
    hcats = r.data["recommendedCategories"] if r.status == 200 else []
    status_case(53, "GET /menu/recommend/home-cooking", "정상", "집밥 카테고리 추천", r, 200, len(hcats) > 0, "카테고리 ≥ 1")
    hcat = hcats[0]["categoryId"] if hcats else "hcat_001"
    r = a.call("GET", "/menu/recipes", params={"categoryId": hcat, "budget": 10000})
    recipes = r.data["recipes"] if r.status == 200 else []
    status_case(54, "GET /menu/recipes", "정상", "카테고리 레시피 목록", r, 200, len(recipes) > 0, "레시피 ≥ 1")
    r = a.call("GET", "/menu/recipes", params={"categoryId": "hcat_none"})
    status_case(54, "GET /menu/recipes", "예외", "없는 카테고리", r, 404)
    rid = recipes[0]["recipeId"] if recipes else "recipe_001"
    r = a.call("GET", f"/menu/recipes/{rid}")
    status_case(55, "GET /menu/recipes/{recipeId}", "정상", "레시피 상세(재료·대체재·단계)", r, 200,
                r.data and len(r.data.get("steps", [])) > 0, "steps ≥ 1")
    r = a.call("GET", "/menu/recipes/recipe_none")
    status_case(55, "GET /menu/recipes/{recipeId}", "예외", "없는 레시피", r, 404)
    r = a.call("POST", "/menu/recommend/leftover")
    status_case(56, "POST /menu/recommend/leftover", "정상", "냉장고 재료 기반 추천", r, 200,
                r.data and len(r.data["recipes"]) > 0, "레시피 ≥ 1")
    r = a.call("GET", f"/menu/recipes/{rid}/shopping-list")
    status_case(57, "GET /menu/recipes/{recipeId}/shopping-list", "정상", "부족 재료·예상 금액", r, 200, r.data is not None)
    r = a.call("GET", "/menu/recipes/recipe_none/shopping-list")
    status_case(57, "GET /menu/recipes/{recipeId}/shopping-list", "예외", "없는 레시피", r, 404)

    r = b.call("DELETE", f"/fridge/ingredients/{ing_id}")
    check(33, "DELETE /fridge/ingredients/{ingredientId}", "예외", "다른 사용자의 재료 삭제 차단", "403 또는 404",
          r.status, r.status in (403, 404))
    r = a.call("DELETE", f"/fridge/ingredients/{ing_id}")
    status_case(33, "DELETE /fridge/ingredients/{ingredientId}", "정상", "재료 삭제", r, 200)
    cnt = db_scalar(f"select count(*) from fridge_ingredients where id={sql_str(ing_id)}")
    check(33, "DELETE /fridge/ingredients/{ingredientId}", "DB검증", "행 삭제", "0", cnt, cnt == "0")

    # ---------- 커뮤니티 (34~43) ----------
    r = a.call("POST", "/community/analyze-image", files={"image": ("rice.png", "image/png", PNG_BYTES)})
    status_case(35, "POST /community/analyze-image", "정상", "게시글용 사진 영양 추정", r, 200,
                r.data and r.data["calorie"] > 0, "calorie > 0")
    r = a.call("POST", "/community/analyze-image", files={"image": ("a.txt", "text/plain", b"hello")})
    status_case(35, "POST /community/analyze-image", "예외", "이미지가 아닌 파일", r, 400)
    r = a.call("POST", "/community/posts", form={"content": "QA 통합 테스트 게시글", "calorie": 620, "carb": 86,
                                                  "protein": 27, "fat": 18},
               files={"image": ("bap.png", "image/png", PNG_BYTES)})
    post_id = r.data["postId"] if r.status == 201 else None
    status_case(36, "POST /community/posts", "정상", "사진 포함 게시글 등록", r, 201)
    cnt = db_scalar(f"select count(*) from posts where id={sql_str(post_id or '')} and image_url is not null")
    check(36, "POST /community/posts", "DB검증", "posts 저장(image_url 포함)", "1", cnt, cnt == "1")
    r = a.call("POST", "/community/posts", form={"content": "   "})
    status_case(36, "POST /community/posts", "예외", "빈 내용", r, 400)
    r = b.call("GET", "/community/posts", params={"page": 0, "size": 20})
    status_case(34, "GET /community/posts", "정상", "게시글 목록(다른 사용자 시점)", r, 200,
                r.data and any(p["postId"] == post_id for p in r.data["posts"]), "작성 글 포함")
    r = b.call("GET", "/community/posts", params={"page": 0, "size": 999})
    status_case(34, "GET /community/posts", "예외", "페이지 크기 초과(999)", r, 400)
    r = b.call("GET", "/community/posts", params={"page": "first"})
    status_case(34, "GET /community/posts", "예외", "숫자가 아닌 page(BUG-001 회귀)", r, 400)
    r = b.call("GET", f"/community/posts/{post_id}")
    image_url = r.data.get("imageUrl") if r.status == 200 else None
    status_case(37, "GET /community/posts/{postId}", "정상", "게시글 상세", r, 200, bool(image_url), "imageUrl 존재")
    if image_url:
        img_url = image_url if image_url.startswith("http") else ORIGIN + image_url
        r = anon.call("GET", "", raw_url=img_url, auth=False)
        status_case(43, "GET /v1/uploads/community/{fileName}", "정상", "업로드 이미지 제공", r, 200,
                    r.raw[:8] == PNG_BYTES[:8], "PNG 바이트 일치")
    r = anon.call("GET", "", raw_url=BASE + "/uploads/community/..%2F..%2Fetc%2Fpasswd", auth=False)
    check(43, "GET /v1/uploads/community/{fileName}", "예외", "경로 조작 파일명 차단", "400 또는 404",
          r.status, r.status in (400, 404))
    r = b.call("PUT", f"/community/posts/{post_id}", json_body={"content": "남의 글 수정 시도"})
    check(38, "PUT /community/posts/{postId}", "예외", "다른 사용자의 게시글 수정 차단", "403 또는 404",
          r.status, r.status in (403, 404))
    r = a.call("PUT", f"/community/posts/{post_id}", json_body={"content": "QA 수정된 게시글"})
    status_case(38, "PUT /community/posts/{postId}", "정상", "본인 게시글 수정", r, 200)
    r = b.call("POST", f"/community/posts/{post_id}/comments", json_body={"content": "맛있어 보여요"})
    comment_id = r.data["commentId"] if r.status in (200, 201) else None
    check(40, "POST /community/posts/{postId}/comments", "정상", "댓글 등록", "201", r.status, r.status == 201)
    r = b.call("POST", f"/community/posts/{post_id}/comments", json_body={"content": ""})
    status_case(40, "POST /community/posts/{postId}/comments", "예외", "빈 댓글", r, 400)
    r = b.call("POST", f"/community/posts/{post_id}/likes")
    status_case(42, "POST /community/posts/{postId}/likes", "정상", "좋아요 등록", r, 200,
                r.data and r.data["isLiked"] is True and r.data["likeCount"] == 1, "isLiked=true, count=1")
    r = b.call("POST", f"/community/posts/{post_id}/likes")
    status_case(42, "POST /community/posts/{postId}/likes", "정상", "좋아요 취소(토글)", r, 200,
                r.data and r.data["isLiked"] is False and r.data["likeCount"] == 0, "isLiked=false, count=0")
    r = a.call("GET", f"/community/posts/{post_id}")
    status_case(37, "GET /community/posts/{postId}", "정상", "댓글 수 반영", r, 200,
                r.data and r.data["commentCount"] == 1, "commentCount=1")
    r = a.call("DELETE", f"/community/posts/{post_id}/comments/{comment_id}")
    check(41, "DELETE /community/posts/{postId}/comments/{commentId}", "예외", "타인 댓글 삭제 차단", "403 또는 404",
          r.status, r.status in (403, 404))
    r = b.call("DELETE", f"/community/posts/{post_id}/comments/{comment_id}")
    status_case(41, "DELETE /community/posts/{postId}/comments/{commentId}", "정상", "본인 댓글 삭제", r, 200)
    r = b.call("DELETE", f"/community/posts/{post_id}")
    check(39, "DELETE /community/posts/{postId}", "예외", "다른 사용자의 게시글 삭제 차단", "403 또는 404",
          r.status, r.status in (403, 404))
    r = a.call("DELETE", f"/community/posts/{post_id}")
    status_case(39, "DELETE /community/posts/{postId}", "정상", "본인 게시글 삭제", r, 200)
    r = a.call("GET", f"/community/posts/{post_id}")
    status_case(37, "GET /community/posts/{postId}", "예외", "삭제된 게시글 조회", r, 404)

    # ---------- 식단 삭제 (25) ----------
    r = b.call("DELETE", f"/diet/records/{rec1}")
    check(25, "DELETE /diet/records/{recordId}", "예외", "다른 사용자의 식단 삭제 차단", "403 또는 404",
          r.status, r.status in (403, 404))
    r = a.call("DELETE", f"/diet/records/{rec1}")
    status_case(25, "DELETE /diet/records/{recordId}", "정상", "식단 삭제", r, 200)
    r = a.call("GET", f"/diet/records/{rec1}")
    status_case(25, "DELETE /diet/records/{recordId}", "정상", "삭제 후 조회 시 404", r, 404)

    # ---------- 비밀번호·로그아웃·탈퇴 (15, 7, 16) ----------
    new_pw = "Qa!changed5678"
    r = a.call("PUT", "/users/password", json_body={"currentPassword": "Wrong!0000", "newPassword": new_pw,
                                                    "newPasswordConfirm": new_pw})
    status_case(15, "PUT /users/password", "예외", "현재 비밀번호 불일치", r, 401)
    r = a.call("PUT", "/users/password", json_body={"currentPassword": PASSWORD, "newPassword": new_pw,
                                                    "newPasswordConfirm": "Different!1"})
    status_case(15, "PUT /users/password", "예외", "새 비밀번호 확인 불일치", r, 400)
    pre_refresh = a.refresh
    r = a.call("PUT", "/users/password", json_body={"currentPassword": PASSWORD, "newPassword": new_pw,
                                                    "newPasswordConfirm": new_pw})
    status_case(15, "PUT /users/password", "정상", "비밀번호 변경", r, 200)
    r = anon.call("POST", "/auth/token/refresh", json_body={"refreshToken": pre_refresh}, auth=False)
    status_case(15, "PUT /users/password", "정상", "변경 후 기존 refresh token 폐기", r, 401)
    r = a.login(ua["username"], new_pw)
    status_case(1, "POST /auth/login", "정상", "새 비밀번호로 로그인", r, 200)

    r = b.call("POST", "/auth/logout")
    status_case(7, "POST /auth/logout", "정상", "로그아웃", r, 200)
    r = anon.call("POST", "/auth/token/refresh", json_body={"refreshToken": b.refresh}, auth=False)
    status_case(7, "POST /auth/logout", "정상", "로그아웃 후 refresh token 무효", r, 401)

    r = a.call("DELETE", "/users/account", json_body={"currentPassword": "Wrong!0000"})
    status_case(16, "DELETE /users/account", "예외", "비밀번호 불일치 시 탈퇴 거부", r, 401)
    r = a.call("DELETE", "/users/account", json_body={"currentPassword": new_pw})
    status_case(16, "DELETE /users/account", "정상", "회원 탈퇴", r, 200)
    leftovers = db_scalar(
        "select (select count(*) from users where username=" + sql_str(ua["username"]) + ")"
        "+(select count(*) from diet_records where id=" + sql_str(rec2 or "") + ")")
    check(16, "DELETE /users/account", "DB검증", "사용자·종속 식단 데이터 삭제", "0", leftovers, leftovers == "0")
    r = anon.call("POST", "/auth/login", json_body={"username": ua["username"], "password": new_pw}, auth=False)
    status_case(16, "DELETE /users/account", "정상", "탈퇴 후 로그인 불가", r, 401)

    b.login(ub["username"])
    b.call("DELETE", "/users/account", json_body={"currentPassword": PASSWORD})

    # ---------- 결과 저장 ----------
    RESULT_DIR.mkdir(parents=True, exist_ok=True)
    covered = sorted({c.api_no for c in cases})
    api_pass = {n: all(c.passed for c in cases if c.api_no == n) for n in covered}
    summary = {
        "executedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "server": BASE,
        "apiTotal": 57,
        "apiCovered": len(covered),
        "apiAllPassed": sum(api_pass.values()),
        "caseTotal": len(cases),
        "casePassed": sum(c.passed for c in cases),
        "byKind": {k: {"total": sum(c.kind == k for c in cases), "passed": sum(c.kind == k and c.passed for c in cases)}
                   for k in ("정상", "예외", "DB검증")},
        "failedApis": [n for n, ok in api_pass.items() if not ok],
        "missingApis": [n for n in range(1, 58) if n not in covered],
    }
    (RESULT_DIR / "integration-result.json").write_text(
        json.dumps({"summary": summary, "cases": [asdict(c) for c in cases]}, ensure_ascii=False, indent=2),
        encoding="utf-8")
    write_log_markdown(RESULT_DIR / "integration-api-log.md", "통합 테스트 API 요청·응답 로그", log)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if summary["casePassed"] == summary["caseTotal"] else 1


if __name__ == "__main__":
    sys.exit(main())
