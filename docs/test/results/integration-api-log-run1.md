# 통합 테스트 API 요청·응답 로그

- 생성 시각: 2026-10-14 19:06:44
- 대상 서버: `http://127.0.0.1:8080/v1`
- 총 요청 수: 122

민감 값(비밀번호, 토큰, 기기 토큰)은 `***`로 가렸습니다. 긴 응답은 잘라서 표시했습니다.

## 1. `GET /v1/auth/check/username?value=qaa5a0d451e` → 200 (170ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "isDuplicated": false
  },
  "message": "사용 가능합니다.",
  "timestamp": "2026-10-14T10:06:28.614270547Z"
}
```

## 2. `GET /v1/auth/check/email?value=qaa5a0d451e%40example.com` → 200 (19ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "isDuplicated": false
  },
  "message": "사용 가능합니다.",
  "timestamp": "2026-10-14T10:06:28.659242963Z"
}
```

## 3. `GET /v1/auth/check/email?value=not-an-email` → 400 (22ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "이메일 형식을 확인해주세요.",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:28.680652172Z"
}
```

## 4. `GET /v1/auth/check/nickname?value=%ED%81%90%EC%97%90%EC%9D%B45a0d45` → 200 (20ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "isDuplicated": false
  },
  "message": "사용 가능합니다.",
  "timestamp": "2026-10-14T10:06:28.701080964Z"
}
```

## 5. `POST /v1/auth/register` → 201 (980ms)

Request
```json
{
  "username": "qaa5a0d451e",
  "email": "qaa5a0d451e@example.com",
  "nickname": "큐에이5a0d45",
  "name": "테스트",
  "password": "***",
  "passwordConfirm": "***",
  "agreeTerms": true,
  "agreePrivacy": true
}
```
Response
```json
{
  "success": true,
  "data": {
    "userId": "u_1",
    "nickname": "큐에이5a0d45",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-10-14T10:06:29.676734547Z"
}
```

## 6. `POST /v1/auth/register` → 201 (580ms)

Request
```json
{
  "username": "qabab30c078",
  "email": "qabab30c078@example.com",
  "nickname": "큐에이ab30c0",
  "name": "테스트",
  "password": "***",
  "passwordConfirm": "***",
  "agreeTerms": true,
  "agreePrivacy": true
}
```
Response
```json
{
  "success": true,
  "data": {
    "userId": "u_2",
    "nickname": "큐에이ab30c0",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-10-14T10:06:30.580086173Z"
}
```

## 7. `POST /v1/auth/register` → 409 (19ms)

Request
```json
{
  "username": "qaa5a0d451e",
  "email": "qaa5a0d451e@example.com",
  "nickname": "큐에이5a0d45",
  "name": "테스트",
  "password": "***",
  "passwordConfirm": "***",
  "agreeTerms": true,
  "agreePrivacy": true
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "이미 사용 중인 아이디입니다.",
  "errorCode": "AUTH_002",
  "timestamp": "2026-10-14T10:06:30.601180214Z"
}
```

## 8. `POST /v1/auth/register` → 400 (23ms)

Request
```json
{
  "username": "qawa9d57494",
  "email": "qawa9d57494@example.com",
  "nickname": "큐에이a9d574",
  "name": "테스트",
  "password": "***",
  "passwordConfirm": "***",
  "agreeTerms": true,
  "agreePrivacy": true
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "비밀번호는 영문, 숫자, 특수문자를 포함하여 8자 이상이어야 합니다.",
  "errorCode": "VALID_003",
  "timestamp": "2026-10-14T10:06:30.624313006Z"
}
```

## 9. `POST /v1/auth/register` → 400 (21ms)

Request
```json
{
  "username": "qam8a8d7d95",
  "email": "qam8a8d7d95@example.com",
  "nickname": "큐에이8a8d7d",
  "name": "테스트",
  "password": "***",
  "passwordConfirm": "***",
  "agreeTerms": true,
  "agreePrivacy": true
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "비밀번호가 일치하지 않습니다.",
  "errorCode": "VALID_004",
  "timestamp": "2026-10-14T10:06:30.643978298Z"
}
```

## 10. `POST /v1/auth/register` → 400 (18ms)

Request
```json
{
  "username": "qat9e7516a0",
  "email": "qat9e7516a0@example.com",
  "nickname": "큐에이9e7516",
  "name": "테스트",
  "password": "***",
  "passwordConfirm": "***",
  "agreeTerms": false,
  "agreePrivacy": true
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "이용약관 및 개인정보처리방침에 동의해주세요.",
  "errorCode": "VALID_005",
  "timestamp": "2026-10-14T10:06:30.662403839Z"
}
```

## 11. `GET /v1/auth/check/username?value=qaa5a0d451e` → 200 (36ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "isDuplicated": true
  },
  "message": "이미 사용 중입니다.",
  "timestamp": "2026-10-14T10:06:30.696838548Z"
}
```

## 12. `POST /v1/auth/login` → 200 (762ms)

Request
```json
{
  "username": "qaa5a0d451e",
  "password": "***"
}
```
Response
```json
{
  "success": true,
  "data": {
    "accessToken": "***",
    "refreshToken": "***",
    "isNewUser": true,
    "userId": "u_1",
    "nickname": "큐에이5a0d45"
  },
  "message": "로그인 성공",
  "timestamp": "2026-10-14T10:06:31.461253840Z"
}
```

## 13. `POST /v1/auth/login` → 401 (590ms)

Request
```json
{
  "username": "qaa5a0d451e",
  "password": "***"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "아이디 또는 비밀번호를 확인해주세요.",
  "errorCode": "AUTH_001",
  "timestamp": "2026-10-14T10:06:32.056822423Z"
}
```

## 14. `POST /v1/auth/login` → 200 (598ms)

Request
```json
{
  "username": "qabab30c078",
  "password": "***"
}
```
Response
```json
{
  "success": true,
  "data": {
    "accessToken": "***",
    "refreshToken": "***",
    "isNewUser": true,
    "userId": "u_2",
    "nickname": "큐에이ab30c0"
  },
  "message": "로그인 성공",
  "timestamp": "2026-10-14T10:06:32.654033799Z"
}
```

## 15. `POST /v1/auth/token/refresh` → 200 (103ms)

Request
```json
{
  "refreshToken": "***"
}
```
Response
```json
{
  "success": true,
  "data": {
    "accessToken": "***",
    "refreshToken": "***"
  },
  "message": "토큰이 재발급되었습니다.",
  "timestamp": "2026-10-14T10:06:32.759292799Z"
}
```

## 16. `POST /v1/auth/token/refresh` → 401 (16ms)

Request
```json
{
  "refreshToken": "***"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "유효하지 않은 토큰입니다. 다시 로그인해주세요.",
  "errorCode": "AUTH_003",
  "timestamp": "2026-10-14T10:06:32.776310840Z"
}
```

## 17. `GET /v1/users/profile` → 401 (12ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "유효하지 않은 토큰입니다. 다시 로그인해주세요.",
  "errorCode": "AUTH_003",
  "timestamp": "2026-10-14T10:06:32.790391924Z"
}
```

