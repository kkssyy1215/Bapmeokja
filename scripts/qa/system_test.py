"""밥먹자 시스템 테스트: 사용자 시나리오 단위로 여러 기능을 연결해 전체 흐름(End-to-End)을 검증한다.

각 시나리오는 실제 사용자가 앱에서 하는 순서대로 API를 호출하고, 앞 단계의 결과가
다음 화면(대시보드·통계·추천 등)에 올바르게 반영되는지 확인한다.

실행: python3 scripts/qa/system_test.py
결과: docs/test/results/system-result.json, system-api-log.md
"""

from __future__ import annotations

import json
import sys
from dataclasses import asdict, dataclass, field
from datetime import date, datetime

from bapqa import BASE, ORIGIN, PASSWORD, PNG_BYTES, RESULT_DIR, Client, new_user, now_iso

log = []


@dataclass
class Step:
    no: int
    action: str
    expected: str
    actual: str
    passed: bool


@dataclass
class Scenario:
    scenario_id: str
    name: str
    feature: str
    precondition: str
    steps: list[Step] = field(default_factory=list)

    def step(self, action, expected, actual, passed):
        self.steps.append(Step(len(self.steps) + 1, action, expected, str(actual), bool(passed)))
        print(f"  [{'PASS' if passed else 'FAIL'}] {self.scenario_id}-{len(self.steps)} {action} (expected {expected}, got {actual})")

    @property
    def passed(self):
        return bool(self.steps) and all(s.passed for s in self.steps)


def signup_and_login(sc: Scenario, client: Client, tag: str, profile=True) -> dict:
    user = new_user(client, tag)
    r = client.call("POST", "/auth/register", json_body=user, auth=False)
    sc.step("회원가입", "201", r.status, r.status == 201)
    r = client.login(user["username"])
    sc.step("로그인", "200", r.status, r.status == 200)
    if profile:
        r = client.call("POST", "/users/profile/initial", json_body={
            "gender": "F", "age": 24, "height": 163.0, "weight": 56.0, "activityLevel": "MODERATE", "goal": "MAINTAIN"})
        sc.step("초기 신체정보 등록", "200", r.status, r.status == 200)
    return user


def cleanup(client: Client, password=PASSWORD):
    if client.access:
        client.call("DELETE", "/users/account", json_body={"currentPassword": password})


def s1_onboarding() -> Scenario:
    sc = Scenario("ST-01", "신규 사용자 가입부터 홈 화면 진입까지", "F01 인증 · F02 신체정보 · F03 홈",
                  "앱 최초 실행, 계정 없음")
    c = Client(log)
    user = new_user(c, "s1")
    for field_name, path in (("username", "username"), ("email", "email"), ("nickname", "nickname")):
        r = c.call("GET", f"/auth/check/{path}", params={"value": user[field_name]}, auth=False)
        sc.step(f"{field_name} 중복 확인", "사용 가능", r.data, r.status == 200 and r.data["isDuplicated"] is False)
    r = c.call("POST", "/auth/register", json_body=user, auth=False)
    sc.step("회원가입", "201", r.status, r.status == 201)
    r = c.login(user["username"])
    sc.step("가입 직후 자동 로그인 → 신규 사용자 판정", "isNewUser=true",
            r.data and r.data["isNewUser"], r.status == 200 and r.data["isNewUser"] is True)
    r = c.call("POST", "/users/profile/initial", json_body={
        "gender": "M", "age": 25, "height": 175.0, "weight": 72.0, "activityLevel": "LIGHT", "goal": "LOSE"})
    goal = r.data["dailyCalorieGoal"] if r.status == 200 else None
    sc.step("신체정보 입력 → 목표 칼로리 계산", "1200~3500 kcal", goal, goal is not None and 1200 <= goal <= 3500)
    r = c.login(user["username"])
    sc.step("재로그인 시 기존 사용자로 판정", "isNewUser=false", r.data and r.data["isNewUser"],
            r.status == 200 and r.data["isNewUser"] is False)
    r = c.call("GET", "/home/dashboard")
    sc.step("홈 대시보드 목표 칼로리 = 계산값", f"calorieGoal={goal}", r.data and r.data["calorieGoal"],
            r.status == 200 and r.data["calorieGoal"] == goal)
    sc.step("홈 대시보드 오늘 섭취량 0", "calorieConsumed=0", r.data and r.data["calorieConsumed"],
            r.status == 200 and r.data["calorieConsumed"] == 0)
    cleanup(c)
    return sc


