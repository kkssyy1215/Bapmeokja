# 통합 테스트 API 요청·응답 로그

- 생성 시각: 2026-11-03 13:37:50
- 대상 서버: `http://127.0.0.1:8080/v1`
- 총 요청 수: 128

민감 값(비밀번호, 토큰, 기기 토큰)은 `***`로 가렸습니다. 긴 응답은 잘라서 표시했습니다.

## 1. `GET /v1/auth/check/username?value=qaa324071a9` → 200 (64ms)

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
  "timestamp": "2026-11-03T04:37:40.916132588Z"
}
```

## 2. `GET /v1/auth/check/email?value=qaa324071a9%40example.com` → 200 (12ms)

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
  "timestamp": "2026-11-03T04:37:40.938341129Z"
}
```

## 3. `GET /v1/auth/check/email?value=not-an-email` → 400 (16ms)

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
  "timestamp": "2026-11-03T04:37:40.954453421Z"
}
```

## 4. `GET /v1/auth/check/nickname?value=%ED%81%90%EC%97%90%EC%9D%B4324071` → 200 (13ms)

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
  "timestamp": "2026-11-03T04:37:40.968787588Z"
}
```

## 5. `POST /v1/auth/register` → 201 (603ms)

Request
```json
{
  "username": "qaa324071a9",
  "email": "qaa324071a9@example.com",
  "nickname": "큐에이324071",
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
    "userId": "u_119",
    "nickname": "큐에이324071",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:37:41.571025255Z"
}
```

## 6. `POST /v1/auth/register` → 201 (468ms)

Request
```json
{
  "username": "qabfa861f71",
  "email": "qabfa861f71@example.com",
  "nickname": "큐에이fa861f",
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
    "userId": "u_120",
    "nickname": "큐에이fa861f",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:37:42.195899463Z"
}
```

## 7. `POST /v1/auth/register` → 409 (16ms)

Request
```json
{
  "username": "qaa324071a9",
  "email": "qaa324071a9@example.com",
  "nickname": "큐에이324071",
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
  "timestamp": "2026-11-03T04:37:42.212320797Z"
}
```

## 8. `POST /v1/auth/register` → 400 (14ms)

Request
```json
{
  "username": "qawf0250cc0",
  "email": "qawf0250cc0@example.com",
  "nickname": "큐에이f0250c",
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
  "timestamp": "2026-11-03T04:37:42.226812963Z"
}
```

## 9. `POST /v1/auth/register` → 400 (7ms)

Request
```json
{
  "username": "qam9c93b781",
  "email": "qam9c93b781@example.com",
  "nickname": "큐에이9c93b7",
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
  "timestamp": "2026-11-03T04:37:42.236424255Z"
}
```

## 10. `POST /v1/auth/register` → 400 (7ms)

Request
```json
{
  "username": "qatd0aa0658",
  "email": "qatd0aa0658@example.com",
  "nickname": "큐에이d0aa06",
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
  "timestamp": "2026-11-03T04:37:42.242857088Z"
}
```

## 11. `GET /v1/auth/check/username?value=qaa324071a9` → 200 (9ms)

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
  "timestamp": "2026-11-03T04:37:42.252714088Z"
}
```

## 12. `POST /v1/auth/login` → 200 (543ms)

Request
```json
{
  "username": "qaa324071a9",
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
    "userId": "u_119",
    "nickname": "큐에이324071"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:37:42.794426463Z"
}
```

## 13. `POST /v1/auth/login` → 401 (461ms)

Request
```json
{
  "username": "qaa324071a9",
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
  "timestamp": "2026-11-03T04:37:43.257073797Z"
}
```

## 14. `POST /v1/auth/login` → 200 (467ms)

Request
```json
{
  "username": "qabfa861f71",
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
    "userId": "u_120",
    "nickname": "큐에이fa861f"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:37:43.724492047Z"
}
```

## 15. `POST /v1/auth/token/refresh` → 200 (57ms)

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
  "timestamp": "2026-11-03T04:37:43.781940797Z"
}
```

