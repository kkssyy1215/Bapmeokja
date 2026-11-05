#!/usr/bin/env python3
"""졸업전시 시연용 계정과 11월 한 달치 데이터를 API로 만든다.

사용법:
  python3 scripts/qa/seed_showcase.py --api https://bapmeokja-api.vercel.app/v1

비밀번호는 실행할 때 직접 입력하며 어디에도 저장하지 않는다.
이미 데이터가 있는 계정이면 중복으로 넣지 않고 확인만 한다.
"""
from __future__ import annotations

import argparse
import getpass
import json
import os
import random
import secrets
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

KST = timezone(timedelta(hours=9))
YEAR, MONTH, LAST_DAY = 2026, 11, 30
USERNAME, NICKNAME, NAME = "admin", "관리자", "관리자"
EMAIL = "admin@bapmeokja.example"
PHOTO = Path(__file__).resolve().parents[2] / "e2e" / "fixtures" / "meal.png"

BREAKFAST = [
    ("그릭요거트와 블루베리", 200, 240, 24, 16, 8), ("현미밥과 달걀찜", 280, 390, 58, 17, 9),
    ("통밀 토스트와 달걀", 180, 340, 34, 18, 13), ("바나나 오트밀", 250, 310, 56, 10, 6),
    ("두부 샐러드", 220, 260, 16, 19, 13), ("닭가슴살 샌드위치", 210, 420, 42, 30, 13),
]
LUNCH = [
    ("닭가슴살 현미 포케", 380, 520, 64, 38, 13), ("소고기 비빔밥", 450, 610, 78, 27, 21),
    ("두부 된장찌개 정식", 480, 490, 65, 25, 15), ("연어 아보카도 포케", 390, 560, 55, 32, 22),
    ("참치 김치 볶음밥", 400, 510, 70, 27, 13), ("에그마요 통밀 샌드위치", 240, 380, 42, 18, 14),
    ("소고기 쌀국수", 600, 450, 65, 25, 8), ("제육볶음 정식", 500, 720, 80, 34, 28),
]
DINNER = [
    ("닭가슴살 달걀 볶음밥", 400, 535, 66, 39, 12), ("두부 애호박 된장찌개", 420, 315, 27, 24, 13),
    ("연어 샐러드", 300, 455, 25, 32, 27), ("순두부찌개와 잡곡밥", 480, 540, 62, 26, 18),
    ("훈제오리 단호박 샐러드", 320, 470, 39, 29, 24), ("김치찌개와 현미밥", 500, 610, 70, 30, 22),
    ("닭가슴살 시저 샐러드", 300, 405, 29, 38, 16),
]
SNACK = [("바나나", 120, 107, 27, 1, 0), ("아몬드 한 줌", 30, 180, 6, 6, 15), ("두유", 190, 120, 10, 7, 5), ("삶은 달걀 2개", 100, 155, 1, 13, 10)]
LATE = [("양념치킨 반 마리", 400, 980, 52, 58, 60), ("치즈 피자 두 조각", 260, 760, 84, 30, 32), ("떡볶이와 튀김", 450, 850, 130, 18, 28)]

FRIDGE = [("두부", 1, "모", 2), ("달걀", 8, "개", 12), ("애호박", 1, "개", 3), ("닭가슴살", 3, "팩", 9), ("현미밥", 2, "개", 30), ("양파", 2, "개", 14), ("김치", 500, "g", 25), ("참치 통조림", 2, "개", None)]
HELPERS = [("showfriend1", "토마토러버"), ("showfriend2", "오늘도집밥"), ("showfriend3", "건강한한끼")]


class ApiError(Exception):
    def __init__(self, status: int, code: str, message: str):
        super().__init__(f"{status} {code} {message}")
        self.status, self.code = status, code


class Api:
    def __init__(self, base: str):
        self.base = base.rstrip("/")
        self.token: str | None = None

    def request(self, method: str, path: str, body=None, query=None, form=None, photo: Path | None = None):
        url = self.base + path + ("?" + urllib.parse.urlencode(query) if query else "")
        headers = {"Authorization": f"Bearer {self.token}"} if self.token else {}
        data = None
        if form is not None:
            boundary = uuid.uuid4().hex
            parts = [f'--{boundary}\r\nContent-Disposition: form-data; name="{k}"\r\n\r\n{v}\r\n'.encode() for k, v in form.items()]
            if photo:
                parts.append(f'--{boundary}\r\nContent-Disposition: form-data; name="image"; filename="{photo.name}"\r\nContent-Type: image/png\r\n\r\n'.encode() + photo.read_bytes() + b"\r\n")
            data = b"".join(parts) + f"--{boundary}--\r\n".encode()
            headers["Content-Type"] = f"multipart/form-data; boundary={boundary}"
        elif body is not None:
            data = json.dumps(body).encode()
            headers["Content-Type"] = "application/json"
        last = None
        # 배포 서버는 잠들었다가 깨어나는 동안 503을 줄 수 있어 몇 번 다시 시도한다.
        for attempt in range(6):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=headers, method=method), timeout=60) as response:
                    payload = json.load(response)
                    return payload.get("data")
            except urllib.error.HTTPError as error:
                try:
                    payload = json.load(error)
                except ValueError:
                    payload = {}
                last = ApiError(error.code, payload.get("errorCode", ""), payload.get("message", ""))
                if error.code not in (429, 502, 503, 504):
                    raise last from None
            except (urllib.error.URLError, TimeoutError) as error:
                last = ApiError(0, "NET", str(error))
            time.sleep(3 + attempt * 3)
        raise last