def s2_photo_record() -> Scenario:
    sc = Scenario("ST-02", "사진으로 식단 기록 후 홈·캘린더·통계 반영", "F04 식단 기록 · F05 조회 · F06 통계",
                  "로그인 + 신체정보 등록 완료")
    c = Client(log)
    signup_and_login(sc, c, "s2")
    today = date.today().isoformat()
    r = c.call("POST", "/diet/analyze", files={"image": ("chicken_lunch.png", "image/png", PNG_BYTES)})
    analysis = r.data if r.status == 200 else None
    sc.step("음식 사진 업로드 → 분석 결과", "음식 항목 ≥ 1", analysis and len(analysis["items"]),
            bool(analysis and analysis["items"]))
    item = analysis["items"][0] if analysis else {"itemId": "none"}
    r = c.call("GET", f"/diet/items/{item['itemId']}")
    sc.step("인식 음식 상세 영양정보 확인", "200", r.status, r.status == 200)
    edited = [dict(i) for i in (analysis or {"items": []})["items"]]
    if edited:
        edited[0]["weightGram"] = round(edited[0]["weightGram"] * 1.5, 1)
        edited[0]["calorie"] = round(edited[0]["calorie"] * 1.5)
    payload_items = [{k: i[k] for k in ("itemId", "name", "weightGram", "calorie", "carb", "protein", "fat")} for i in edited]
    total = sum(i["calorie"] for i in payload_items)
    r = c.call("POST", "/diet/records", json_body={"analyzeId": analysis and analysis["analyzeId"],
                                                   "mealType": "LUNCH", "eatenAt": now_iso(), "items": payload_items})
    sc.step("양을 1.5배로 수정 후 저장", f"201, totalCalorie={total}", r.data and r.data.get("totalCalorie"),
            r.status == 201 and r.data["totalCalorie"] == total)
    r = c.call("GET", "/home/dashboard")
    sc.step("홈 대시보드 섭취량 반영", f"calorieConsumed={total}", r.data and r.data["calorieConsumed"],
            r.status == 200 and r.data["calorieConsumed"] == total)
    now = datetime.now()
    r = c.call("GET", "/diet/calendar", params={"year": now.year, "month": now.month})
    sc.step("캘린더에 오늘 날짜 표시", f"{today} 포함", r.data and r.data["recordedDates"],
            r.status == 200 and today in r.data["recordedDates"])
    r = c.call("GET", "/diet/records", params={"date": today})
    sc.step("오늘 식단 목록에 점심 1건", "LUNCH 1건", r.data and [x["mealType"] for x in r.data["records"]],
            r.status == 200 and [x["mealType"] for x in r.data["records"]] == ["LUNCH"])
    r = c.call("GET", "/statistics/daily", params={"date": today})
    body = json.dumps(r.data, ensure_ascii=False) if r.data else ""
    sc.step("일간 통계에 섭취 칼로리 반영", f"{total} 포함", "포함" if str(total) in body else body[:80],
            r.status == 200 and str(total) in body)
    cleanup(c)
    return sc