## 16. `POST /v1/auth/token/refresh` → 401 (8ms)

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
  "timestamp": "2026-11-03T04:37:43.791138172Z"
}
```

## 17. `GET /v1/users/profile` → 401 (6ms)

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
  "timestamp": "2026-11-03T04:37:43.798765506Z"
}
```

## 18. `GET /v1/users/profile` → 401 (3ms)

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
  "timestamp": "2026-11-03T04:37:43.802729506Z"
}
```

## 19. `POST /v1/users/profile/initial` → 200 (35ms)

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
  "timestamp": "2026-11-03T04:37:43.836533631Z"
}
```

## 20. `POST /v1/users/profile/initial` → 400 (18ms)

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
  "timestamp": "2026-11-03T04:37:43.940091131Z"
}
```

## 21. `POST /v1/users/profile/initial` → 200 (13ms)

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
  "timestamp": "2026-11-03T04:37:43.953889131Z"
}
```

## 22. `GET /v1/nothing/here` → 404 (11ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "요청한 정보를 찾을 수 없습니다.",
  "errorCode": "NOTFOUND_001",
  "timestamp": "2026-11-03T04:37:43.964871381Z"
}
```

## 23. `DELETE /v1/users/profile` → 405 (6ms)

Request
```json
(없음)
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "지원하지 않는 요청 방식입니다.",
  "errorCode": "VALID_012",
  "timestamp": "2026-11-03T04:37:43.972683172Z"
}
```

## 24. `POST /v1/diet/analyze` → 415 (5ms)

Request
```json
{
  "image": "x"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "지원하지 않는 요청 형식입니다.",
  "errorCode": "VALID_013",
  "timestamp": "2026-11-03T04:37:43.978385506Z"
}
```

## 25. `GET /v1/users/profile` → 200 (20ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "큐에이324071",
    "name": "테스트",
    "email": "qaa324071a9@example.com",
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
  "timestamp": "2026-11-03T04:37:43.992070006Z"
}
```

## 26. `PUT /v1/users/profile` → 200 (17ms)

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
  "timestamp": "2026-11-03T04:37:44.016147381Z"
}
```

## 27. `PUT /v1/users/settings/notification` → 200 (20ms)

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
  "timestamp": "2026-11-03T04:37:44.108619672Z"
}
```

## 28. `PUT /v1/users/settings/notification` → 400 (5ms)

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
  "timestamp": "2026-11-03T04:37:44.114616381Z"
}
```

## 29. `PUT /v1/users/settings/budget` → 200 (12ms)

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
  "timestamp": "2026-11-03T04:37:44.127396506Z"
}
```

## 30. `PUT /v1/users/settings/budget` → 400 (6ms)

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
  "timestamp": "2026-11-03T04:37:44.205450922Z"
}
```

## 31. `POST /v1/users/devices` → 200 (16ms)

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
  "timestamp": "2026-11-03T04:37:44.222014589Z"
}
```

## 32. `POST /v1/users/devices` → 400 (5ms)

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
  "timestamp": "2026-11-03T04:37:44.228653256Z"
}
```

## 33. `GET /v1/home/dashboard` → 200 (21ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "큐에이324071",
    "date": "2026-11-03",
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
  "timestamp": "2026-11-03T04:37:44.247971756Z"
}
```

## 34. `POST /v1/diet/analyze` → 200 (43ms)

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
    "analyzeId": "anl_8f0451811a204658",
    "foodName": "닭가슴살 샐러드",
    "totalCalorie": 243,
    "totalCarb": 8.5,
    "totalProtein": 39.7,
    "totalFat": 4.9,
    "items": [
      {
        "itemId": "itm_8c6fb5d3e8d54b0b",
        "name": "닭가슴살",
        "weightGram": 120.0,
        "calorie": 198,
        "carb": 0.0,
        "protein": 37.2,
        "fat": 4.3
      },
      {
        "itemId": "itm_3e340ae20954496b",
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
  "timestamp": "2026-11-03T04:37:44.289579339Z"
}
```

## 35. `POST /v1/diet/analyze` → 400 (7ms)

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
  "timestamp": "2026-11-03T04:37:44.378940589Z"
}
```

## 36. `POST /v1/diet/analyze` → 400 (4ms)

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
  "timestamp": "2026-11-03T04:37:44.384176964Z"
}
```

## 37. `GET /v1/diet/items/itm_8c6fb5d3e8d54b0b` → 200 (21ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "itemId": "itm_8c6fb5d3e8d54b0b",
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
  "timestamp": "2026-11-03T04:37:44.403741256Z"
}
```