## 18. `GET /v1/users/profile` → 401 (8ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "유효하지 않은 토큰입니다. 다시 로그인해주세요.",
  "errorCode": "AUTH_003",
  "timestamp": "2026-10-14T10:06:32.799143715Z"
}
```

## 19. `POST /v1/users/profile/initial` → 200 (86ms)

Request
```json
{
  "gender": "F",
  "age": 23,
  "height": 162.0,
  "weight": 55.0,
  "activityLevel": "LIGHT",
  "goal": "MAINTAIN"
}
```
Response
```json
{
  "success": true,
  "data": {
    "dailyCalorieGoal": 1800,
    "carbGoalGram": 225,
    "proteinGoalGram": 113,
    "fatGoalGram": 50,
    "isPreciseMode": false
  },
  "message": "신체정보가 저장되었습니다.",
  "timestamp": "2026-10-14T10:06:32.884585632Z"
}
```

## 20. `POST /v1/users/profile/initial` → 400 (38ms)

Request
```json
{
  "gender": "F",
  "age": 0,
  "height": 162.0,
  "weight": 55.0,
  "activityLevel": "LIGHT",
  "goal": "MAINTAIN"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "must be greater than or equal to 1",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:33.091208091Z"
}
```

## 21. `POST /v1/users/profile/initial` → 200 (31ms)

Request
```json
{
  "gender": "M",
  "age": 23,
  "height": 175.0,
  "weight": 70.0,
  "activityLevel": "LIGHT",
  "goal": "MAINTAIN"
}
```
Response
```json
{
  "success": true,
  "data": {
    "dailyCalorieGoal": 2300,
    "carbGoalGram": 288,
    "proteinGoalGram": 144,
    "fatGoalGram": 64,
    "isPreciseMode": false
  },
  "message": "신체정보가 저장되었습니다.",
  "timestamp": "2026-10-14T10:06:33.121555341Z"
}
```

## 22. `GET /v1/users/profile` → 200 (45ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "큐에이5a0d45",
    "name": "테스트",
    "email": "qaa5a0d451e@example.com",
    "gender": "F",
    "age": 23,
    "height": 162.0,
    "weight": 55.0,
    "activityLevel": "LIGHT",
    "goal": "MAINTAIN",
    "dailyCalorieGoal": 1800,
    "carbGoalGram": 225,
    "proteinGoalGram": 113,
    "fatGoalGram": 50,
    "isPreciseMode": false,
    "notification": {
      "pushEnabled": true,
      "waterReminderEnabled": true,
      "breakfastTime": "08:00",
      "lunchTime": "12:00",
      "dinnerTime": "18:30",
      "expiryAlertEnabled": true
    },
    "defaultBudget": {
      "diningOut": 10000,
      "homeCooking": 8000
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:33.157436091Z"
}
```

## 23. `PUT /v1/users/profile` → 200 (48ms)

Request
```json
{
  "weight": 53.5,
  "goal": "LOSE"
}
```
Response
```json
{
  "success": true,
  "data": {
    "dailyCalorieGoal": 1300,
    "carbGoalGram": 163,
    "proteinGoalGram": 81,
    "fatGoalGram": 36,
    "isPreciseMode": false
  },
  "message": "프로필이 수정되었습니다.",
  "timestamp": "2026-10-14T10:06:33.219153132Z"
}
```

## 24. `PUT /v1/users/settings/notification` → 200 (62ms)

Request
```json
{
  "pushEnabled": true,
  "breakfastTime": "08:30",
  "lunchTime": "12:30",
  "dinnerTime": "19:00"
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "알림 설정이 저장되었습니다.",
  "timestamp": "2026-10-14T10:06:33.422978924Z"
}
```

## 25. `PUT /v1/users/settings/notification` → 400 (21ms)

Request
```json
{
  "breakfastTime": "25:99"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "알림 시각은 HH:mm 형식으로 입력해주세요.",
  "errorCode": "VALID_010",
  "timestamp": "2026-10-14T10:06:33.446999632Z"
}
```

## 26. `PUT /v1/users/settings/budget` → 200 (40ms)

Request
```json
{
  "diningOut": 12000,
  "homeCooking": 8000
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "예산 기본값이 저장되었습니다.",
  "timestamp": "2026-10-14T10:06:33.489085132Z"
}
```

## 27. `PUT /v1/users/settings/budget` → 400 (16ms)

Request
```json
{
  "diningOut": -1
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "must be greater than or equal to 0",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:33.674194966Z"
}
```

## 28. `POST /v1/users/devices` → 200 (44ms)

Request
```json
{
  "deviceToken": "***",
  "platform": "IOS"
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "디바이스가 등록되었습니다.",
  "timestamp": "2026-10-14T10:06:33.718809133Z"
}
```

## 29. `POST /v1/users/devices` → 400 (10ms)

Request
```json
{
  "deviceToken": "***",
  "platform": "WINDOWS"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "입력값의 범위 또는 형식을 확인해주세요.",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:33.731068591Z"
}
```

## 30. `GET /v1/home/dashboard` → 200 (56ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "큐에이5a0d45",
    "date": "2026-10-14",
    "tomatoStatus": "HUNGRY",
    "calorieGoal": 1300,
    "calorieConsumed": 0,
    "calorieRemaining": 1300,
    "calorieExceeded": 0,
    "carb": {
      "goalGram": 163,
      "consumedGram": 0.0,
      "percentage": 0
    },
    "protein": {
      "goalGram": 81,
      "consumedGram": 0.0,
      "percentage": 0
    },
    "fat": {
      "goalGram": 36,
      "consumedGram": 0.0,
      "percentage": 0
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:33.783620008Z"
}
```

## 31. `POST /v1/diet/analyze` → 200 (83ms)

Request
```json
{
  "form": {},
  "files": {
    "image": "salad.png (image/png, 71B)"
  }
}
```
Response
```json
{
  "success": true,
  "data": {
    "analyzeId": "anl_dce90a50d3be427d",
    "foodName": "닭가슴살 샐러드",
    "totalCalorie": 243,
    "totalCarb": 8.5,
    "totalProtein": 39.7,
    "totalFat": 4.9,
    "items": [
      {
        "itemId": "itm_7d62abb510b542d7",
        "name": "닭가슴살",
        "weightGram": 120.0,
        "calorie": 198,
        "carb": 0.0,
        "protein": 37.2,
        "fat": 4.3
      },
      {
        "itemId": "itm_71fbe7c4a4614940",
        "name": "채소 샐러드",
        "weightGram": 150.0,
        "calorie": 45,
        "carb": 8.5,
        "protein": 2.5,
        "fat": 0.6
      }
    ]
  },
  "message": "AI 분석이 완료되었습니다.",
  "timestamp": "2026-10-14T10:06:33.866651549Z"
}
```

## 32. `POST /v1/diet/analyze` → 400 (25ms)

Request
```json
{
  "form": {
    "note": "no image"
  },
  "files": {}
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "이미지를 첨부해주세요.",
  "errorCode": "VALID_020",
  "timestamp": "2026-10-14T10:06:34.032662133Z"
}
```

## 33. `POST /v1/diet/analyze` → 400 (29ms)

Request
```json
{
  "form": {},
  "files": {
    "image": "anim.gif (image/gif, 6B)"
  }
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "jpg, jpeg, png, heic 이미지만 업로드할 수 있습니다.",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:34.070796299Z"
}
```

## 34. `GET /v1/diet/items/itm_7d62abb510b542d7` → 200 (75ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "itemId": "itm_7d62abb510b542d7",
    "name": "닭가슴살",
    "totalWeightGram": 120.0,
    "totalCalorie": 198,
    "carb": 0.0,
    "protein": 37.2,
    "fat": 4.3,
    "sodium": 89.0,
    "cholesterol": 102.0,
    "ingredients": [
      {
        "name": "닭가슴살",
        "weightGram": 120.0
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:34.138056633Z"
}
```