def s3_manual_edit_delete() -> Scenario:
    sc = Scenario("ST-03", "직접 입력 기록의 수정·삭제", "F04 수동 입력 · F05 수정/삭제", "로그인 + 신체정보 등록 완료")
    c = Client(log)
    signup_and_login(sc, c, "s3")
    today = date.today().isoformat()
    r = c.call("GET", "/diet/foods/search", params={"keyword": "달걀"})
    foods = r.data["foods"] if r.status == 200 else []
    sc.step("음식 검색 '달걀'", "결과 ≥ 1", len(foods), len(foods) > 0)
    f = foods[0] if foods else {"name": "달걀", "calorie": 143, "carb": 0.7, "protein": 12.6, "fat": 9.5}
    item = {"name": f["name"], "weightGram": 100, "calorie": f.get("calorie", 143), "carb": f.get("carb", 0.7),
            "protein": f.get("protein", 12.6), "fat": f.get("fat", 9.5)}
    r = c.call("POST", "/diet/records/manual", json_body={"mealType": "BREAKFAST", "eatenAt": now_iso(), "items": [item]})
    rid = r.data["recordId"] if r.status == 201 else None
    sc.step("검색 결과로 아침 기록", "201", r.status, r.status == 201)
    r = c.call("PUT", f"/diet/records/{rid}", json_body={"mealType": "DINNER", "eatenAt": now_iso(),
                                                          "items": [dict(item, weightGram=200, calorie=item["calorie"] * 2)]})
    sc.step("끼니·양 수정", "200", r.status, r.status == 200)
    r = c.call("GET", f"/diet/records/{rid}")
    body = r.data or {}
    sc.step("상세 화면에 수정 내용 반영", f"DINNER, {round(item['calorie'] * 2)}kcal",
            f"{body.get('mealType')}, {body.get('totalCalorie')}",
            r.status == 200 and body.get("mealType") == "DINNER" and round(body.get("totalCalorie", 0)) == round(item["calorie"] * 2))
    r = c.call("DELETE", f"/diet/records/{rid}")
    sc.step("기록 삭제", "200", r.status, r.status == 200)
    r = c.call("GET", "/diet/records", params={"date": today})
    sc.step("목록에서 사라짐", "0건", r.data and len(r.data["records"]), r.status == 200 and len(r.data["records"]) == 0)
    r = c.call("GET", "/home/dashboard")
    sc.step("홈 섭취량 원복", "calorieConsumed=0", r.data and r.data["calorieConsumed"],
            r.status == 200 and r.data["calorieConsumed"] == 0)
    cleanup(c)
    return sc


def s4_stats_feedback() -> Scenario:
    sc = Scenario("ST-04", "기록 누적 후 기간별 통계·AI 피드백 확인", "F06 통계 · F07 피드백", "오늘 아침·점심·저녁 기록")
    c = Client(log)
    signup_and_login(sc, c, "s4")
    meals = [("BREAKFAST", 350, 50, 15, 10), ("LUNCH", 650, 80, 35, 20), ("DINNER", 550, 60, 30, 18)]
    for meal, kcal, carb, protein, fat in meals:
        r = c.call("POST", "/diet/records/manual", json_body={"mealType": meal, "eatenAt": now_iso(), "items": [
            {"name": f"{meal} 식사", "weightGram": 300, "calorie": kcal, "carb": carb, "protein": protein, "fat": fat}]})
        sc.step(f"{meal} 기록", "201", r.status, r.status == 201)
    now = datetime.now()
    today = now.date()
    week_start = date.fromordinal(today.toordinal() - today.weekday()).isoformat()
    for label, path, params in [("일간 통계", "/statistics/daily", {"date": today.isoformat()}),
                                ("주간 통계", "/statistics/weekly", {"startDate": week_start}),
                                ("월간 통계", "/statistics/monthly", {"year": now.year, "month": now.month})]:
        r = c.call("GET", path, params=params)
        sc.step(f"{label} 조회", "200 + 1550kcal 반영", r.status,
                r.status == 200 and "1550" in json.dumps(r.data))
    for label, path, params in [("일간 피드백", "/ai/feedback/daily", {"date": today.isoformat()}),
                                ("주간 피드백", "/ai/feedback/weekly", {"startDate": week_start}),
                                ("월간 피드백", "/ai/feedback/monthly", {"year": now.year, "month": now.month})]:
        r = c.call("GET", path, params=params)
        text = json.dumps(r.data, ensure_ascii=False) if r.data else ""
        sc.step(f"{label} 문구 생성", "200 + 피드백 문구", r.status, r.status == 200 and len(text) > 20)
    cleanup(c)
    return sc