## 38. `GET /v1/diet/items/itm_8c6fb5d3e8d54b0b` → 404 (10ms)

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
  "timestamp": "2026-11-03T04:37:44.417098464Z"
}
```

## 39. `GET /v1/diet/items/item_does_not_exist` → 404 (10ms)

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
  "timestamp": "2026-11-03T04:37:44.427961381Z"
}
```

## 40. `POST /v1/diet/records` → 201 (50ms)

Request
```json
{
  "analyzeId": "anl_8f0451811a204658",
  "mealType": "LUNCH",
  "eatenAt": "2026-11-03T04:37:44Z",
  "items": [
    {
      "itemId": "itm_8c6fb5d3e8d54b0b",
      "name": "닭가슴살",
      "weightGram": 120.0,
      "calorie": 198,
      "carb": 0.0,
      "protein": 37.2,
      "fat": 4.3
    },
    {
      "itemId": "itm_3e340ae20954496b",
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
    "recordId": "rec_40af20a5218a477d",
    "eatenAt": "2026-11-03T04:37:44Z",
    "totalCalorie": 243
  },
  "message": "식단이 등록되었습니다.",
  "timestamp": "2026-11-03T04:37:44.477161339Z"
}
```

## 41. `POST /v1/diet/records` → 404 (12ms)

Request
```json
{
  "analyzeId": "anl_8f0451811a204658",
  "mealType": "LUNCH",
  "eatenAt": "2026-11-03T04:37:44Z",
  "items": [
    {
      "itemId": "itm_8c6fb5d3e8d54b0b",
      "name": "닭가슴살",
      "weightGram": 120.0,
      "calorie": 198,
      "carb": 0.0,
      "protein": 37.2,
      "fat": 4.3
    },
    {
      "itemId": "itm_3e340ae20954496b",
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
  "timestamp": "2026-11-03T04:37:44.561640714Z"
}
```

## 42. `POST /v1/diet/records/manual` → 201 (15ms)

Request
```json
{
  "mealType": "BREAKFAST",
  "eatenAt": "2026-11-03T04:37:44Z",
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
    "recordId": "rec_d04e530063124712"
  },
  "message": "식단이 등록되었습니다.",
  "timestamp": "2026-11-03T04:37:44.577824714Z"
}
```

## 43. `POST /v1/diet/records/manual` → 400 (5ms)

Request
```json
{
  "mealType": "BREAKFAST",
  "eatenAt": "2026-11-03T04:37:44Z",
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
  "timestamp": "2026-11-03T04:37:44.583929964Z"
}
```

## 44. `POST /v1/diet/records/manual` → 400 (5ms)

Request
```json
{
  "mealType": "BREAKFAST",
  "eatenAt": "2026-11-03T04:37:44Z",
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
  "timestamp": "2026-11-03T04:37:44.589789673Z"
}
```

## 45. `GET /v1/diet/calendar?year=2026&month=11` → 200 (11ms)

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
    "month": 11,
    "recordedDates": [
      "2026-11-03"
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:44.599782923Z"
}
```

## 46. `GET /v1/diet/calendar?year=2026&month=13` → 400 (5ms)

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
  "timestamp": "2026-11-03T04:37:44.606972089Z"
}
```

