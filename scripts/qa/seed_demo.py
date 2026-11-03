"""화면 연동 확인용 데모 계정과 데이터를 실제 서버에 만든다. 비밀번호는 bapqa.PASSWORD를 사용한다."""
from bapqa import PASSWORD, PNG_BYTES, Client, now_iso

USERNAME = "qademo01"
log = []
c = Client(log)
c.call("POST", "/auth/register", auth=False, json_body={
    "username": USERNAME, "email": f"{USERNAME}@example.com", "nickname": "밥풀QA", "name": "데모",
    "password": PASSWORD, "passwordConfirm": PASSWORD, "agreeTerms": True, "agreePrivacy": True})
assert c.login(USERNAME).status == 200
c.call("POST", "/users/profile/initial", json_body={
    "gender": "F", "age": 23, "height": 162.0, "weight": 55.0, "activityLevel": "LIGHT", "goal": "MAINTAIN"})
c.call("PUT", "/users/settings/budget", json_body={"diningOut": 12000, "homeCooking": 8000})
a = c.call("POST", "/diet/analyze", files={"image": ("chicken.png", "image/png", PNG_BYTES)}).data
c.call("POST", "/diet/records", json_body={"analyzeId": a["analyzeId"], "mealType": "LUNCH", "eatenAt": now_iso(),
       "items": [{k: i[k] for k in ("itemId", "name", "weightGram", "calorie", "carb", "protein", "fat")} for i in a["items"]]})
c.call("POST", "/diet/records/manual", json_body={"mealType": "BREAKFAST", "eatenAt": now_iso(), "items": [
    {"name": "그릭요거트와 블루베리", "weightGram": 200, "calorie": 210, "carb": 22, "protein": 15, "fat": 6}]})
c.call("POST", "/fridge/ingredients", json_body={"ingredients": [
    {"name": "닭가슴살", "quantity": 2, "unit": "팩"}, {"name": "계란", "quantity": 6, "unit": "개"}]})
c.call("POST", "/community/posts", form={"content": "QA 데모: 오늘 점심 닭가슴살 현미밥", "calorie": 523, "carb": 57,
       "protein": 51, "fat": 7}, files={"image": ("lunch.png", "image/png", PNG_BYTES)})
print([(e.method, e.path.split("?")[0], e.status) for e in log])