## 35. `GET /v1/diet/items/itm_7d62abb510b542d7` → 404 (62ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 음식 항목입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:34.207487758Z"
}
```

## 36. `GET /v1/diet/items/item_does_not_exist` → 404 (35ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 음식 항목입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:34.248041466Z"
}
```

## 37. `POST /v1/diet/records` → 201 (138ms)

Request
```json
{
  "analyzeId": "anl_dce90a50d3be427d",
  "mealType": "LUNCH",
  "eatenAt": "2026-10-14T10:06:34Z",
  "items": [
    {
      "itemId": "itm_7d62abb510b542d7",
      "name": "닭가슴살",
      "weightGram": 120.0,
      "calorie": 198,
      "carb": 0.0,
      "protein": 37.2,
      "fat": 4.3
    },
    {
      "itemId": "itm_71fbe7c4a4614940",
      "name": "채소 샐러드",
      "weightGram": 150.0,
      "calorie": 45,
      "carb": 8.5,
      "protein": 2.5,
      "fat": 0.6
    }
  ]
}
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_a901ef4cb92b466e",
    "eatenAt": "2026-10-14T10:06:34Z",
    "totalCalorie": 243
  },
  "message": "식단이 등록되었습니다.",
  "timestamp": "2026-10-14T10:06:34.384388925Z"
}
```

## 38. `POST /v1/diet/records` → 404 (37ms)

Request
```json
{
  "analyzeId": "anl_dce90a50d3be427d",
  "mealType": "LUNCH",
  "eatenAt": "2026-10-14T10:06:34Z",
  "items": [
    {
      "itemId": "itm_7d62abb510b542d7",
      "name": "닭가슴살",
      "weightGram": 120.0,
      "calorie": 198,
      "carb": 0.0,
      "protein": 37.2,
      "fat": 4.3
    },
    {
      "itemId": "itm_71fbe7c4a4614940",
      "name": "채소 샐러드",
      "weightGram": 150.0,
      "calorie": 45,
      "carb": 8.5,
      "protein": 2.5,
      "fat": 0.6
    }
  ]
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 분석 결과입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:34.635156341Z"
}
```

## 39. `POST /v1/diet/records/manual` → 201 (90ms)

Request
```json
{
  "mealType": "BREAKFAST",
  "eatenAt": "2026-10-14T10:06:34Z",
  "items": [
    {
      "name": "그릭요거트",
      "weightGram": 150,
      "calorie": 140,
      "carb": 8,
      "protein": 15,
      "fat": 5
    }
  ]
}
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_146bd6f7ba46422f"
  },
  "message": "식단이 등록되었습니다.",
  "timestamp": "2026-10-14T10:06:34.726391966Z"
}
```

## 40. `POST /v1/diet/records/manual` → 400 (21ms)

Request
```json
{
  "mealType": "BREAKFAST",
  "eatenAt": "2026-10-14T10:06:34Z",
  "items": []
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "must not be empty",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:34.751667133Z"
}
```

## 41. `POST /v1/diet/records/manual` → 400 (20ms)

Request
```json
{
  "mealType": "BREAKFAST",
  "eatenAt": "2026-10-14T10:06:34Z",
  "items": [
    {
      "name": "그릭요거트",
      "weightGram": 150,
      "calorie": -10,
      "carb": 8,
      "protein": 15,
      "fat": 5
    }
  ]
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "must be greater than or equal to 0",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:34.769860466Z"
}
```

## 42. `GET /v1/diet/calendar?year=2026&month=10` → 200 (38ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "month": 10,
    "recordedDates": [
      "2026-10-14"
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:34.800911758Z"
}
```

## 43. `GET /v1/diet/calendar?year=2026&month=13` → 400 (41ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "연도와 월의 범위를 확인해주세요.",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:34.847749466Z"
}
```

## 44. `GET /v1/diet/records?date=2026-10-14` → 200 (57ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "date": "2026-10-14",
    "totalCalorie": 383,
    "records": [
      {
        "recordId": "rec_a901ef4cb92b466e",
        "mealType": "LUNCH",
        "eatenAt": "2026-10-14T10:06:34Z",
        "thumbnailUrl": "/uploads/diet/2e03815b1667412ab56bd0a673ba96b0.png",
        "foodName": "닭가슴살 외 1개",
        "totalWeightGram": 270.0,
        "totalCalorie": 243,
        "carb": 8.5,
        "protein": 39.7,
        "fat": 4.9
      },
      {
        "recordId": "rec_146bd6f7ba46422f",
        "mealType": "BREAKFAST",
        "eatenAt": "2026-10-14T10:06:34Z",
        "foodName": "그릭요거트",
        "totalWeightGram": 150.0,
        "totalCalorie": 140,
        "carb": 8.0,
        "protein": 15.0,
        "fat": 5.0
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:34.897783716Z"
}
```

## 45. `GET /v1/diet/records?date=2026-13-40` → 500 (34ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  "errorCode": "SERVER_001",
  "timestamp": "2026-10-14T10:06:34.943518508Z"
}
```

## 46. `GET /v1/diet/records/rec_a901ef4cb92b466e` → 200 (41ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_a901ef4cb92b466e",
    "analyzeId": "anl_dce90a50d3be427d",
    "mealType": "LUNCH",
    "eatenAt": "2026-10-14T10:06:34Z",
    "thumbnailUrl": "/uploads/diet/2e03815b1667412ab56bd0a673ba96b0.png",
    "foodName": "닭가슴살 외 1개",
    "totalWeightGram": 270.0,
    "totalCalorie": 243,
    "carb": 8.5,
    "protein": 39.7,
    "fat": 4.9,
    "items": [
      {
        "itemId": "itm_7d62abb510b542d7",
        "name": "닭가슴살",
        "weightGram": 120.0,
        "calorie": 198,
        "carb": 0.0,
        "protein": 37.2,
        "fat": 4.3
      },
      {
        "itemId": "itm_71fbe7c4a4614940",
        "name": "채소 샐러드",
        "weightGram": 150.0,
        "calorie": 45,
        "carb": 8.5,
        "protein": 2.5,
        "fat": 0.6
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:34.977223300Z"
}
```

## 47. `GET /v1/diet/records/rec_a901ef4cb92b466e` → 404 (24ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 식단 기록입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:35.010016883Z"
}
```

## 48. `PUT /v1/diet/records/rec_146bd6f7ba46422f` → 200 (42ms)

Request
```json
{
  "mealType": "DINNER",
  "eatenAt": "2026-10-14T10:06:35Z",
  "items": [
    {
      "name": "그릭요거트",
      "weightGram": 200,
      "calorie": 190,
      "carb": 10,
      "protein": 20,
      "fat": 7
    }
  ]
}
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_146bd6f7ba46422f"
  },
  "message": "식단이 수정되었습니다.",
  "timestamp": "2026-10-14T10:06:35.053353550Z"
}
```

## 49. `PUT /v1/diet/records/rec_146bd6f7ba46422f` → 404 (20ms)

Request
```json
{
  "mealType": "DINNER",
  "eatenAt": "2026-10-14T10:06:35Z",
  "items": [
    {
      "name": "그릭요거트",
      "weightGram": 200,
      "calorie": 190,
      "carb": 10,
      "protein": 20,
      "fat": 7
    }
  ]
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 식단 기록입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:35.360015967Z"
}
```

## 50. `GET /v1/diet/foods/search?keyword=%EB%8B%AD` → 200 (36ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "foods": [
      {
        "foodId": "food_004",
        "name": "닭가슴살",
        "baseWeightGram": 100.0,
        "calorie": 165,
        "carb": 0.0,
        "protein": 31.0,
        "fat": 3.6
      }
    ],
    "totalCount": 1,
    "page": 0,
    "size": 20,
    "hasNext": false
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:35.392086508Z"
}
```

## 51. `GET /v1/diet/foods/search?keyword=%EC%A1%B4%EC%9E%AC%ED%95%98%EC%A7%80%EC%95%8A%EB%8A%94%EC%9D%8C%EC%8B%9D%EB%AA%85xyz` → 200 (20ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "foods": [],
    "totalCount": 0,
    "page": 0,
    "size": 20,
    "hasNext": false
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:35.415917592Z"
}
```