## 47. `GET /v1/diet/records?date=2026-11-03` → 200 (13ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "date": "2026-11-03",
    "totalCalorie": 383,
    "records": [
      {
        "recordId": "rec_40af20a5218a477d",
        "mealType": "LUNCH",
        "eatenAt": "2026-11-03T04:37:44Z",
        "thumbnailUrl": "/uploads/diet/e6fae02248964d82a343d27dd7e1d4f6.png",
        "foodName": "닭가슴살 외 1개",
        "totalWeightGram": 270.0,
        "totalCalorie": 243,
        "carb": 8.5,
        "protein": 39.7,
        "fat": 4.9
      },
      {
        "recordId": "rec_d04e530063124712",
        "mealType": "BREAKFAST",
        "eatenAt": "2026-11-03T04:37:44Z",
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
  "timestamp": "2026-11-03T04:37:44.618259548Z"
}
```

## 48. `GET /v1/diet/records?date=2026-13-40` → 400 (8ms)

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
  "timestamp": "2026-11-03T04:37:44.629009339Z"
}
```

## 49. `GET /v1/diet/calendar?year=abc&month=11` → 400 (4ms)

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
  "timestamp": "2026-11-03T04:37:44.633999381Z"
}
```

## 50. `GET /v1/diet/records/rec_40af20a5218a477d` → 200 (14ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_40af20a5218a477d",
    "analyzeId": "anl_8f0451811a204658",
    "mealType": "LUNCH",
    "eatenAt": "2026-11-03T04:37:44Z",
    "thumbnailUrl": "/uploads/diet/e6fae02248964d82a343d27dd7e1d4f6.png",
    "foodName": "닭가슴살 외 1개",
    "totalWeightGram": 270.0,
    "totalCalorie": 243,
    "carb": 8.5,
    "protein": 39.7,
    "fat": 4.9,
    "items": [
      {
        "itemId": "itm_8c6fb5d3e8d54b0b",
        "name": "닭가슴살",
        "weightGram": 120.0,
        "calorie": 198,
        "carb": 0.0,
        "protein": 37.2,
        "fat": 4.3
      },
      {
        "itemId": "itm_3e340ae20954496b",
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
  "timestamp": "2026-11-03T04:37:44.646140381Z"
}
```

## 51. `GET /v1/diet/records/rec_40af20a5218a477d` → 404 (8ms)

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
  "timestamp": "2026-11-03T04:37:44.657315298Z"
}
```

## 52. `PUT /v1/diet/records/rec_d04e530063124712` → 200 (19ms)

Request
```json
{
  "mealType": "DINNER",
  "eatenAt": "2026-11-03T04:37:44Z",
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
    "recordId": "rec_d04e530063124712"
  },
  "message": "식단이 수정되었습니다.",
  "timestamp": "2026-11-03T04:37:44.676952881Z"
}
```

## 53. `PUT /v1/diet/records/rec_d04e530063124712` → 404 (10ms)

Request
```json
{
  "mealType": "DINNER",
  "eatenAt": "2026-11-03T04:37:44Z",
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
  "timestamp": "2026-11-03T04:37:44.764731714Z"
}
```

## 54. `GET /v1/diet/foods/search?keyword=%EB%8B%AD` → 200 (17ms)

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
  "timestamp": "2026-11-03T04:37:44.780057589Z"
}
```

## 55. `GET /v1/diet/foods/search?keyword=%EC%A1%B4%EC%9E%AC%ED%95%98%EC%A7%80%EC%95%8A%EB%8A%94%EC%9D%8C%EC%8B%9D%EB%AA%85xyz` → 200 (7ms)

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
  "timestamp": "2026-11-03T04:37:44.789758464Z"
}
```

## 56. `GET /v1/home/dashboard` → 200 (8ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "큐에이324071",
    "date": "2026-11-03",
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
  "timestamp": "2026-11-03T04:37:44.798294381Z"
}
```