def iso(day: int, hour: int, minute: int) -> str:
    return datetime(YEAR, MONTH, day, hour, minute, tzinfo=KST).astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def item(food) -> dict:
    name, weight, calorie, carb, protein, fat = food
    return {"name": name, "weightGram": weight, "calorie": calorie, "carb": carb, "protein": protein, "fat": fat}


def plan_day(rng: random.Random, day: int):
    """부족, 균형, 과식이 섞이도록 하루 식사를 고른다. 같은 입력이면 항상 같은 결과가 나온다."""
    kind = ("low", "good", "good", "over", "good", "good", "low")[day % 7]
    meals = []
    if kind != "low":
        meals.append(("BREAKFAST", 8, rng.randint(0, 40), rng.choice(BREAKFAST)))
    meals.append(("LUNCH", 12, rng.randint(10, 50), rng.choice(LUNCH)))
    meals.append(("DINNER", 18, rng.randint(20, 55), rng.choice(DINNER)))
    if kind == "good" and rng.random() < 0.5:
        meals.append(("SNACK", 15, rng.randint(0, 40), rng.choice(SNACK)))
    if kind == "over":
        meals.append(("SNACK", 21, rng.randint(0, 40), rng.choice(LATE)))
    return meals


def register_and_login(api: Api, username: str, nickname: str, name: str, email: str, password: str) -> None:
    free = api.request("GET", "/auth/check/username", query={"value": username})
    if not free["isDuplicated"]:
        api.request("POST", "/auth/register", body={"username": username, "nickname": nickname, "name": name, "email": email, "password": password, "passwordConfirm": password, "agreeTerms": True, "agreePrivacy": True})
    api.token = api.request("POST", "/auth/login", body={"username": username, "password": password})["accessToken"]


def seed_community(base: str, api: Api) -> int:
    helpers = []
    for username, nickname in HELPERS:
        client = Api(base)
        # 다른 사용자 역할만 하는 계정이다. 다시 로그인할 일이 없어 비밀번호를 저장하지 않는다.
        if client.request("GET", "/auth/check/username", query={"value": username})["isDuplicated"]:
            return 0
        register_and_login(client, username, nickname, nickname, f"{username}@bapmeokja.example", f"Show!{secrets.token_urlsafe(12)}9a")
        client.request("POST", "/users/profile/initial", body={"gender": "F", "age": 24, "height": 165, "weight": 56, "activityLevel": "MODERATE", "goal": "MAINTAIN"})
        helpers.append(client)
    friend1, friend2, friend3 = helpers

    def post(client: Api, content: str, day: int, photo: bool = False, nutrition: dict | None = None) -> str:
        form = {"content": content, "eatenAt": iso(day, 12, 30), **(nutrition or {})}
        return client.request("POST", "/community/posts", form=form, photo=PHOTO if photo and PHOTO.exists() else None)["postId"]

    def comment(client: Api, post_id: str, content: str, parent: str | None = None) -> str:
        body = {"content": content, **({"parentCommentId": parent} if parent else {})}
        return client.request("POST", f"/community/posts/{post_id}/comments", body=body)["commentId"]

    first = post(api, "오늘 점심은 쌀국수! 사진 한 장으로 칼로리까지 바로 기록했어요.", 3, photo=True, nutrition={"calorie": 450, "carb": 65, "protein": 25, "fat": 8})
    second = post(api, "이번 주 단백질 목표를 처음으로 달성했어요. 닭가슴살 포케 추천합니다.", 5)
    third = post(friend1, "냉장고에 남은 두부랑 애호박으로 된장찌개 끓였어요. 재료비 5천원도 안 들어요.", 4)
    fourth = post(friend2, "자취생 한 끼 예산 1만원으로 일주일 버티기 도전 중입니다.", 2)
    fifth = post(friend3, "운동 후에는 고구마랑 달걀 조합이 제일 좋더라고요.", 1, photo=True, nutrition={"calorie": 380, "carb": 48, "protein": 20, "fat": 10})

    root = comment(friend1, first, "국물까지 드셨나요? 저도 오늘 먹어 볼게요!")
    comment(api, first, "네, 국물은 조금만 먹었어요!", root)
    comment(friend2, first, "저도 저 메뉴 좋아해요.", root)
    comment(friend3, first, "칼로리가 생각보다 낮네요.")
    root = comment(friend2, second, "축하해요! 비결이 뭔가요?")
    comment(api, second, "추천 탭에서 부족한 영양소를 보고 골랐어요.", root)
    root = comment(api, third, "재료비 정말 저렴하네요. 레시피 궁금해요!")
    comment(friend1, third, "두부랑 애호박 넣고 된장만 풀면 끝이에요.", root)
    comment(friend3, fourth, "저도 같이 도전할게요.")
    comment(api, fifth, "저도 운동 끝나고 먹어 봐야겠어요.")

    for client, targets in ((api, [third, fourth, fifth]), (friend1, [first, second, fourth]), (friend2, [first, third]), (friend3, [first, second, third])):
        for target in targets:
            client.request("POST", f"/community/posts/{target}/likes")
    return 5