## 52. `GET /v1/home/dashboard` → 200 (22ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "큐에이5a0d45",
    "date": "2026-10-14",
    "tomatoStatus": "HUNGRY",
    "calorieGoal": 1300,
    "calorieConsumed": 433,
    "calorieRemaining": 867,
    "calorieExceeded": 0,
    "carb": {
      "goalGram": 163,
      "consumedGram": 18.5,
      "percentage": 11
    },
    "protein": {
      "goalGram": 81,
      "consumedGram": 59.7,
      "percentage": 74
    },
    "fat": {
      "goalGram": 36,
      "consumedGram": 11.9,
      "percentage": 33
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:35.438490342Z"
}
```

## 53. `GET /v1/statistics/daily?date=2026-10-14` → 200 (25ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "date": "2026-10-14",
    "calorieGoal": 1300,
    "calorieConsumed": 433,
    "caloriePercentage": 33,
    "carb": {
      "goalGram": 163,
      "consumedGram": 18.5,
      "percentage": 11
    },
    "protein": {
      "goalGram": 81,
      "consumedGram": 59.7,
      "percentage": 74
    },
    "fat": {
      "goalGram": 36,
      "consumedGram": 11.9,
      "percentage": 33
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:35.462791425Z"
}
```

## 54. `GET /v1/statistics/weekly?startDate=2026-10-12` → 200 (48ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "startDate": "2026-10-12",
    "endDate": "2026-10-18",
    "daily": [
      {
        "date": "2026-10-12",
        "calorieConsumed": 0,
        "calorieGoal": 1300,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-10-13",
        "calorieConsumed": 0,
        "calorieGoal": 1300,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-10-14",
        "calorieConsumed": 433,
        "calorieGoal": 1300,
        "carbPercentage": 11,
        "proteinPercentage": 74,
        "fatPercentage": 33
      },
      {
        "date": "2026-10-15",
        "calorieConsumed": 0,
        "calorieGoal": 1300,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-10-16",
        "calorieConsumed": 0,
        "calorieGoal": 1300,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-10-17",
        "calorieConsumed": 0,
        "calorieGoal": 1300,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-10-18",
        "calorieConsumed": 0,
        "calorieGoal": 1300,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      }
    ],
    "weeklyAvgCalorie":
... (생략)
```

## 55. `GET /v1/statistics/monthly?year=2026&month=10` → 200 (61ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "year": 2026,
    "month": 10,
    "daily": [
      {
        "date": "2026-10-01",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-02",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-03",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-04",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-05",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-06",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-07",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-08",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-09",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-10",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-11",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-12",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-13",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-10-14",
        "calor
... (생략)
```

## 56. `GET /v1/ai/feedback/daily?date=2026-10-14` → 200 (44ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "period": "2026-10-14",
    "periodType": "DAILY",
    "calorieAnalysis": {
      "consumed": 433,
      "goal": 1300,
      "comment": "오늘 목표 칼로리보다 867kcal 부족하게 섭취했습니다."
    },
    "nutritionBalance": {
      "carbPercentage": 11,
      "proteinPercentage": 74,
      "fatPercentage": 33,
      "comment": "탄수화물·단백질·지방 섭취가 부족합니다."
    },
    "suggestions": [
      "현미밥, 고구마, 통곡물처럼 천천히 소화되는 탄수화물을 식사에 더해보세요.",
      "견과류, 아보카도, 올리브유 같은 불포화지방을 적당량 더해보세요."
    ],
    "overallFeedback": "탄수화물 섭취가 가장 부족합니다. 다음 식사에서 해당 영양소를 먼저 보충해보세요."
  },
  "message": "AI 피드백 생성 완료",
  "timestamp": "2026-10-14T10:06:35.617960133Z"
}
```

## 57. `GET /v1/ai/feedback/weekly?startDate=2026-10-12` → 200 (36ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "period": "2026-10-12 ~ 2026-10-18",
    "periodType": "WEEKLY",
    "calorieAnalysis": {
      "avgConsumed": 433,
      "goal": 1300,
      "comment": "이번 주 평균 목표 칼로리보다 867kcal 부족하게 섭취했습니다."
    },
    "nutritionBalance": {
      "avgCarbPercentage": 11,
      "avgProteinPercentage": 74,
      "avgFatPercentage": 33,
      "comment": "탄수화물·단백질·지방 섭취가 부족합니다."
    },
    "suggestions": [
      "현미밥, 고구마, 통곡물처럼 천천히 소화되는 탄수화물을 식사에 더해보세요.",
      "견과류, 아보카도, 올리브유 같은 불포화지방을 적당량 더해보세요."
    ],
    "overallFeedback": "탄수화물 섭취가 가장 부족합니다. 다음 식사에서 해당 영양소를 먼저 보충해보세요."
  },
  "message": "AI 피드백 생성 완료",
  "timestamp": "2026-10-14T10:06:35.655200050Z"
}
```