## 57. `GET /v1/statistics/daily?date=2026-11-03` → 200 (9ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "date": "2026-11-03",
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
  "timestamp": "2026-11-03T04:37:44.806786923Z"
}
```

## 58. `GET /v1/statistics/weekly?startDate=2026-11-02` → 200 (11ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "startDate": "2026-11-02",
    "endDate": "2026-11-08",
    "daily": [
      {
        "date": "2026-11-02",
        "calorieConsumed": 0,
        "calorieGoal": 1300,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-11-03",
        "calorieConsumed": 433,
        "calorieGoal": 1300,
        "carbPercentage": 11,
        "proteinPercentage": 74,
        "fatPercentage": 33
      },
      {
        "date": "2026-11-04",
        "calorieConsumed": 0,
        "calorieGoal": 1300,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-11-05",
        "calorieConsumed": 0,
        "calorieGoal": 1300,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-11-06",
        "calorieConsumed": 0,
        "calorieGoal": 1300,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-11-07",
        "calorieConsumed": 0,
        "calorieGoal": 1300,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-11-08",
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

## 59. `GET /v1/statistics/monthly?year=2026&month=11` → 200 (12ms)

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
    "month": 11,
    "daily": [
      {
        "date": "2026-11-01",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-02",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-03",
        "calorieConsumed": 433,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-04",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-05",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-06",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-07",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-08",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-09",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-10",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-11",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-12",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-13",
        "calorieConsumed": 0,
        "calorieGoal": 1300
      },
      {
        "date": "2026-11-14",
        "cal
... (생략)
```

## 60. `GET /v1/ai/feedback/daily?date=2026-11-03` → 200 (16ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "period": "2026-11-03",
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
  "timestamp": "2026-11-03T04:37:44.846187256Z"
}
```

## 61. `GET /v1/ai/feedback/weekly?startDate=2026-11-02` → 200 (10ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "period": "2026-11-02 ~ 2026-11-08",
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
  "timestamp": "2026-11-03T04:37:44.858850673Z"
}
```

## 62. `GET /v1/ai/feedback/monthly?year=2026&month=11` → 200 (10ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "period": "2026-11-01 ~ 2026-11-30",
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
  "timestamp": "2026-11-03T04:37:44.870142589Z"
}
```

## 63. `GET /v1/statistics/daily?date=yesterday` → 400 (4ms)

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
  "timestamp": "2026-11-03T04:37:44.875117006Z"
}
```

## 64. `GET /v1/ai/feedback/monthly?year=2026&month=0` → 400 (4ms)

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
  "timestamp": "2026-11-03T04:37:44.880278381Z"
}
```

## 65. `GET /v1/menu/recommend/summary` → 200 (17ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "date": "2026-11-03",
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
  "timestamp": "2026-11-03T04:37:44.895667089Z"
}
```

## 66. `GET /v1/menu/recommend/dining-out?budget=15000` → 200 (14ms)

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
  "timestamp": "2026-11-03T04:37:44.910306589Z"
}
```

## 67. `GET /v1/menu/categories/cat_001/items?budget=15000` → 200 (11ms)

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
  "timestamp": "2026-11-03T04:37:44.922416339Z"
}
```

## 68. `GET /v1/menu/categories/cat_none/items` → 404 (6ms)

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
  "timestamp": "2026-11-03T04:37:44.930683256Z"
}
```

## 69. `GET /v1/menu/items/menu_001` → 200 (13ms)

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
  "timestamp": "2026-11-03T04:37:44.942343089Z"
}
```

## 70. `GET /v1/menu/items/menu_none` → 404 (5ms)

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
  "timestamp": "2026-11-03T04:37:44.950249881Z"
}
```

## 71. `GET /v1/menu/nearby-stores?lat=37.4985&lng=127.028&categoryId=cat_001&radius=1000` → 403 (8ms)

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
  "timestamp": "2026-11-03T04:37:44.958974339Z"
}
```

## 72. `POST /v1/users/location-consent` → 200 (11ms)

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
  "timestamp": "2026-11-03T04:37:44.970226048Z"
}
```

## 73. `POST /v1/users/location-consent` → 400 (4ms)

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
  "timestamp": "2026-11-03T04:37:44.975525006Z"
}
```

## 74. `GET /v1/menu/nearby-stores?lat=37.4985&lng=127.028&categoryId=cat_001&radius=1000` → 200 (21ms)

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
  "timestamp": "2026-11-03T04:37:44.994900340Z"
}
```

## 75. `GET /v1/menu/nearby-stores?lat=123&lng=127.028&categoryId=cat_001&radius=1000` → 400 (22ms)

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
  "timestamp": "2026-11-03T04:37:45.020074173Z"
}
```