def s5_dining_out() -> Scenario:
    sc = Scenario("ST-05", "남은 영양 기반 외식 추천과 주변 매장 찾기", "F08-A 외식 추천", "로그인 + 점심 기록 + 예산 설정")
    c = Client(log)
    signup_and_login(sc, c, "s5")
    c.call("POST", "/diet/records/manual", json_body={"mealType": "LUNCH", "eatenAt": now_iso(), "items": [
        {"name": "김치찌개", "weightGram": 400, "calorie": 500, "carb": 40, "protein": 25, "fat": 25}]})
    r = c.call("PUT", "/users/settings/budget", json_body={"diningOut": 11000, "homeCooking": 7000})
    sc.step("외식 예산 11,000원 설정", "200", r.status, r.status == 200)
    r = c.call("GET", "/menu/recommend/summary")
    sc.step("추천 메인: 잔여 칼로리·예산 표시", "예산 11000, 섭취 500",
            r.data and f"{r.data['defaultBudget']['diningOut']}/{r.data['calorieConsumed']}",
            r.status == 200 and r.data["defaultBudget"]["diningOut"] == 11000 and r.data["calorieConsumed"] == 500)
    r = c.call("GET", "/menu/recommend/dining-out")
    cats = r.data["recommendedCategories"] if r.status == 200 else []
    sc.step("외식 카테고리 추천 + 추천 사유", "카테고리 ≥ 1, 사유 존재", len(cats),
            bool(cats) and all(x.get("reason") for x in cats))
    sc.step("예산 미입력 시 설정 예산 적용", "appliedBudget=11000", r.data and r.data["appliedBudget"],
            r.status == 200 and r.data["appliedBudget"] == 11000)
    cat = next((x["categoryId"] for x in cats if x["categoryId"] == "cat_001"), cats[0]["categoryId"] if cats else "cat_001")
    r = c.call("GET", f"/menu/categories/{cat}/items", params={"budget": 11000})
    items = r.data["items"] if r.status == 200 else []
    sc.step("카테고리 메뉴 목록", "메뉴 ≥ 1", len(items), len(items) > 0)
    r = c.call("GET", f"/menu/items/{items[0]['itemId'] if items else 'menu_001'}")
    sc.step("메뉴 상세·재료 확인", "재료 ≥ 1", r.data and len(r.data["ingredients"]),
            r.status == 200 and len(r.data["ingredients"]) > 0)
    near = {"lat": 37.4985, "lng": 127.0280, "categoryId": "cat_001", "radius": 1000}
    r = c.call("GET", "/menu/nearby-stores", params=near)
    sc.step("위치 동의 전 주변 매장 → 동의 요구", "403", r.status, r.status == 403)
    r = c.call("POST", "/users/location-consent", json_body={"agreed": True})
    sc.step("위치 정보 이용 동의", "200", r.status, r.status == 200)
    r = c.call("GET", "/menu/nearby-stores", params=near)
    stores = r.data["stores"] if r.status == 200 else []
    sc.step("강남역 반경 1km 매장 조회", "매장 ≥ 1", len(stores), len(stores) > 0)
    cleanup(c)
    return sc