## 58. `GET /v1/ai/feedback/monthly?year=2026&month=10` → 200 (19ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "period": "2026-10-01 ~ 2026-10-31",
    "periodType": "MONTHLY",
    "calorieAnalysis": {
      "avgConsumed": 433,
      "goal": 1300,
      "comment": "이번 달 평균 목표 칼로리보다 867kcal 부족하게 섭취했습니다."
    },
    "nutritionBalance": {
      "avgCarbPercentage": 11,
      "avgProteinPercentage": 74,
      "avgFatPercentage": 33,
      "comment": "탄수화물·단백질·지방 섭취가 부족합니다."
    },
    "suggestions": [
      "현미밥, 고구마, 통곡물처럼 천천히 소화되는 탄수화물을 식사에 더해보세요.",
      "견과류, 아보카도, 올리브유 같은 불포화지방을 적당량 더해보세요."
    ],
    "overallFeedback": "탄수화물 섭취가 가장 부족합니다. 다음 식사에서 해당 영양소를 먼저 보충해보세요."
  },
  "message": "AI 피드백 생성 완료",
  "timestamp": "2026-10-14T10:06:35.677569467Z"
}
```

## 59. `GET /v1/statistics/daily?date=yesterday` → 500 (13ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
  "errorCode": "SERVER_001",
  "timestamp": "2026-10-14T10:06:35.690459092Z"
}
```

## 60. `GET /v1/ai/feedback/monthly?year=2026&month=0` → 400 (10ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "연도와 월의 범위를 확인해주세요.",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:35.701890759Z"
}
```

## 61. `GET /v1/menu/recommend/summary` → 200 (68ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "date": "2026-10-14",
    "calorieRemaining": 867,
    "calorieGoal": 1300,
    "calorieConsumed": 433,
    "carb": {
      "percentage": 11
    },
    "protein": {
      "percentage": 74
    },
    "fat": {
      "percentage": 33
    },
    "defaultBudget": {
      "diningOut": 12000,
      "homeCooking": 8000
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:35.762966842Z"
}
```

## 62. `GET /v1/menu/recommend/dining-out?budget=15000` → 200 (56ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "recommendedCategories": [
      {
        "categoryId": "cat_001",
        "categoryName": "포케",
        "iconUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
        "reason": "탄수화물 보충과 균형 잡힌 식사에 도움이 됩니다."
      },
      {
        "categoryId": "cat_002",
        "categoryName": "샌드위치",
        "iconUrl": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80",
        "reason": "탄수화물 보충과 균형 잡힌 식사에 도움이 됩니다."
      },
      {
        "categoryId": "cat_003",
        "categoryName": "한식",
        "iconUrl": "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=600&q=80",
        "reason": "탄수화물 보충과 균형 잡힌 식사에 도움이 됩니다."
      },
      {
        "categoryId": "cat_004",
        "categoryName": "샐러드",
        "iconUrl": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80",
        "reason": "탄수화물 보충과 균형 잡힌 식사에 도움이 됩니다."
      }
    ],
    "appliedBudget": 15000
  },
  "message": "추천 완료",
  "timestamp": "2026-10-14T10:06:35.821866259Z"
}
```

## 63. `GET /v1/menu/categories/cat_001/items?budget=15000` → 200 (43ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "categoryName": "포케",
    "items": [
      {
        "itemId": "menu_001",
        "name": "닭가슴살 현미 포케",
        "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
        "calorie": 520.0,
        "carb": 64.0,
        "protein": 38.0,
        "fat": 13.0,
        "avgPrice": 10900,
        "isWithinBudget": true
      },
      {
        "itemId": "menu_002",
        "name": "연어 아보카도 포케",
        "imageUrl": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
        "calorie": 560.0,
        "carb": 55.0,
        "protein": 32.0,
        "fat": 22.0,
        "avgPrice": 12900,
        "isWithinBudget": true
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:35.861163050Z"
}
```

## 64. `GET /v1/menu/categories/cat_none/items` → 404 (26ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 메뉴 카테고리입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:35.893177550Z"
}
```

## 65. `GET /v1/menu/items/menu_001` → 200 (52ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "itemId": "menu_001",
    "name": "닭가슴살 현미 포케",
    "imageUrl": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80",
    "calorie": 520.0,
    "carb": 64.0,
    "protein": 38.0,
    "fat": 13.0,
    "ingredients": [
      {
        "name": "현미밥",
        "weightGram": 150.0
      },
      {
        "name": "닭가슴살",
        "weightGram": 120.0
      },
      {
        "name": "채소",
        "weightGram": 120.0
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:35.942594259Z"
}
```

## 66. `GET /v1/menu/items/menu_none` → 404 (32ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 메뉴입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:35.976926550Z"
}
```

## 67. `GET /v1/menu/nearby-stores?lat=37.4985&lng=127.028&categoryId=cat_001&radius=1000` → 403 (34ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "위치 정보 동의가 필요한 기능입니다.",
  "errorCode": "AUTH_020",
  "timestamp": "2026-10-14T10:06:36.017034717Z"
}
```

## 68. `POST /v1/users/location-consent` → 200 (24ms)

Request
```json
{
  "agreed": true
}
```
Response
```json
{
  "success": true,
  "data": {
    "locationConsentGranted": true
  },
  "message": "설정이 저장되었습니다.",
  "timestamp": "2026-10-14T10:06:36.040531092Z"
}
```

## 69. `POST /v1/users/location-consent` → 400 (12ms)

Request
```json
{}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "must not be null",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:36.053771300Z"
}
```

## 70. `GET /v1/menu/nearby-stores?lat=37.4985&lng=127.028&categoryId=cat_001&radius=1000` → 200 (65ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "stores": [
      {
        "storeId": "store_001",
        "name": "밸런스 포케 강남점",
        "address": "서울특별시 강남구 강남대로 438",
        "lat": 37.4987,
        "lng": 127.0274,
        "distance": 57,
        "menus": [
          {
            "name": "닭가슴살 현미 포케",
            "calorie": 520.0,
            "price": 10900
          },
          {
            "name": "연어 아보카도 포케",
            "calorie": 560.0,
            "price": 12900
          }
        ]
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:36.111174592Z"
}
```

## 71. `GET /v1/menu/nearby-stores?lat=123&lng=127.028&categoryId=cat_001&radius=1000` → 400 (53ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "입력값의 범위 또는 형식을 확인해주세요.",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:36.175332717Z"
}
```

## 72. `POST /v1/fridge/ingredients` → 201 (56ms)

Request
```json
{
  "ingredients": [
    {
      "name": "닭가슴살",
      "quantity": 2,
      "unit": "팩",
      "expiryDate": "2026-10-14"
    },
    {
      "name": "두부",
      "quantity": 1,
      "unit": "모"
    },
    {
      "name": "현미밥",
      "quantity": 1,
      "unit": "공기"
    }
  ]
}
```
Response
```json
{
  "success": true,
  "data": {
    "registeredCount": 3
  },
  "message": "재료가 등록되었습니다.",
  "timestamp": "2026-10-14T10:06:36.230738967Z"
}
```

## 73. `POST /v1/fridge/ingredients` → 400 (8ms)