## 76. `GET /v1/menu/nearby-stores?lat=north&lng=127.028&categoryId=cat_001&radius=1000` → 400 (4ms)

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
  "timestamp": "2026-11-03T04:37:45.024798256Z"
}
```

## 77. `POST /v1/fridge/ingredients` → 201 (23ms)

Request
```json
{
  "ingredients": [
    {
      "name": "닭가슴살",
      "quantity": 2,
      "unit": "팩",
      "expiryDate": "2026-11-03"
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
  "timestamp": "2026-11-03T04:37:45.048065965Z"
}
```

## 78. `POST /v1/fridge/ingredients` → 400 (6ms)

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
  "timestamp": "2026-11-03T04:37:45.136590590Z"
}
```

## 79. `GET /v1/fridge/ingredients` → 200 (16ms)

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
        "ingredientId": "ing_13b91a8886da4e5e",
        "name": "닭가슴살",
        "quantity": 2.0,
        "unit": "팩",
        "expiryDate": "2026-11-03",
        "isExpiringSoon": true
      },
      {
        "ingredientId": "ing_9eb6260d66884bba",
        "name": "현미밥",
        "quantity": 1.0,
        "unit": "공기",
        "isExpiringSoon": false
      },
      {
        "ingredientId": "ing_08114b55e4d74be7",
        "name": "두부",
        "quantity": 1.0,
        "unit": "모",
        "isExpiringSoon": false
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:45.151457673Z"
}
```

## 80. `PUT /v1/fridge/ingredients/ing_08114b55e4d74be7` → 200 (15ms)

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
  "timestamp": "2026-11-03T04:37:45.168730631Z"
}
```

## 81. `PUT /v1/fridge/ingredients/ing_08114b55e4d74be7` → 404 (11ms)

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
  "timestamp": "2026-11-03T04:37:45.251880590Z"
}
```

## 82. `GET /v1/menu/recommend/home-cooking?budget=10000` → 200 (24ms)

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
  "timestamp": "2026-11-03T04:37:45.274642506Z"
}
```

## 83. `GET /v1/menu/recipes?categoryId=hcat_002&budget=10000` → 200 (16ms)

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
  "timestamp": "2026-11-03T04:37:45.290760548Z"
}
```

## 84. `GET /v1/menu/recipes?categoryId=hcat_none` → 404 (6ms)

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
  "timestamp": "2026-11-03T04:37:45.299477006Z"
}
```

## 85. `GET /v1/menu/recipes/recipe_003` → 200 (17ms)

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
  "timestamp": "2026-11-03T04:37:45.313301673Z"
}
```

## 86. `GET /v1/menu/recipes/recipe_none` → 404 (5ms)

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
  "timestamp": "2026-11-03T04:37:45.322787298Z"
}
```

## 87. `POST /v1/menu/recommend/leftover` → 200 (18ms)

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

## 88. `GET /v1/menu/recipes/recipe_003/shopping-list` → 200 (14ms)

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

## 89. `GET /v1/menu/recipes/recipe_none/shopping-list` → 404 (7ms)

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
  "timestamp": "2026-11-03T04:37:45.364049840Z"
}
```

## 90. `DELETE /v1/fridge/ingredients/ing_08114b55e4d74be7` → 404 (7ms)

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
  "timestamp": "2026-11-03T04:37:45.372310465Z"
}
```

## 91. `DELETE /v1/fridge/ingredients/ing_08114b55e4d74be7` → 200 (11ms)

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
  "timestamp": "2026-11-03T04:37:45.383070631Z"
}
```

## 92. `POST /v1/community/analyze-image` → 200 (10ms)

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
    "foodName": "참치 채소 덮밥",
    "calorie": 440,
    "carb": 70.8,
    "protein": 32.1,
    "fat": 1.8
  },
  "message": "AI 분석이 완료되었습니다.",
  "timestamp": "2026-11-03T04:37:45.459293090Z"
}
```