def s6_home_cooking() -> Scenario:
    sc = Scenario("ST-06", "냉장고 재료로 집밥 추천 → 레시피 → 장보기", "F08-B 집밥 · 냉장고 · 장보기", "로그인 완료")
    c = Client(log)
    signup_and_login(sc, c, "s6")
    today = date.today().isoformat()
    r = c.call("POST", "/fridge/ingredients", json_body={"ingredients": [
        {"name": "닭가슴살", "quantity": 1, "unit": "팩", "expiryDate": today},
        {"name": "계란", "quantity": 6, "unit": "개"}, {"name": "밥", "quantity": 1, "unit": "공기"}]})
    sc.step("냉장고 재료 3개 등록", "201, 3개", r.data and r.data["registeredCount"],
            r.status == 201 and r.data["registeredCount"] == 3)
    r = c.call("GET", "/fridge/ingredients")
    ings = r.data["ingredients"] if r.status == 200 else []
    soon = [i["name"] for i in ings if i["isExpiringSoon"]]
    sc.step("유통기한 임박 재료 표시", "닭가슴살", soon, "닭가슴살" in soon)
    r = c.call("POST", "/menu/recommend/leftover")
    recs = r.data["recipes"] if r.status == 200 else []
    sc.step("남은 재료 기반 레시피 추천", "레시피 ≥ 1", [x["name"] for x in recs][:3], len(recs) > 0)
    r = c.call("GET", "/menu/recommend/home-cooking", params={"budget": 8000})
    cats = r.data["recommendedCategories"] if r.status == 200 else []
    sc.step("집밥 카테고리 추천(예산 8000)", "카테고리 ≥ 1", len(cats), len(cats) > 0)
    r = c.call("GET", "/menu/recipes", params={"categoryId": cats[0]["categoryId"] if cats else "hcat_001"})
    recipes = r.data["recipes"] if r.status == 200 else []
    sc.step("카테고리 레시피 목록", "레시피 ≥ 1", len(recipes), len(recipes) > 0)
    rid = recipes[0]["recipeId"] if recipes else "recipe_001"
    r = c.call("GET", f"/menu/recipes/{rid}")
    d = r.data or {}
    sc.step("레시피 상세: 재료·대체재·조리 단계", "재료/단계 ≥ 1",
            f"재료 {len(d.get('ingredients', []))}, 단계 {len(d.get('steps', []))}",
            r.status == 200 and d.get("ingredients") and d.get("steps"))
    r = c.call("GET", f"/menu/recipes/{rid}/shopping-list")
    sc.step("장보기 리스트(부족 재료·예상 금액)", "200", r.status, r.status == 200 and r.data is not None)
    egg = next((i["ingredientId"] for i in ings if i["name"] == "계란"), None)
    r = c.call("PUT", f"/fridge/ingredients/{egg}", json_body={"quantity": 2, "unit": "개"})
    sc.step("요리 후 계란 수량 6 → 2", "200", r.status, r.status == 200)
    chicken = next((i["ingredientId"] for i in ings if i["name"] == "닭가슴살"), None)
    r = c.call("DELETE", f"/fridge/ingredients/{chicken}")
    sc.step("다 쓴 닭가슴살 삭제", "200", r.status, r.status == 200)
    r = c.call("GET", "/fridge/ingredients")
    names = {i["name"]: i["quantity"] for i in (r.data or {}).get("ingredients", [])}
    sc.step("냉장고 최종 상태", "계란 2, 닭가슴살 없음", names, names.get("계란") == 2 and "닭가슴살" not in names)
    cleanup(c)
    return sc