Request
```json
{
  "ingredients": [
    {
      "name": "우유",
      "quantity": 0,
      "unit": "개"
    }
  ]
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "수량은 0보다 커야 합니다.",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:36.334210884Z"
}
```

## 74. `GET /v1/fridge/ingredients` → 200 (26ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "ingredients": [
      {
        "ingredientId": "ing_2327339e0798498b",
        "name": "닭가슴살",
        "quantity": 2.0,
        "unit": "팩",
        "expiryDate": "2026-10-14",
        "isExpiringSoon": true
      },
      {
        "ingredientId": "ing_5f449b0d6e8c4c99",
        "name": "현미밥",
        "quantity": 1.0,
        "unit": "공기",
        "isExpiringSoon": false
      },
      {
        "ingredientId": "ing_8f081451031942c1",
        "name": "두부",
        "quantity": 1.0,
        "unit": "모",
        "isExpiringSoon": false
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:36.359065925Z"
}
```

## 75. `PUT /v1/fridge/ingredients/ing_8f081451031942c1` → 200 (24ms)

Request
```json
{
  "quantity": 3,
  "unit": "모"
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "재료가 수정되었습니다.",
  "timestamp": "2026-10-14T10:06:36.385981009Z"
}
```

## 76. `PUT /v1/fridge/ingredients/ing_8f081451031942c1` → 404 (26ms)

Request
```json
{
  "quantity": 9,
  "unit": "모"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 재료입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:36.566691342Z"
}
```

## 77. `GET /v1/menu/recommend/home-cooking?budget=10000` → 200 (208ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "recommendedCategories": [
      {
        "categoryId": "hcat_002",
        "categoryName": "두부 된장찌개",
        "imageUrl": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=800&q=80",
        "reason": "냉장고에 있는 재료를 활용할 수 있습니다.",
        "estimatedCost": 3900,
        "isWithinBudget": true
      },
      {
        "categoryId": "hcat_001",
        "categoryName": "닭가슴살 볶음밥",
        "imageUrl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
        "reason": "냉장고에 있는 재료를 활용할 수 있습니다.",
        "estimatedCost": 4500,
        "isWithinBudget": true
      },
      {
        "categoryId": "hcat_003",
        "categoryName": "연어 샐러드",
        "imageUrl": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80",
        "reason": "냉장고에 있는 재료를 활용할 수 있습니다.",
        "estimatedCost": 6200,
        "isWithinBudget": true
      }
    ],
    "appliedBudget": 10000
  },
  "message": "추천 완료",
  "timestamp": "2026-10-14T10:06:36.771745259Z"
}
```