def main() -> int:
    parser = argparse.ArgumentParser(description="시연용 계정과 11월 데이터를 만든다.")
    parser.add_argument("--api", default="http://127.0.0.1:8080/v1", help="API 주소 (기본: 로컬 서버)")
    args = parser.parse_args()

    print(f"대상 서버: {args.api}")
    password = os.environ.get("SHOWCASE_PASSWORD") or getpass.getpass("관리자 계정 비밀번호(영문·숫자·특수문자 포함 8자 이상): ")
    api = Api(args.api)
    try:
        register_and_login(api, USERNAME, NICKNAME, NAME, EMAIL, password)
    except ApiError as error:
        print(f"계정을 준비하지 못했어요: {error}")
        return 1
    print("1/5 계정 준비 완료")

    try:
        api.request("POST", "/users/profile/initial", body={"gender": "F", "age": 23, "height": 163, "weight": 55, "activityLevel": "LIGHT", "goal": "MAINTAIN"})
    except ApiError:
        pass  # 이미 프로필이 있으면 그대로 쓴다.
    api.request("PUT", "/users/settings/budget", body={"diningOut": 10000, "homeCooking": 8000})

    if api.request("GET", "/diet/calendar", query={"year": YEAR, "month": MONTH})["recordedDates"]:
        print("2/5 11월 식단이 이미 있어 건너뜀")
    else:
        rng = random.Random(20261105)
        total = 0
        for day in range(1, LAST_DAY + 1):
            for meal_type, hour, minute, food in plan_day(rng, day):
                api.request("POST", "/diet/records/manual", body={"mealType": meal_type, "eatenAt": iso(day, hour, minute), "items": [item(food)]})
                total += 1
            print(f"\r2/5 식단 입력 중 {day}/{LAST_DAY}일", end="", flush=True)
        print(f"\r2/5 식단 {total}건 입력 완료        ")

    if api.request("GET", "/fridge/ingredients")["ingredients"]:
        print("3/5 냉장고 재료가 이미 있어 건너뜀")
    else:
        today = date.today()
        api.request("POST", "/fridge/ingredients", body={"ingredients": [{"name": n, "quantity": q, "unit": u, **({"expiryDate": (today + timedelta(days=d)).isoformat()} if d else {})} for n, q, u, d in FRIDGE]})
        print(f"3/5 냉장고 재료 {len(FRIDGE)}개 입력 완료")

    posts = seed_community(args.api, api)
    print(f"4/5 커뮤니티 게시글 {posts}개 입력 완료" if posts else "4/5 커뮤니티 데이터가 이미 있어 건너뜀")

    checks = {
        "홈 대시보드": lambda: api.request("GET", "/home/dashboard"),
        "월간 통계": lambda: api.request("GET", "/statistics/monthly", query={"year": YEAR, "month": MONTH}),
        "주간 통계": lambda: api.request("GET", "/statistics/weekly", query={"startDate": f"{YEAR}-{MONTH:02d}-02"}),
        "일간 피드백": lambda: api.request("GET", "/ai/feedback/daily", query={"date": f"{YEAR}-{MONTH:02d}-05"}),
        "월간 피드백": lambda: api.request("GET", "/ai/feedback/monthly", query={"year": YEAR, "month": MONTH}),
        "외식 추천 5천원": lambda: api.request("GET", "/menu/recommend/dining-out", query={"budget": 5000}),
        "외식 추천 1만원": lambda: api.request("GET", "/menu/recommend/dining-out", query={"budget": 10000}),
        "집밥 추천": lambda: api.request("GET", "/menu/recommend/home-cooking", query={"budget": 8000}),
        "커뮤니티": lambda: api.request("GET", "/community/posts", query={"page": 0, "size": 20}),
    }
    failed = 0
    for name, check in checks.items():
        try:
            check()
        except ApiError as error:
            failed += 1
            print(f"   실패 {name}: {error}")
    print(f"5/5 화면 데이터 확인 {len(checks) - failed}/{len(checks)}")
    print(f"완료: 아이디 {USERNAME} / 닉네임 {NICKNAME}")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