## 93. `POST /v1/community/analyze-image` → 400 (5ms)

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
  "timestamp": "2026-11-03T04:37:45.466114131Z"
}
```

## 94. `POST /v1/community/posts` → 201 (16ms)

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
    "postId": "post_ae16b825989c4e57"
  },
  "message": "게시글이 등록되었습니다.",
  "timestamp": "2026-11-03T04:37:45.482152381Z"
}
```

## 95. `POST /v1/community/posts` → 400 (6ms)

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
  "timestamp": "2026-11-03T04:37:45.562885173Z"
}
```

## 96. `GET /v1/community/posts?page=0&size=20` → 200 (13ms)

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
        "postId": "post_ae16b825989c4e57",
        "title": "QA 통합 테스트 게시글",
        "authorNickname": "큐에이324071",
        "createdAt": "2026-11-03T04:37:45.478200Z",
        "thumbnailUrl": "/v1/uploads/community/37fd2609a41b4205b340ad181fa4b420.png",
        "likeCount": 0,
        "commentCount": 0
      },
      {
        "postId": "post_b58e4a2b71984234",
        "title": "QA 데모: 오늘 점심 닭가슴살 현미밥",
        "authorNickname": "밥풀QA",
        "createdAt": "2026-10-14T10:15:52.249502Z",
        "thumbnailUrl": "/v1/uploads/community/27334797e69145f68ea3c0c376883c76.png",
        "likeCount": 0,
        "commentCount": 0
      }
    ],
    "totalCount": 2,
    "page": 0,
    "size": 20,
    "hasNext": false
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:45.574292673Z"
}
```

## 97. `GET /v1/community/posts?page=0&size=999` → 400 (5ms)

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
  "timestamp": "2026-11-03T04:37:45.581897090Z"
}
```

## 98. `GET /v1/community/posts?page=first` → 400 (3ms)

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
  "timestamp": "2026-11-03T04:37:45.585554048Z"
}
```

## 99. `GET /v1/community/posts/post_ae16b825989c4e57` → 200 (17ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "postId": "post_ae16b825989c4e57",
    "content": "QA 통합 테스트 게시글",
    "imageUrl": "/v1/uploads/community/37fd2609a41b4205b340ad181fa4b420.png",
    "authorNickname": "큐에이324071",
    "createdAt": "2026-11-03T04:37:45.478200Z",
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
  "timestamp": "2026-11-03T04:37:45.600406381Z"
}
```

## 100. `GET /v1/uploads/community/37fd2609a41b4205b340ad181fa4b420.png` → 200 (4ms)

Request
```json
(없음)
```
Response
```json
<71 bytes>
```

## 101. `GET /v1/uploads/community/..%2F..%2Fetc%2Fpasswd` → 400 (3ms)

Request
```json
(없음)
```
Response
```json
<435 bytes>
```

## 102. `PUT /v1/community/posts/post_ae16b825989c4e57` → 403 (14ms)

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
  "timestamp": "2026-11-03T04:37:45.625715715Z"
}
```

## 103. `PUT /v1/community/posts/post_ae16b825989c4e57` → 200 (11ms)

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
  "timestamp": "2026-11-03T04:37:45.638255923Z"
}
```

## 104. `POST /v1/community/posts/post_ae16b825989c4e57/comments` → 201 (16ms)

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
    "commentId": "cmt_bb25f014de2041b9"
  },
  "message": "댓글이 등록되었습니다.",
  "timestamp": "2026-11-03T04:37:45.654217673Z"
}
```

## 105. `POST /v1/community/posts/post_ae16b825989c4e57/comments` → 400 (4ms)

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
  "timestamp": "2026-11-03T04:37:45.659439007Z"
}
```

## 106. `POST /v1/community/posts/post_ae16b825989c4e57/likes` → 200 (14ms)

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
  "timestamp": "2026-11-03T04:37:45.673889340Z"
}
```