## 78. `GET /v1/menu/recipes?categoryId=hcat_002&budget=10000` → 200 (32ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "categoryName": "두부 된장찌개",
    "recipes": [
      {
        "recipeId": "recipe_003",
        "name": "두부 애호박 된장찌개",
        "imageUrl": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80",
        "calorie": 315.0,
        "carb": 27.0,
        "protein": 24.0,
        "fat": 13.0,
        "cookingTimeMinutes": 25,
        "difficulty": "EASY",
        "estimatedCost": 3900,
        "isWithinBudget": true
      },
      {
        "recipeId": "recipe_004",
        "name": "버섯 순두부찌개",
        "imageUrl": "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=1000&q=80",
        "calorie": 340.0,
        "carb": 24.0,
        "protein": 23.0,
        "fat": 17.0,
        "cookingTimeMinutes": 28,
        "difficulty": "MEDIUM",
        "estimatedCost": 4700,
        "isWithinBudget": true
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:36.801724759Z"
}
```

## 79. `GET /v1/menu/recipes?categoryId=hcat_none` → 404 (18ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 레시피 카테고리입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:36.827394176Z"
}
```

## 80. `GET /v1/menu/recipes/recipe_003` → 200 (124ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "recipeId": "recipe_003",
    "name": "두부 애호박 된장찌개",
    "imageUrl": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80",
    "calorie": 315.0,
    "carb": 27.0,
    "protein": 24.0,
    "fat": 13.0,
    "cookingTimeMinutes": 25,
    "difficulty": "EASY",
    "estimatedCost": 3900,
    "ingredients": [
      {
        "name": "두부",
        "amount": "150g",
        "alternatives": []
      },
      {
        "name": "애호박",
        "amount": "80g",
        "alternatives": [
          {
            "name": "양배추",
            "reason": "애호박이 없다면 비슷한 양의 양배추로 식감을 더할 수 있습니다."
          }
        ]
      },
      {
        "name": "된장",
        "amount": "1.5큰술",
        "alternatives": []
      },
      {
        "name": "양파",
        "amount": "50g",
        "alternatives": []
      }
    ],
    "steps": [
      {
        "stepNo": 1,
        "description": "양파와 애호박, 두부를 먹기 좋은 크기로 썹니다."
      },
      {
        "stepNo": 2,
        "description": "물 400ml에 된장을 풀고 양파와 애호박을 8분간 끓입니다."
      },
      {
        "stepNo": 3,
        "description": "두부를 넣고 5분 더 끓여 완성합니다."
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:36.943907134Z"
}
```

## 81. `GET /v1/menu/recipes/recipe_none` → 404 (14ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 레시피입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:36.967253342Z"
}
```

## 82. `POST /v1/menu/recommend/leftover` → 200 (72ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "categoryName": "남은 재료 추천",
    "recipes": [
      {
        "recipeId": "recipe_001",
        "name": "닭가슴살 달걀 볶음밥",
        "imageUrl": "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=1000&q=80",
        "calorie": 535.0,
        "carb": 66.0,
        "protein": 39.0,
        "fat": 12.0,
        "cookingTimeMinutes": 20,
        "difficulty": "EASY",
        "estimatedCost": 5200,
        "isWithinBudget": true
      },
      {
        "recipeId": "recipe_003",
        "name": "두부 애호박 된장찌개",
        "imageUrl": "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&w=1000&q=80",
        "calorie": 315.0,
        "carb": 27.0,
        "protein": 24.0,
        "fat": 13.0,
        "cookingTimeMinutes": 25,
        "difficulty": "EASY",
        "estimatedCost": 3900,
        "isWithinBudget": true
      },
      {
        "recipeId": "recipe_006",
        "name": "닭가슴살 시저 샐러드",
        "imageUrl": "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1000&q=80",
        "calorie": 405.0,
        "carb": 29.0,
        "protein": 38.0,
        "fat": 16.0,
        "cookingTimeMinutes": 15,
        "difficulty": "EASY",
        "estimatedCost": 6200,
        "isWithinBudget": true
      },
      {
        "recipeId": "recipe_002",
        "name": "참치 김치 볶음밥",
        "imageUrl": "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fi
... (생략)
```

## 83. `GET /v1/menu/recipes/recipe_003/shopping-list` → 200 (39ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "recipeId": "recipe_003",
    "recipeName": "두부 애호박 된장찌개",
    "estimatedTotalCost": 2925,
    "shoppingItems": [
      {
        "name": "두부",
        "requiredAmount": "150g",
        "inFridge": true,
        "products": []
      },
      {
        "name": "애호박",
        "requiredAmount": "80g",
        "inFridge": false,
        "products": [
          {
            "mallName": "네이버쇼핑",
            "productName": "애호박 상품 보기",
            "price": 975,
            "productUrl": "https://search.shopping.naver.com/search/all?query=%EC%95%A0%ED%98%B8%EB%B0%95"
          },
          {
            "mallName": "쿠팡",
            "productName": "애호박 상품 보기",
            "price": 975,
            "productUrl": "https://www.coupang.com/np/search?q=%EC%95%A0%ED%98%B8%EB%B0%95"
          }
        ]
      },
      {
        "name": "된장",
        "requiredAmount": "1.5큰술",
        "inFridge": false,
        "products": [
          {
            "mallName": "네이버쇼핑",
            "productName": "된장 상품 보기",
            "price": 975,
            "productUrl": "https://search.shopping.naver.com/search/all?query=%EB%90%9C%EC%9E%A5"
          },
          {
            "mallName": "쿠팡",
            "productName": "된장 상품 보기",
            "price": 975,
            "productUrl": "https://www.coupang.com/np/search?q=%EB%90%9C%EC%9E%A5"
          }
        ]
      },
      {
        "name": "양파",
        "requiredAmount": "50g",
        "inFridge": false,
      
... (생략)
```

## 84. `GET /v1/menu/recipes/recipe_none/shopping-list` → 404 (22ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 레시피입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:37.102283884Z"
}
```

## 85. `DELETE /v1/fridge/ingredients/ing_8f081451031942c1` → 404 (27ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 재료입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:37.130692509Z"
}
```

## 86. `DELETE /v1/fridge/ingredients/ing_8f081451031942c1` → 200 (33ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "재료가 삭제되었습니다.",
  "timestamp": "2026-10-14T10:06:37.162610301Z"
}
```

## 87. `POST /v1/community/analyze-image` → 200 (18ms)

Request
```json
{
  "form": {},
  "files": {
    "image": "rice.png (image/png, 71B)"
  }
}
```
Response
```json
{
  "success": true,
  "data": {
    "foodName": "덮밥",
    "calorie": 620,
    "carb": 86.0,
    "protein": 27.0,
    "fat": 18.0
  },
  "message": "AI 분석이 완료되었습니다.",
  "timestamp": "2026-10-14T10:06:37.293694176Z"
}
```

## 88. `POST /v1/community/analyze-image` → 400 (8ms)

Request
```json
{
  "form": {},
  "files": {
    "image": "a.txt (text/plain, 5B)"
  }
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "jpg, jpeg, png, heic 이미지만 업로드할 수 있습니다.",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:37.303815759Z"
}
```

## 89. `POST /v1/community/posts` → 201 (23ms)

Request
```json
{
  "form": {
    "content": "QA 통합 테스트 게시글",
    "calorie": 620,
    "carb": 86,
    "protein": 27,
    "fat": 18
  },
  "files": {
    "image": "bap.png (image/png, 71B)"
  }
}
```
Response
```json
{
  "success": true,
  "data": {
    "postId": "post_daebc6da29d642f7"
  },
  "message": "게시글이 등록되었습니다.",
  "timestamp": "2026-10-14T10:06:37.326538593Z"
}
```

## 90. `POST /v1/community/posts` → 400 (9ms)

Request
```json
{
  "form": {
    "content": "   "
  },
  "files": {}
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "게시글 내용을 입력해주세요.",
  "errorCode": "VALID_010",
  "timestamp": "2026-10-14T10:06:37.423422634Z"
}
```

## 91. `GET /v1/community/posts?page=0&size=20` → 200 (18ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "postId": "post_daebc6da29d642f7",
        "title": "QA 통합 테스트 게시글",
        "authorNickname": "큐에이5a0d45",
        "createdAt": "2026-10-14T10:06:37.320638Z",
        "thumbnailUrl": "/v1/uploads/community/2913d50b2de84ef3823833ddaa6164a3.png",
        "likeCount": 0,
        "commentCount": 0
      }
    ],
    "totalCount": 1,
    "page": 0,
    "size": 20,
    "hasNext": false
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:37.440006593Z"
}
```

## 92. `GET /v1/community/posts?page=0&size=999` → 400 (7ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "입력값의 범위 또는 형식을 확인해주세요.",
  "errorCode": "VALID_011",
  "timestamp": "2026-10-14T10:06:37.450481468Z"
}
```

## 93. `GET /v1/community/posts/post_daebc6da29d642f7` → 200 (38ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "postId": "post_daebc6da29d642f7",
    "content": "QA 통합 테스트 게시글",
    "imageUrl": "/v1/uploads/community/2913d50b2de84ef3823833ddaa6164a3.png",
    "authorNickname": "큐에이5a0d45",
    "createdAt": "2026-10-14T10:06:37.320638Z",
    "likeCount": 0,
    "isLiked": false,
    "commentCount": 0,
    "nutritionInfo": {
      "foodName": "식사",
      "calorie": 620,
      "carb": 86.0,
      "protein": 27.0,
      "fat": 18.0
    },
    "comments": []
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:37.484926509Z"
}
```

## 94. `GET /v1/uploads/community/2913d50b2de84ef3823833ddaa6164a3.png` → 200 (7ms)

Request
```json
(없음)
```
Response
```json
<71 bytes>
```

## 95. `GET /v1/uploads/community/..%2F..%2Fetc%2Fpasswd` → 400 (4ms)

Request
```json
(없음)
```
Response
```json
<435 bytes>
```

## 96. `PUT /v1/community/posts/post_daebc6da29d642f7` → 403 (26ms)

Request
```json
{
  "content": "남의 글 수정 시도"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "본인의 게시글만 수정할 수 있습니다.",
  "errorCode": "AUTH_020",
  "timestamp": "2026-10-14T10:06:37.527382468Z"
}
```

## 97. `PUT /v1/community/posts/post_daebc6da29d642f7` → 200 (35ms)

Request
```json
{
  "content": "QA 수정된 게시글"
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "게시글이 수정되었습니다.",
  "timestamp": "2026-10-14T10:06:37.562977926Z"
}
```

## 98. `POST /v1/community/posts/post_daebc6da29d642f7/comments` → 201 (35ms)

Request
```json
{
  "content": "맛있어 보여요"
}
```
Response
```json
{
  "success": true,
  "data": {
    "commentId": "cmt_4f51ae9c8ccb40b0"
  },
  "message": "댓글이 등록되었습니다.",
  "timestamp": "2026-10-14T10:06:37.598310426Z"
}
```

## 99. `POST /v1/community/posts/post_daebc6da29d642f7/comments` → 400 (6ms)

Request
```json
{
  "content": ""
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "댓글 내용을 입력해주세요.",
  "errorCode": "VALID_010",
  "timestamp": "2026-10-14T10:06:37.606280509Z"
}
```

## 100. `POST /v1/community/posts/post_daebc6da29d642f7/likes` → 200 (34ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likeCount": 1
  },
  "message": "좋아요가 처리되었습니다.",
  "timestamp": "2026-10-14T10:06:37.639253801Z"
}
```

## 101. `POST /v1/community/posts/post_daebc6da29d642f7/likes` → 200 (37ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "isLiked": false,
    "likeCount": 0
  },
  "message": "좋아요가 처리되었습니다.",
  "timestamp": "2026-10-14T10:06:37.677426551Z"
}
```