def s7_community() -> Scenario:
    sc = Scenario("ST-07", "커뮤니티 글 작성·댓글·좋아요·삭제 (2인)", "F09 커뮤니티", "사용자 A, B 로그인")
    a, b = Client(log), Client(log)
    signup_and_login(sc, a, "s7a", profile=False)
    signup_and_login(sc, b, "s7b", profile=False)
    r = a.call("POST", "/community/analyze-image", files={"image": ("salad.png", "image/png", PNG_BYTES)})
    nut = r.data if r.status == 200 else {}
    sc.step("A: 사진 영양 추정", "200 + 칼로리", nut.get("calorie"), r.status == 200 and nut.get("calorie", 0) > 0)
    r = a.call("POST", "/community/posts", form={"content": "오늘 점심 샐러드!", "calorie": nut.get("calorie", 300),
                                                  "carb": nut.get("carb", 20), "protein": nut.get("protein", 20),
                                                  "fat": nut.get("fat", 10)},
               files={"image": ("salad.png", "image/png", PNG_BYTES)})
    pid = r.data["postId"] if r.status == 201 else None
    sc.step("A: 사진·영양정보 포함 게시글 등록", "201", r.status, r.status == 201)
    r = b.call("GET", "/community/posts")
    sc.step("B: 목록에서 A의 글 확인", "포함", r.status, r.status == 200 and any(p["postId"] == pid for p in r.data["posts"]))
    r = b.call("GET", f"/community/posts/{pid}")
    img = (r.data or {}).get("imageUrl")
    sc.step("B: 상세 화면", "본문·이미지 표시", bool(img), r.status == 200 and bool(img))
    if img:
        r = b.call("GET", "", raw_url=img if img.startswith("http") else ORIGIN + img, auth=False)
        sc.step("B: 게시글 이미지 로드", "200 image", r.status, r.status == 200)
    r = b.call("POST", f"/community/posts/{pid}/comments", json_body={"content": "레시피 공유해주세요!"})
    cid = r.data["commentId"] if r.status == 201 else None
    sc.step("B: 댓글 작성", "201", r.status, r.status == 201)
    r = b.call("POST", f"/community/posts/{pid}/likes")
    sc.step("B: 좋아요", "isLiked=true, 1", r.data, r.status == 200 and r.data["isLiked"] and r.data["likeCount"] == 1)
    r = a.call("GET", f"/community/posts/{pid}")
    d = r.data or {}
    sc.step("A: 댓글·좋아요 수 확인", "댓글 1, 좋아요 1", f"댓글 {d.get('commentCount')}, 좋아요 {d.get('likeCount')}",
            d.get("commentCount") == 1 and d.get("likeCount") == 1)
    r = b.call("PUT", f"/community/posts/{pid}", json_body={"content": "B가 수정"})
    sc.step("B: 남의 글 수정 시도 → 차단", "403", r.status, r.status == 403)
    r = a.call("PUT", f"/community/posts/{pid}", json_body={"content": "오늘 점심 샐러드! (드레싱 추가)"})
    sc.step("A: 본인 글 수정", "200", r.status, r.status == 200)
    r = b.call("DELETE", f"/community/posts/{pid}/comments/{cid}")
    sc.step("B: 본인 댓글 삭제", "200", r.status, r.status == 200)
    r = a.call("DELETE", f"/community/posts/{pid}")
    sc.step("A: 글 삭제", "200", r.status, r.status == 200)
    r = b.call("GET", f"/community/posts/{pid}")
    sc.step("B: 삭제된 글 접근", "404", r.status, r.status == 404)
    cleanup(a)
    cleanup(b)
    return sc


def s8_account() -> Scenario:
    sc = Scenario("ST-08", "설정: 프로필·알림·비밀번호 변경·탈퇴", "F10 설정/프로필", "로그인 + 신체정보 등록 완료")
    c = Client(log)
    user = signup_and_login(sc, c, "s8")
    before = c.call("GET", "/home/dashboard").data["calorieGoal"]
    r = c.call("PUT", "/users/profile", json_body={"nickname": "바뀐닉" + user["username"][-4:], "goal": "LOSE"})
    sc.step("프로필 수정(감량 목표)", "200", r.status, r.status == 200)
    after = c.call("GET", "/home/dashboard").data["calorieGoal"]
    sc.step("홈 목표 칼로리 재계산", f"{before} → 더 낮은 값", f"{before} → {after}", after < before)
    r = c.call("PUT", "/users/settings/notification", json_body={"pushEnabled": False, "dinnerTime": "18:30"})
    sc.step("알림 설정 변경", "200", r.status, r.status == 200)
    r = c.call("GET", "/users/profile")
    sc.step("프로필 조회에 반영", "닉네임 변경", r.data and r.data["nickname"],
            r.status == 200 and r.data["nickname"].startswith("바뀐닉"))
    new_pw = "Changed!5678"
    r = c.call("PUT", "/users/password", json_body={"currentPassword": PASSWORD, "newPassword": new_pw,
                                                    "newPasswordConfirm": new_pw})
    sc.step("비밀번호 변경", "200", r.status, r.status == 200)
    r = Client(log).login(user["username"], PASSWORD)
    sc.step("기존 비밀번호 로그인 실패", "401", r.status, r.status == 401)
    r = c.login(user["username"], new_pw)
    sc.step("새 비밀번호 로그인", "200", r.status, r.status == 200)
    r = c.call("DELETE", "/users/account", json_body={"currentPassword": new_pw})
    sc.step("회원 탈퇴", "200", r.status, r.status == 200)
    r = Client(log).login(user["username"], new_pw)
    sc.step("탈퇴 계정 로그인 불가", "401", r.status, r.status == 401)
    return sc