## 107. `POST /v1/community/posts/post_ae16b825989c4e57/likes` → 200 (13ms)

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
  "timestamp": "2026-11-03T04:37:45.688346673Z"
}
```

## 108. `GET /v1/community/posts/post_ae16b825989c4e57` → 200 (12ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "postId": "post_ae16b825989c4e57",
    "content": "QA 수정된 게시글",
    "imageUrl": "/v1/uploads/community/37fd2609a41b4205b340ad181fa4b420.png",
    "authorNickname": "큐에이324071",
    "createdAt": "2026-11-03T04:37:45.478200Z",
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
        "commentId": "cmt_bb25f014de2041b9",
        "authorNickname": "큐에이fa861f",
        "content": "맛있어 보여요",
        "createdAt": "2026-11-03T04:37:45.651047Z"
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:45.701300840Z"
}
```

## 109. `DELETE /v1/community/posts/post_ae16b825989c4e57/comments/cmt_bb25f014de2041b9` → 403 (12ms)

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
  "timestamp": "2026-11-03T04:37:45.714187382Z"
}
```

## 110. `DELETE /v1/community/posts/post_ae16b825989c4e57/comments/cmt_bb25f014de2041b9` → 200 (15ms)

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
  "timestamp": "2026-11-03T04:37:45.729946798Z"
}
```

## 111. `DELETE /v1/community/posts/post_ae16b825989c4e57` → 403 (10ms)

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
  "timestamp": "2026-11-03T04:37:45.740526132Z"
}
```

## 112. `DELETE /v1/community/posts/post_ae16b825989c4e57` → 200 (17ms)

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
  "timestamp": "2026-11-03T04:37:45.758426340Z"
}
```

## 113. `GET /v1/community/posts/post_ae16b825989c4e57` → 404 (9ms)

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
  "timestamp": "2026-11-03T04:37:45.768246257Z"
}
```

## 114. `DELETE /v1/diet/records/rec_40af20a5218a477d` → 404 (7ms)

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
  "timestamp": "2026-11-03T04:37:45.776342257Z"
}
```

## 115. `DELETE /v1/diet/records/rec_40af20a5218a477d` → 200 (12ms)

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
  "timestamp": "2026-11-03T04:37:45.789160757Z"
}
```

## 116. `GET /v1/diet/records/rec_40af20a5218a477d` → 404 (7ms)

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
  "timestamp": "2026-11-03T04:37:45.796875882Z"
}
```

## 117. `PUT /v1/users/password` → 401 (459ms)

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
  "timestamp": "2026-11-03T04:37:46.255363798Z"
}
```

## 118. `PUT /v1/users/password` → 400 (457ms)

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
  "timestamp": "2026-11-03T04:37:46.713042382Z"
}
```

## 119. `PUT /v1/users/password` → 200 (912ms)

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
  "timestamp": "2026-11-03T04:37:47.626081674Z"
}
```

## 120. `POST /v1/auth/token/refresh` → 401 (5ms)

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
  "timestamp": "2026-11-03T04:37:47.632844382Z"
}
```

## 121. `POST /v1/auth/login` → 200 (460ms)

Request
```json
{
  "username": "qaa324071a9",
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
    "userId": "u_119",
    "nickname": "큐에이324071"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:37:48.092386549Z"
}
```

## 122. `POST /v1/auth/logout` → 200 (8ms)

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
  "timestamp": "2026-11-03T04:37:48.101195883Z"
}
```

## 123. `POST /v1/auth/token/refresh` → 401 (4ms)

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
  "timestamp": "2026-11-03T04:37:48.106553174Z"
}
```

## 124. `DELETE /v1/users/account` → 401 (456ms)

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
  "timestamp": "2026-11-03T04:37:48.562087716Z"
}
```

## 125. `DELETE /v1/users/account` → 200 (490ms)

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
  "timestamp": "2026-11-03T04:37:49.053533633Z"
}
```

## 126. `POST /v1/auth/login` → 401 (7ms)

Request
```json
{
  "username": "qaa324071a9",
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
  "timestamp": "2026-11-03T04:37:49.131457550Z"
}
```

## 127. `POST /v1/auth/login` → 200 (459ms)

Request
```json
{
  "username": "qabfa861f71",
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
    "userId": "u_120",
    "nickname": "큐에이fa861f"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:37:49.590855300Z"
}
```

## 128. `DELETE /v1/users/account` → 200 (469ms)

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
  "timestamp": "2026-11-03T04:37:50.060004259Z"
}
```