## 102. `GET /v1/community/posts/post_daebc6da29d642f7` → 200 (47ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "postId": "post_daebc6da29d642f7",
    "content": "QA 수정된 게시글",
    "imageUrl": "/v1/uploads/community/2913d50b2de84ef3823833ddaa6164a3.png",
    "authorNickname": "큐에이5a0d45",
    "createdAt": "2026-10-14T10:06:37.320638Z",
    "likeCount": 0,
    "isLiked": false,
    "commentCount": 1,
    "nutritionInfo": {
      "foodName": "식사",
      "calorie": 620,
      "carb": 86.0,
      "protein": 27.0,
      "fat": 18.0
    },
    "comments": [
      {
        "commentId": "cmt_4f51ae9c8ccb40b0",
        "authorNickname": "큐에이ab30c0",
        "content": "맛있어 보여요",
        "createdAt": "2026-10-14T10:06:37.589165Z"
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-10-14T10:06:37.723814551Z"
}
```

## 103. `DELETE /v1/community/posts/post_daebc6da29d642f7/comments/cmt_4f51ae9c8ccb40b0` → 403 (30ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "본인의 댓글만 삭제할 수 있습니다.",
  "errorCode": "AUTH_020",
  "timestamp": "2026-10-14T10:06:37.753305343Z"
}
```

## 104. `DELETE /v1/community/posts/post_daebc6da29d642f7/comments/cmt_4f51ae9c8ccb40b0` → 200 (47ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "댓글이 삭제되었습니다.",
  "timestamp": "2026-10-14T10:06:37.803151551Z"
}
```

## 105. `DELETE /v1/community/posts/post_daebc6da29d642f7` → 403 (27ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "본인의 게시글만 삭제할 수 있습니다.",
  "errorCode": "AUTH_020",
  "timestamp": "2026-10-14T10:06:37.830570510Z"
}
```

## 106. `DELETE /v1/community/posts/post_daebc6da29d642f7` → 200 (51ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "게시글이 삭제되었습니다.",
  "timestamp": "2026-10-14T10:06:37.881483718Z"
}
```

## 107. `GET /v1/community/posts/post_daebc6da29d642f7` → 404 (26ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 게시글입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:37.909224051Z"
}
```

## 108. `DELETE /v1/diet/records/rec_a901ef4cb92b466e` → 404 (22ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 식단 기록입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:37.929141218Z"
}
```

## 109. `DELETE /v1/diet/records/rec_a901ef4cb92b466e` → 200 (37ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "식단이 삭제되었습니다.",
  "timestamp": "2026-10-14T10:06:37.970116385Z"
}
```

## 110. `GET /v1/diet/records/rec_a901ef4cb92b466e` → 404 (16ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "존재하지 않는 식단 기록입니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-10-14T10:06:37.986510801Z"
}
```

## 111. `PUT /v1/users/password` → 401 (586ms)

Request
```json
{
  "currentPassword": "***",
  "newPassword": "***",
  "newPasswordConfirm": "***"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "현재 비밀번호가 올바르지 않습니다.",
  "errorCode": "AUTH_010",
  "timestamp": "2026-10-14T10:06:38.568366385Z"
}
```

## 112. `PUT /v1/users/password` → 400 (906ms)

Request
```json
{
  "currentPassword": "***",
  "newPassword": "***",
  "newPasswordConfirm": "***"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "비밀번호가 일치하지 않습니다.",
  "errorCode": "VALID_004",
  "timestamp": "2026-10-14T10:06:39.476404052Z"
}
```

## 113. `PUT /v1/users/password` → 200 (1280ms)

Request
```json
{
  "currentPassword": "***",
  "newPassword": "***",
  "newPasswordConfirm": "***"
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "비밀번호가 변경되었습니다.",
  "timestamp": "2026-10-14T10:06:40.759143303Z"
}
```

## 114. `POST /v1/auth/token/refresh` → 401 (30ms)

Request
```json
{
  "refreshToken": "***"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "유효하지 않은 토큰입니다. 다시 로그인해주세요.",
  "errorCode": "AUTH_003",
  "timestamp": "2026-10-14T10:06:40.788315094Z"
}
```

## 115. `POST /v1/auth/login` → 200 (774ms)

Request
```json
{
  "username": "qaa5a0d451e",
  "password": "***"
}
```
Response
```json
{
  "success": true,
  "data": {
    "accessToken": "***",
    "refreshToken": "***",
    "isNewUser": false,
    "userId": "u_1",
    "nickname": "큐에이5a0d45"
  },
  "message": "로그인 성공",
  "timestamp": "2026-10-14T10:06:41.562821220Z"
}
```

## 116. `POST /v1/auth/logout` → 200 (41ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "로그아웃 되었습니다.",
  "timestamp": "2026-10-14T10:06:41.605468761Z"
}
```

## 117. `POST /v1/auth/token/refresh` → 401 (15ms)

Request
```json
{
  "refreshToken": "***"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "유효하지 않은 토큰입니다. 다시 로그인해주세요.",
  "errorCode": "AUTH_003",
  "timestamp": "2026-10-14T10:06:41.621416095Z"
}
```

## 118. `DELETE /v1/users/account` → 401 (661ms)

Request
```json
{
  "currentPassword": "***"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "현재 비밀번호가 올바르지 않습니다.",
  "errorCode": "AUTH_010",
  "timestamp": "2026-10-14T10:06:42.285552012Z"
}
```

## 119. `DELETE /v1/users/account` → 200 (748ms)

Request
```json
{
  "currentPassword": "***"
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "회원 탈퇴가 완료되었습니다.",
  "timestamp": "2026-10-14T10:06:43.034747012Z"
}
```

## 120. `POST /v1/auth/login` → 401 (17ms)

Request
```json
{
  "username": "qaa5a0d451e",
  "password": "***"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "아이디 또는 비밀번호를 확인해주세요.",
  "errorCode": "AUTH_001",
  "timestamp": "2026-10-14T10:06:43.203719345Z"
}
```

## 121. `POST /v1/auth/login` → 200 (694ms)

Request
```json
{
  "username": "qabab30c078",
  "password": "***"
}
```
Response
```json
{
  "success": true,
  "data": {
    "accessToken": "***",
    "refreshToken": "***",
    "isNewUser": false,
    "userId": "u_2",
    "nickname": "큐에이ab30c0"
  },
  "message": "로그인 성공",
  "timestamp": "2026-10-14T10:06:43.895667596Z"
}
```

## 122. `DELETE /v1/users/account` → 200 (720ms)

Request
```json
{
  "currentPassword": "***"
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "회원 탈퇴가 완료되었습니다.",
  "timestamp": "2026-10-14T10:06:44.620056638Z"
}
```