def s9_session() -> Scenario:
    sc = Scenario("ST-09", "세션 유지·만료·로그아웃 보안 흐름", "F01 인증(JWT)", "로그인 완료")
    c = Client(log)
    user = signup_and_login(sc, c, "s9", profile=False)
    r = c.call("GET", "/users/profile", auth=False)
    sc.step("토큰 없이 보호 API 접근", "401", r.status, r.status == 401)
    first = c.refresh
    r = c.call("POST", "/auth/token/refresh", json_body={"refreshToken": first}, auth=False)
    ok = r.status == 200
    if ok:
        c.access, c.refresh = r.data["accessToken"], r.data["refreshToken"]
    sc.step("access 만료 상황 → refresh로 재발급", "200", r.status, ok)
    r = c.call("GET", "/users/profile")
    sc.step("재발급 토큰으로 API 계속 사용", "200", r.status, r.status == 200)
    r = c.call("POST", "/auth/token/refresh", json_body={"refreshToken": first}, auth=False)
    sc.step("탈취된 이전 refresh 재사용 차단", "401", r.status, r.status == 401)
    r = c.call("POST", "/auth/logout")
    sc.step("로그아웃", "200", r.status, r.status == 200)
    r = c.call("POST", "/auth/token/refresh", json_body={"refreshToken": c.refresh}, auth=False)
    sc.step("로그아웃 후 refresh 불가", "401", r.status, r.status == 401)
    c.login(user["username"])  # 테스트 계정 정리를 위해 다시 로그인
    cleanup(c)
    return sc


def main():
    scenarios = []
    for fn in (s1_onboarding, s2_photo_record, s3_manual_edit_delete, s4_stats_feedback, s5_dining_out,
               s6_home_cooking, s7_community, s8_account, s9_session):
        print(f"== {fn.__name__}")
        try:
            scenarios.append(fn())
        except Exception as exc:  # 시나리오 하나가 예외로 멈춰도 나머지는 계속 실행
            sc = Scenario(f"ST-{len(scenarios) + 1:02d}", fn.__name__, "-", "-")
            sc.step("시나리오 실행", "예외 없음", repr(exc), False)
            scenarios.append(sc)
    steps = [s for sc in scenarios for s in sc.steps]
    summary = {
        "executedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "server": BASE,
        "scenarioTotal": len(scenarios),
        "scenarioPassed": sum(sc.passed for sc in scenarios),
        "stepTotal": len(steps),
        "stepPassed": sum(s.passed for s in steps),
        "failedScenarios": [sc.scenario_id for sc in scenarios if not sc.passed],
    }
    RESULT_DIR.mkdir(parents=True, exist_ok=True)
    (RESULT_DIR / "system-result.json").write_text(json.dumps(
        {"summary": summary, "scenarios": [dict(asdict(sc), passed=sc.passed) for sc in scenarios]},
        ensure_ascii=False, indent=2), encoding="utf-8")
    from bapqa import write_log_markdown
    write_log_markdown(RESULT_DIR / "system-api-log.md", "시스템 테스트 API 요청·응답 로그", log, limit=800)
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if summary["scenarioPassed"] == summary["scenarioTotal"] else 1


if __name__ == "__main__":
    sys.exit(main())
