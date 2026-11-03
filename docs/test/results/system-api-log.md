# 시스템 테스트 API 요청·응답 로그

- 생성 시각: 2026-11-03 13:38:08
- 대상 서버: `http://127.0.0.1:8080/v1`
- 총 요청 수: 113

민감 값(비밀번호, 토큰, 기기 토큰)은 `***`로 가렸습니다. 긴 응답은 잘라서 표시했습니다.

## 1. `GET /v1/auth/check/username?value=qas109cb075e` → 200 (25ms)

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
  "timestamp": "2026-11-03T04:37:50.304820134Z"
}
```

## 2. `GET /v1/auth/check/email?value=qas109cb075e%40example.com` → 200 (10ms)

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
  "timestamp": "2026-11-03T04:37:50.315945259Z"
}
```

## 3. `GET /v1/auth/check/nickname?value=%ED%81%90%EC%97%90%EC%9D%B409cb07` → 200 (6ms)

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
  "timestamp": "2026-11-03T04:37:50.323221259Z"
}
```

## 4. `POST /v1/auth/register` → 201 (463ms)

Request
```json
{
  "username": "qas109cb075e",
  "email": "qas109cb075e@example.com",
  "nickname": "큐에이09cb07",
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
    "userId": "u_121",
    "nickname": "큐에이09cb07",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:37:50.786621551Z"
}
```

## 5. `POST /v1/auth/login` → 200 (464ms)

Request
```json
{
  "username": "qas109cb075e",
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
    "userId": "u_121",
    "nickname": "큐에이09cb07"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:37:51.251701968Z"
}
```

## 6. `POST /v1/users/profile/initial` → 200 (13ms)

Request
```json
{
  "gender": "M",
  "age": 25,
  "height": 175.0,
  "weight": 72.0,
  "activityLevel": "LIGHT",
  "goal": "LOSE"
}
```
Response
```json
{
  "success": true,
  "data": {
    "dailyCalorieGoal": 1900,
    "carbGoalGram": 238,
    "proteinGoalGram": 119,
    "fatGoalGram": 53,
    "isPreciseMode": false
  },
  "message": "신체정보가 저장되었습니다.",
  "timestamp": "2026-11-03T04:37:51.264704551Z"
}
```

## 7. `POST /v1/auth/login` → 200 (462ms)

Request
```json
{
  "username": "qas109cb075e",
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
    "userId": "u_121",
    "nickname": "큐에이09cb07"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:37:51.727641093Z"
}
```

## 8. `GET /v1/home/dashboard` → 200 (9ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "큐에이09cb07",
    "date": "2026-11-03",
    "tomatoStatus": "HUNGRY",
    "calorieGoal": 1900,
    "calorieConsumed": 0,
    "calorieRemaining": 1900,
    "calorieExceeded": 0,
    "carb": {
      "goalGram": 238,
      "consumedGram": 0.0,
      "percentage": 0
    },
    "protein": {
      "goalGram": 119,
      "consumedGram": 0.0,
      "percentage": 0
    },
    "fat": {
      "goalGram": 53,
      "consumedGram": 0.0,
      "percentage": 0
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:51.738022593Z"
}
```

## 9. `DELETE /v1/users/account` → 200 (472ms)

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
  "timestamp": "2026-11-03T04:37:52.211310426Z"
}
```

## 10. `POST /v1/auth/register` → 201 (523ms)

Request
```json
{
  "username": "qas23d58c8ff",
  "email": "qas23d58c8ff@example.com",
  "nickname": "큐에이3d58c8",
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
    "userId": "u_122",
    "nickname": "큐에이3d58c8",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:37:52.734658135Z"
}
```

## 11. `POST /v1/auth/login` → 200 (470ms)

Request
```json
{
  "username": "qas23d58c8ff",
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
    "userId": "u_122",
    "nickname": "큐에이3d58c8"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:37:53.204436218Z"
}
```

## 12. `POST /v1/users/profile/initial` → 200 (13ms)

Request
```json
{
  "gender": "F",
  "age": 24,
  "height": 163.0,
  "weight": 56.0,
  "activityLevel": "MODERATE",
  "goal": "MAINTAIN"
}
```
Response
```json
{
  "success": true,
  "data": {
    "dailyCalorieGoal": 2000,
    "carbGoalGram": 250,
    "proteinGoalGram": 125,
    "fatGoalGram": 56,
    "isPreciseMode": false
  },
  "message": "신체정보가 저장되었습니다.",
  "timestamp": "2026-11-03T04:37:53.218848677Z"
}
```

## 13. `POST /v1/diet/analyze` → 200 (16ms)

Request
```json
{
  "form": {},
  "files": {
    "image": "chicken_lunch.png (image/png, 71B)"
  }
}
```
Response
```json
{
  "success": true,
  "data": {
    "analyzeId": "anl_751ac0b021034c47",
    "foodName": "닭가슴살 현미밥",
    "totalCalorie": 523,
    "totalCarb": 56.7,
    "totalProtein": 51.5,
    "totalFat": 7.4,
    "items": [
      {
        "itemId": "itm_b6c892e8f0554bf8",
        "name": "닭가슴살",
        "weightGram": 150.0,
        "calorie": 248,
        "carb": 0.0,
        "protein": 46.5,
        "fat": 5.4
      },
      {
        "itemId": "itm_4465b72a08704c24",
        "name": "현미밥",
        "weightGram": 180.0,
        "calorie": 275,
        "carb": 56.7,
        "protein": 5.0,
        "fat": 2.0
      }
    ]
  },
  "message": "AI 분석이 완료되었습니다.",
  "timestamp": "2026-11-03T04:37:53.235792968Z"
}
```

## 14. `GET /v1/diet/items/itm_b6c892e8f0554bf8` → 200 (9ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "itemId": "itm_b6c892e8f0554bf8",
    "name": "닭가슴살",
    "totalWeightGram": 150.0,
    "totalCalorie": 248,
    "carb": 0.0,
    "protein": 46.5,
    "fat": 5.4,
    "sodium": 111.0,
    "cholesterol": 128.0,
    "ingredients": [
      {
        "name": "닭가슴살",
        "weightGram": 150.0
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:53.245794510Z"
}
```

## 15. `POST /v1/diet/records` → 201 (18ms)

Request
```json
{
  "analyzeId": "anl_751ac0b021034c47",
  "mealType": "LUNCH",
  "eatenAt": "2026-11-03T04:37:53Z",
  "items": [
    {
      "itemId": "itm_b6c892e8f0554bf8",
      "name": "닭가슴살",
      "weightGram": 225.0,
      "calorie": 372,
      "carb": 0.0,
      "protein": 46.5,
      "fat": 5.4
    },
    {
      "itemId": "itm_4465b72a08704c24",
      "name": "현미밥",
      "weightGram": 180.0,
      "calorie": 275,
      "carb": 56.7,
      "protein": 5.0,
      "fat": 2.0
    }
  ]
}
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_c0e7b8fb3aa04ead",
    "eatenAt": "2026-11-03T04:37:53Z",
    "totalCalorie": 647
  },
  "message": "식단이 등록되었습니다.",
  "timestamp": "2026-11-03T04:37:53.264799677Z"
}
```

## 16. `GET /v1/home/dashboard` → 200 (9ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "큐에이3d58c8",
    "date": "2026-11-03",
    "tomatoStatus": "HUNGRY",
    "calorieGoal": 2000,
    "calorieConsumed": 647,
    "calorieRemaining": 1353,
    "calorieExceeded": 0,
    "carb": {
      "goalGram": 250,
      "consumedGram": 56.7,
      "percentage": 23
    },
    "protein": {
      "goalGram": 125,
      "consumedGram": 51.5,
      "percentage": 41
    },
    "fat": {
      "goalGram": 56,
      "consumedGram": 7.4,
      "percentage": 13
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:53.273808302Z"
}
```

## 17. `GET /v1/diet/calendar?year=2026&month=11` → 200 (8ms)

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
  "timestamp": "2026-11-03T04:37:53.282963218Z"
}
```

## 18. `GET /v1/diet/records?date=2026-11-03` → 200 (7ms)

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
    "totalCalorie": 647,
    "records": [
      {
        "recordId": "rec_c0e7b8fb3aa04ead",
        "mealType": "LUNCH",
        "eatenAt": "2026-11-03T04:37:53Z",
        "thumbnailUrl": "/uploads/diet/9e7f1507a79e4ce490c0bc140b49d057.png",
        "foodName": "닭가슴살 외 1개",
        "totalWeightGram": 405.0,
        "totalCalorie": 647,
        "carb": 56.7,
        "protein": 51.5,
        "fat": 7.4
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:53.290468635Z"
}
```

## 19. `GET /v1/statistics/daily?date=2026-11-03` → 200 (8ms)

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
    "calorieGoal": 2000,
    "calorieConsumed": 647,
    "caloriePercentage": 32,
    "carb": {
      "goalGram": 250,
      "consumedGram": 56.7,
      "percentage": 23
    },
    "protein": {
      "goalGram": 125,
      "consumedGram": 51.5,
      "percentage": 41
    },
    "fat": {
      "goalGram": 56,
      "consumedGram": 7.4,
      "percentage": 13
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:53.299163052Z"
}
```

## 20. `DELETE /v1/users/account` → 200 (468ms)

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
  "timestamp": "2026-11-03T04:37:53.767368885Z"
}
```

## 21. `POST /v1/auth/register` → 201 (463ms)

Request
```json
{
  "username": "qas3d2390ec7",
  "email": "qas3d2390ec7@example.com",
  "nickname": "큐에이d2390e",
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
    "userId": "u_123",
    "nickname": "큐에이d2390e",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:37:54.231094927Z"
}
```

## 22. `POST /v1/auth/login` → 200 (485ms)

Request
```json
{
  "username": "qas3d2390ec7",
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
    "userId": "u_123",
    "nickname": "큐에이d2390e"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:37:54.716664052Z"
}
```

## 23. `POST /v1/users/profile/initial` → 200 (9ms)

Request
```json
{
  "gender": "F",
  "age": 24,
  "height": 163.0,
  "weight": 56.0,
  "activityLevel": "MODERATE",
  "goal": "MAINTAIN"
}
```
Response
```json
{
  "success": true,
  "data": {
    "dailyCalorieGoal": 2000,
    "carbGoalGram": 250,
    "proteinGoalGram": 125,
    "fatGoalGram": 56,
    "isPreciseMode": false
  },
  "message": "신체정보가 저장되었습니다.",
  "timestamp": "2026-11-03T04:37:54.726346677Z"
}
```

## 24. `GET /v1/diet/foods/search?keyword=%EB%8B%AC%EA%B1%80` → 200 (7ms)

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
        "foodId": "food_003",
        "name": "달걀",
        "baseWeightGram": 100.0,
        "calorie": 143,
        "carb": 0.7,
        "protein": 12.6,
        "fat": 9.5
      }
    ],
    "totalCount": 1,
    "page": 0,
    "size": 20,
    "hasNext": false
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:54.734852719Z"
}
```

## 25. `POST /v1/diet/records/manual` → 201 (10ms)

Request
```json
{
  "mealType": "BREAKFAST",
  "eatenAt": "2026-11-03T04:37:54Z",
  "items": [
    {
      "name": "달걀",
      "weightGram": 100,
      "calorie": 143,
      "carb": 0.7,
      "protein": 12.6,
      "fat": 9.5
    }
  ]
}
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_f0b9b0cba3b34d7b"
  },
  "message": "식단이 등록되었습니다.",
  "timestamp": "2026-11-03T04:37:54.745785511Z"
}
```

## 26. `PUT /v1/diet/records/rec_f0b9b0cba3b34d7b` → 200 (12ms)

Request
```json
{
  "mealType": "DINNER",
  "eatenAt": "2026-11-03T04:37:54Z",
  "items": [
    {
      "name": "달걀",
      "weightGram": 200,
      "calorie": 286,
      "carb": 0.7,
      "protein": 12.6,
      "fat": 9.5
    }
  ]
}
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_f0b9b0cba3b34d7b"
  },
  "message": "식단이 수정되었습니다.",
  "timestamp": "2026-11-03T04:37:54.758968761Z"
}
```

## 27. `GET /v1/diet/records/rec_f0b9b0cba3b34d7b` → 200 (8ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_f0b9b0cba3b34d7b",
    "mealType": "DINNER",
    "eatenAt": "2026-11-03T04:37:54Z",
    "foodName": "달걀",
    "totalWeightGram": 200.0,
    "totalCalorie": 286,
    "carb": 0.7,
    "protein": 12.6,
    "fat": 9.5,
    "items": [
      {
        "itemId": "itm_8b6c72e456c24d79",
        "name": "달걀",
        "weightGram": 200.0,
        "calorie": 286,
        "carb": 0.7,
        "protein": 12.6,
        "fat": 9.5
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:54.768324094Z"
}
```

## 28. `DELETE /v1/diet/records/rec_f0b9b0cba3b34d7b` → 200 (11ms)

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
  "timestamp": "2026-11-03T04:37:54.779951303Z"
}
```

## 29. `GET /v1/diet/records?date=2026-11-03` → 200 (8ms)

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
    "totalCalorie": 0,
    "records": []
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:54.788943511Z"
}
```

## 30. `GET /v1/home/dashboard` → 200 (11ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "큐에이d2390e",
    "date": "2026-11-03",
    "tomatoStatus": "HUNGRY",
    "calorieGoal": 2000,
    "calorieConsumed": 0,
    "calorieRemaining": 2000,
    "calorieExceeded": 0,
    "carb": {
      "goalGram": 250,
      "consumedGram": 0.0,
      "percentage": 0
    },
    "protein": {
      "goalGram": 125,
      "consumedGram": 0.0,
      "percentage": 0
    },
    "fat": {
      "goalGram": 56,
      "consumedGram": 0.0,
      "percentage": 0
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:54.800487428Z"
}
```

## 31. `DELETE /v1/users/account` → 200 (471ms)

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
  "timestamp": "2026-11-03T04:37:55.272534261Z"
}
```

## 32. `POST /v1/auth/register` → 201 (461ms)

Request
```json
{
  "username": "qas43511078e",
  "email": "qas43511078e@example.com",
  "nickname": "큐에이351107",
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
    "userId": "u_124",
    "nickname": "큐에이351107",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:37:55.734754303Z"
}
```

## 33. `POST /v1/auth/login` → 200 (458ms)

Request
```json
{
  "username": "qas43511078e",
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
    "userId": "u_124",
    "nickname": "큐에이351107"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:37:56.194093553Z"
}
```

## 34. `POST /v1/users/profile/initial` → 200 (9ms)

Request
```json
{
  "gender": "F",
  "age": 24,
  "height": 163.0,
  "weight": 56.0,
  "activityLevel": "MODERATE",
  "goal": "MAINTAIN"
}
```
Response
```json
{
  "success": true,
  "data": {
    "dailyCalorieGoal": 2000,
    "carbGoalGram": 250,
    "proteinGoalGram": 125,
    "fatGoalGram": 56,
    "isPreciseMode": false
  },
  "message": "신체정보가 저장되었습니다.",
  "timestamp": "2026-11-03T04:37:56.203711720Z"
}
```

## 35. `POST /v1/diet/records/manual` → 201 (10ms)

Request
```json
{
  "mealType": "BREAKFAST",
  "eatenAt": "2026-11-03T04:37:56Z",
  "items": [
    {
      "name": "BREAKFAST 식사",
      "weightGram": 300,
      "calorie": 350,
      "carb": 50,
      "protein": 15,
      "fat": 10
    }
  ]
}
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_10a33f5f04944001"
  },
  "message": "식단이 등록되었습니다.",
  "timestamp": "2026-11-03T04:37:56.213648553Z"
}
```

## 36. `POST /v1/diet/records/manual` → 201 (8ms)

Request
```json
{
  "mealType": "LUNCH",
  "eatenAt": "2026-11-03T04:37:56Z",
  "items": [
    {
      "name": "LUNCH 식사",
      "weightGram": 300,
      "calorie": 650,
      "carb": 80,
      "protein": 35,
      "fat": 20
    }
  ]
}
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_5451853efa97423e"
  },
  "message": "식단이 등록되었습니다.",
  "timestamp": "2026-11-03T04:37:56.223534720Z"
}
```

## 37. `POST /v1/diet/records/manual` → 201 (9ms)

Request
```json
{
  "mealType": "DINNER",
  "eatenAt": "2026-11-03T04:37:56Z",
  "items": [
    {
      "name": "DINNER 식사",
      "weightGram": 300,
      "calorie": 550,
      "carb": 60,
      "protein": 30,
      "fat": 18
    }
  ]
}
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_4a9f5edb7b714d5a"
  },
  "message": "식단이 등록되었습니다.",
  "timestamp": "2026-11-03T04:37:56.232666637Z"
}
```

## 38. `GET /v1/statistics/daily?date=2026-11-03` → 200 (6ms)

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
    "calorieGoal": 2000,
    "calorieConsumed": 1550,
    "caloriePercentage": 78,
    "carb": {
      "goalGram": 250,
      "consumedGram": 190.0,
      "percentage": 76
    },
    "protein": {
      "goalGram": 125,
      "consumedGram": 80.0,
      "percentage": 64
    },
    "fat": {
      "goalGram": 56,
      "consumedGram": 48.0,
      "percentage": 86
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:56.239693387Z"
}
```

## 39. `GET /v1/statistics/weekly?startDate=2026-11-02` → 200 (6ms)

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
        "calorieGoal": 2000,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-11-03",
        "calorieConsumed": 1550,
        "calorieGoal": 2000,
        "carbPercentage": 76,
        "proteinPercentage": 64,
        "fatPercentage": 86
      },
      {
        "date": "2026-11-04",
        "calorieConsumed": 0,
        "calorieGoal": 2000,
        "carbPercentage": 0,
        "proteinPercentage": 0,
        "fatPercentage": 0
      },
      {
        "date": "2026-11-05",
        "calorieConsumed": 0,
        "calorieGoal": 2000,
       
... (생략)
```

## 40. `GET /v1/statistics/monthly?year=2026&month=11` → 200 (6ms)

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
        "calorieGoal": 2000
      },
      {
        "date": "2026-11-02",
        "calorieConsumed": 0,
        "calorieGoal": 2000
      },
      {
        "date": "2026-11-03",
        "calorieConsumed": 1550,
        "calorieGoal": 2000
      },
      {
        "date": "2026-11-04",
        "calorieConsumed": 0,
        "calorieGoal": 2000
      },
      {
        "date": "2026-11-05",
        "calorieConsumed": 0,
        "calorieGoal": 2000
      },
      {
        "date": "2026-11-06",
        "calorieConsumed": 0,
        "calorieGoal": 2000
      },
      {
        "date": "2026-11-07",
        "calorieConsumed": 0,
        "calorie
... (생략)
```

## 41. `GET /v1/ai/feedback/daily?date=2026-11-03` → 200 (6ms)

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
      "consumed": 1550,
      "goal": 2000,
      "comment": "오늘 목표 칼로리보다 450kcal 부족하게 섭취했습니다."
    },
    "nutritionBalance": {
      "carbPercentage": 76,
      "proteinPercentage": 64,
      "fatPercentage": 86,
      "comment": "탄수화물·단백질 섭취가 부족합니다."
    },
    "suggestions": [
      "닭가슴살, 두부, 달걀, 그릭 요거트 등 단백질 식품을 매끼 포함해보세요.",
      "현미밥, 고구마, 통곡물처럼 천천히 소화되는 탄수화물을 식사에 더해보세요."
    ],
    "overallFeedback": "단백질 섭취가 가장 부족합니다. 다음 식사에서 해당 영양소를 먼저 보충해보세요."
  },
  "message": "AI 피드백 생성 완료",
  "timestamp": "2026-11-03T04:37:56.259306595Z"
}
```

## 42. `GET /v1/ai/feedback/weekly?startDate=2026-11-02` → 200 (6ms)

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
      "avgConsumed": 1550,
      "goal": 2000,
      "comment": "이번 주 평균 목표 칼로리보다 450kcal 부족하게 섭취했습니다."
    },
    "nutritionBalance": {
      "avgCarbPercentage": 76,
      "avgProteinPercentage": 64,
      "avgFatPercentage": 86,
      "comment": "탄수화물·단백질 섭취가 부족합니다."
    },
    "suggestions": [
      "닭가슴살, 두부, 달걀, 그릭 요거트 등 단백질 식품을 매끼 포함해보세요.",
      "현미밥, 고구마, 통곡물처럼 천천히 소화되는 탄수화물을 식사에 더해보세요."
    ],
    "overallFeedback": "단백질 섭취가 가장 부족합니다. 다음 식사에서 해당 영양소를 먼저 보충해보세요."
  },
  "message": "AI 피드백 생성 완료",
  "timestamp": "2026-11-03T04:37:56.266040220Z"
}
```

## 43. `GET /v1/ai/feedback/monthly?year=2026&month=11` → 200 (5ms)

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
      "avgConsumed": 1550,
      "goal": 2000,
      "comment": "이번 달 평균 목표 칼로리보다 450kcal 부족하게 섭취했습니다."
    },
    "nutritionBalance": {
      "avgCarbPercentage": 76,
      "avgProteinPercentage": 64,
      "avgFatPercentage": 86,
      "comment": "탄수화물·단백질 섭취가 부족합니다."
    },
    "suggestions": [
      "닭가슴살, 두부, 달걀, 그릭 요거트 등 단백질 식품을 매끼 포함해보세요.",
      "현미밥, 고구마, 통곡물처럼 천천히 소화되는 탄수화물을 식사에 더해보세요."
    ],
    "overallFeedback": "단백질 섭취가 가장 부족합니다. 다음 식사에서 해당 영양소를 먼저 보충해보세요."
  },
  "message": "AI 피드백 생성 완료",
  "timestamp": "2026-11-03T04:37:56.271873845Z"
}
```

## 44. `DELETE /v1/users/account` → 200 (465ms)

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
  "timestamp": "2026-11-03T04:37:56.736812803Z"
}
```

## 45. `POST /v1/auth/register` → 201 (471ms)

Request
```json
{
  "username": "qas5f936b6bd",
  "email": "qas5f936b6bd@example.com",
  "nickname": "큐에이f936b6",
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
    "userId": "u_125",
    "nickname": "큐에이f936b6",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:37:57.208041845Z"
}
```

## 46. `POST /v1/auth/login` → 200 (460ms)

Request
```json
{
  "username": "qas5f936b6bd",
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
    "userId": "u_125",
    "nickname": "큐에이f936b6"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:37:57.669605137Z"
}
```

## 47. `POST /v1/users/profile/initial` → 200 (10ms)

Request
```json
{
  "gender": "F",
  "age": 24,
  "height": 163.0,
  "weight": 56.0,
  "activityLevel": "MODERATE",
  "goal": "MAINTAIN"
}
```
Response
```json
{
  "success": true,
  "data": {
    "dailyCalorieGoal": 2000,
    "carbGoalGram": 250,
    "proteinGoalGram": 125,
    "fatGoalGram": 56,
    "isPreciseMode": false
  },
  "message": "신체정보가 저장되었습니다.",
  "timestamp": "2026-11-03T04:37:57.679770679Z"
}
```

## 48. `POST /v1/diet/records/manual` → 201 (11ms)

Request
```json
{
  "mealType": "LUNCH",
  "eatenAt": "2026-11-03T04:37:57Z",
  "items": [
    {
      "name": "김치찌개",
      "weightGram": 400,
      "calorie": 500,
      "carb": 40,
      "protein": 25,
      "fat": 25
    }
  ]
}
```
Response
```json
{
  "success": true,
  "data": {
    "recordId": "rec_e8cb3984d27c4501"
  },
  "message": "식단이 등록되었습니다.",
  "timestamp": "2026-11-03T04:37:57.691986096Z"
}
```

## 49. `PUT /v1/users/settings/budget` → 200 (11ms)

Request
```json
{
  "diningOut": 11000,
  "homeCooking": 7000
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "예산 기본값이 저장되었습니다.",
  "timestamp": "2026-11-03T04:37:57.703180554Z"
}
```

## 50. `GET /v1/menu/recommend/summary` → 200 (11ms)

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
    "calorieRemaining": 1500,
    "calorieGoal": 2000,
    "calorieConsumed": 500,
    "carb": {
      "percentage": 16
    },
    "protein": {
      "percentage": 20
    },
    "fat": {
      "percentage": 45
    },
    "defaultBudget": {
      "diningOut": 11000,
      "homeCooking": 7000
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:57.713821221Z"
}
```

## 51. `GET /v1/menu/recommend/dining-out` → 200 (13ms)

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

... (생략)
```

## 52. `GET /v1/menu/categories/cat_001/items?budget=11000` → 200 (11ms)

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
        "isWithinBudget": false
      }
    ]
  },
  "message": "조회 성공",
  "tim
... (생략)
```

## 53. `GET /v1/menu/items/menu_001` → 200 (11ms)

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
  "timestamp": "2026-11-03T04:37:57.752429721Z"
}
```

## 54. `GET /v1/menu/nearby-stores?lat=37.4985&lng=127.028&categoryId=cat_001&radius=1000` → 403 (10ms)

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
  "timestamp": "2026-11-03T04:37:57.762989721Z"
}
```

## 55. `POST /v1/users/location-consent` → 200 (11ms)

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
  "timestamp": "2026-11-03T04:37:57.774885512Z"
}
```

## 56. `GET /v1/menu/nearby-stores?lat=37.4985&lng=127.028&categoryId=cat_001&radius=1000` → 200 (15ms)

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
  "timestamp": "2026-11-03T04:37:57.790874304Z"
}
```

## 57. `DELETE /v1/users/account` → 200 (469ms)

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
  "timestamp": "2026-11-03T04:37:58.260451013Z"
}
```

## 58. `POST /v1/auth/register` → 201 (471ms)

Request
```json
{
  "username": "qas619bf2987",
  "email": "qas619bf2987@example.com",
  "nickname": "큐에이19bf29",
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
    "userId": "u_126",
    "nickname": "큐에이19bf29",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:37:58.732551971Z"
}
```

## 59. `POST /v1/auth/login` → 200 (460ms)

Request
```json
{
  "username": "qas619bf2987",
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
    "userId": "u_126",
    "nickname": "큐에이19bf29"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:37:59.193988930Z"
}
```

## 60. `POST /v1/users/profile/initial` → 200 (10ms)

Request
```json
{
  "gender": "F",
  "age": 24,
  "height": 163.0,
  "weight": 56.0,
  "activityLevel": "MODERATE",
  "goal": "MAINTAIN"
}
```
Response
```json
{
  "success": true,
  "data": {
    "dailyCalorieGoal": 2000,
    "carbGoalGram": 250,
    "proteinGoalGram": 125,
    "fatGoalGram": 56,
    "isPreciseMode": false
  },
  "message": "신체정보가 저장되었습니다.",
  "timestamp": "2026-11-03T04:37:59.205228555Z"
}
```

## 61. `POST /v1/fridge/ingredients` → 201 (13ms)

Request
```json
{
  "ingredients": [
    {
      "name": "닭가슴살",
      "quantity": 1,
      "unit": "팩",
      "expiryDate": "2026-11-03"
    },
    {
      "name": "계란",
      "quantity": 6,
      "unit": "개"
    },
    {
      "name": "밥",
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
  "timestamp": "2026-11-03T04:37:59.218633013Z"
}
```

## 62. `GET /v1/fridge/ingredients` → 200 (7ms)

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
        "ingredientId": "ing_f2ab4fac4ab048c6",
        "name": "닭가슴살",
        "quantity": 1.0,
        "unit": "팩",
        "expiryDate": "2026-11-03",
        "isExpiringSoon": true
      },
      {
        "ingredientId": "ing_f3b52e2928ba44aa",
        "name": "밥",
        "quantity": 1.0,
        "unit": "공기",
        "isExpiringSoon": false
      },
      {
        "ingredientId": "ing_fc919a9a960d4ac7",
        "name": "계란",
        "quantity": 6.0,
        "unit": "개",
        "isExpiringSoon": false
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:59.226587430Z"
}
```

## 63. `POST /v1/menu/recommend/leftover` → 200 (14ms)

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
        "recipeId": "recipe_006",
        "name": "닭가슴살 시저 샐러드",
        "imageUrl": "https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1000&q=80",
        "calorie": 405.0,
        "carb": 29.0,
        "protein": 38.0,
        "fat": 16.0,
        "cookingTi
... (생략)
```

## 64. `GET /v1/menu/recommend/home-cooking?budget=8000` → 200 (18ms)

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
        "reason": "오늘의 영양 균형을 채우기 좋은 메뉴입니다.",
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
        "imageUrl": "https://images.unsplas
... (생략)
```

## 65. `GET /v1/menu/recipes?categoryId=hcat_002` → 200 (7ms)

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
        "cookingTimeMi
... (생략)
```

## 66. `GET /v1/menu/recipes/recipe_003` → 200 (8ms)

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
        "name
... (생략)
```

## 67. `GET /v1/menu/recipes/recipe_003/shopping-list` → 200 (9ms)

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
    "estimatedTotalCost": 3900,
    "shoppingItems": [
      {
        "name": "두부",
        "requiredAmount": "150g",
        "inFridge": false,
        "products": [
          {
            "mallName": "네이버쇼핑",
            "productName": "두부 상품 보기",
            "price": 975,
            "productUrl": "https://search.shopping.naver.com/search/all?query=%EB%91%90%EB%B6%80"
          },
          {
            "mallName": "쿠팡",
            "productName": "두부 상품 보기",
            "price": 975,
            "productUrl": "https://www.coupang.com/np/search?q=%EB%91%90%EB%B6%80"
          }
        ]
      },
      {
        "name": "애호박",
        "requiredAmount": "80g",
        "inFridge": false,
   
... (생략)
```

## 68. `PUT /v1/fridge/ingredients/ing_fc919a9a960d4ac7` → 200 (9ms)

Request
```json
{
  "quantity": 2,
  "unit": "개"
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "재료가 수정되었습니다.",
  "timestamp": "2026-11-03T04:37:59.296291846Z"
}
```

## 69. `DELETE /v1/fridge/ingredients/ing_f2ab4fac4ab048c6` → 200 (8ms)

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
  "timestamp": "2026-11-03T04:37:59.305074846Z"
}
```

## 70. `GET /v1/fridge/ingredients` → 200 (6ms)

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
        "ingredientId": "ing_f3b52e2928ba44aa",
        "name": "밥",
        "quantity": 1.0,
        "unit": "공기",
        "isExpiringSoon": false
      },
      {
        "ingredientId": "ing_fc919a9a960d4ac7",
        "name": "계란",
        "quantity": 2.0,
        "unit": "개",
        "isExpiringSoon": false
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:37:59.311686055Z"
}
```

## 71. `DELETE /v1/users/account` → 200 (477ms)

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
  "timestamp": "2026-11-03T04:37:59.788498888Z"
}
```

## 72. `POST /v1/auth/register` → 201 (473ms)

Request
```json
{
  "username": "qas7a5690b1f8",
  "email": "qas7a5690b1f8@example.com",
  "nickname": "큐에이5690b1",
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
    "userId": "u_127",
    "nickname": "큐에이5690b1",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:38:00.262204263Z"
}
```

## 73. `POST /v1/auth/login` → 200 (470ms)

Request
```json
{
  "username": "qas7a5690b1f8",
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
    "userId": "u_127",
    "nickname": "큐에이5690b1"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:38:00.733189805Z"
}
```

## 74. `POST /v1/auth/register` → 201 (464ms)

Request
```json
{
  "username": "qas7b0e217217",
  "email": "qas7b0e217217@example.com",
  "nickname": "큐에이0e2172",
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
    "userId": "u_128",
    "nickname": "큐에이0e2172",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:38:01.198229708Z"
}
```

## 75. `POST /v1/auth/login` → 200 (464ms)

Request
```json
{
  "username": "qas7b0e217217",
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
    "userId": "u_128",
    "nickname": "큐에이0e2172"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:38:01.663042750Z"
}
```

## 76. `POST /v1/community/analyze-image` → 200 (5ms)

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
    "foodName": "닭가슴살 샐러드",
    "calorie": 243,
    "carb": 8.5,
    "protein": 39.7,
    "fat": 4.9
  },
  "message": "AI 분석이 완료되었습니다.",
  "timestamp": "2026-11-03T04:38:01.669349083Z"
}
```

## 77. `POST /v1/community/posts` → 201 (11ms)

Request
```json
{
  "form": {
    "content": "오늘 점심 샐러드!",
    "calorie": 243,
    "carb": 8.5,
    "protein": 39.7,
    "fat": 4.9
  },
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
    "postId": "post_62a50881214d441c"
  },
  "message": "게시글이 등록되었습니다.",
  "timestamp": "2026-11-03T04:38:01.681138208Z"
}
```

## 78. `GET /v1/community/posts` → 200 (6ms)

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
        "postId": "post_62a50881214d441c",
        "title": "오늘 점심 샐러드!",
        "authorNickname": "큐에이5690b1",
        "createdAt": "2026-11-03T04:38:01.678698Z",
        "thumbnailUrl": "/v1/uploads/community/930ce3216ce6457999fc4d5a861d55f0.png",
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
  "t
... (생략)
```

## 79. `GET /v1/community/posts/post_62a50881214d441c` → 200 (9ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "postId": "post_62a50881214d441c",
    "content": "오늘 점심 샐러드!",
    "imageUrl": "/v1/uploads/community/930ce3216ce6457999fc4d5a861d55f0.png",
    "authorNickname": "큐에이5690b1",
    "createdAt": "2026-11-03T04:38:01.678698Z",
    "likeCount": 0,
    "isLiked": false,
    "commentCount": 0,
    "nutritionInfo": {
      "foodName": "식사",
      "calorie": 243,
      "carb": 8.5,
      "protein": 39.7,
      "fat": 4.9
    },
    "comments": []
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:38:01.697707Z"
}
```

## 80. `GET /v1/uploads/community/930ce3216ce6457999fc4d5a861d55f0.png` → 200 (2ms)

Request
```json
(없음)
```
Response
```json
<71 bytes>
```

## 81. `POST /v1/community/posts/post_62a50881214d441c/comments` → 201 (10ms)

Request
```json
{
  "content": "레시피 공유해주세요!"
}
```
Response
```json
{
  "success": true,
  "data": {
    "commentId": "cmt_083258fbed644cd9"
  },
  "message": "댓글이 등록되었습니다.",
  "timestamp": "2026-11-03T04:38:01.710899875Z"
}
```

## 82. `POST /v1/community/posts/post_62a50881214d441c/likes` → 200 (10ms)

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
  "timestamp": "2026-11-03T04:38:01.721887792Z"
}
```

## 83. `GET /v1/community/posts/post_62a50881214d441c` → 200 (9ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "postId": "post_62a50881214d441c",
    "content": "오늘 점심 샐러드!",
    "imageUrl": "/v1/uploads/community/930ce3216ce6457999fc4d5a861d55f0.png",
    "authorNickname": "큐에이5690b1",
    "createdAt": "2026-11-03T04:38:01.678698Z",
    "likeCount": 1,
    "isLiked": false,
    "commentCount": 1,
    "nutritionInfo": {
      "foodName": "식사",
      "calorie": 243,
      "carb": 8.5,
      "protein": 39.7,
      "fat": 4.9
    },
    "comments": [
      {
        "commentId": "cmt_083258fbed644cd9",
        "authorNickname": "큐에이0e2172",
        "content": "레시피 공유해주세요!",
        "createdAt": "2026-11-03T04:38:01.708390Z"
      }
    ]
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:38:01.731229625Z"
}
```

## 84. `PUT /v1/community/posts/post_62a50881214d441c` → 403 (6ms)

Request
```json
{
  "content": "B가 수정"
}
```
Response
```json
{
  "success": false,
  "data": null,
  "message": "본인의 게시글만 수정할 수 있습니다.",
  "errorCode": "AUTH_020",
  "timestamp": "2026-11-03T04:38:01.738366708Z"
}
```

## 85. `PUT /v1/community/posts/post_62a50881214d441c` → 200 (8ms)

Request
```json
{
  "content": "오늘 점심 샐러드! (드레싱 추가)"
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "게시글이 수정되었습니다.",
  "timestamp": "2026-11-03T04:38:01.746874458Z"
}
```

## 86. `DELETE /v1/community/posts/post_62a50881214d441c/comments/cmt_083258fbed644cd9` → 200 (9ms)

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
  "timestamp": "2026-11-03T04:38:01.756948458Z"
}
```

## 87. `DELETE /v1/community/posts/post_62a50881214d441c` → 200 (11ms)

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
  "timestamp": "2026-11-03T04:38:01.768812375Z"
}
```

## 88. `GET /v1/community/posts/post_62a50881214d441c` → 404 (6ms)

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
  "timestamp": "2026-11-03T04:38:01.775412417Z"
}
```

## 89. `DELETE /v1/users/account` → 200 (461ms)

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
  "timestamp": "2026-11-03T04:38:02.236293417Z"
}
```

## 90. `DELETE /v1/users/account` → 200 (470ms)

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
  "timestamp": "2026-11-03T04:38:02.706849209Z"
}
```

## 91. `POST /v1/auth/register` → 201 (466ms)

Request
```json
{
  "username": "qas8c5385021",
  "email": "qas8c5385021@example.com",
  "nickname": "큐에이c53850",
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
    "userId": "u_129",
    "nickname": "큐에이c53850",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:38:03.173567334Z"
}
```

## 92. `POST /v1/auth/login` → 200 (465ms)

Request
```json
{
  "username": "qas8c5385021",
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
    "userId": "u_129",
    "nickname": "큐에이c53850"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:38:03.639212917Z"
}
```

## 93. `POST /v1/users/profile/initial` → 200 (11ms)

Request
```json
{
  "gender": "F",
  "age": 24,
  "height": 163.0,
  "weight": 56.0,
  "activityLevel": "MODERATE",
  "goal": "MAINTAIN"
}
```
Response
```json
{
  "success": true,
  "data": {
    "dailyCalorieGoal": 2000,
    "carbGoalGram": 250,
    "proteinGoalGram": 125,
    "fatGoalGram": 56,
    "isPreciseMode": false
  },
  "message": "신체정보가 저장되었습니다.",
  "timestamp": "2026-11-03T04:38:03.651208126Z"
}
```

## 94. `GET /v1/home/dashboard` → 200 (9ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "큐에이c53850",
    "date": "2026-11-03",
    "tomatoStatus": "HUNGRY",
    "calorieGoal": 2000,
    "calorieConsumed": 0,
    "calorieRemaining": 2000,
    "calorieExceeded": 0,
    "carb": {
      "goalGram": 250,
      "consumedGram": 0.0,
      "percentage": 0
    },
    "protein": {
      "goalGram": 125,
      "consumedGram": 0.0,
      "percentage": 0
    },
    "fat": {
      "goalGram": 56,
      "consumedGram": 0.0,
      "percentage": 0
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:38:03.660729792Z"
}
```

## 95. `PUT /v1/users/profile` → 200 (14ms)

Request
```json
{
  "nickname": "바뀐닉5021",
  "goal": "LOSE"
}
```
Response
```json
{
  "success": true,
  "data": {
    "dailyCalorieGoal": 1600,
    "carbGoalGram": 200,
    "proteinGoalGram": 100,
    "fatGoalGram": 44,
    "isPreciseMode": false
  },
  "message": "프로필이 수정되었습니다.",
  "timestamp": "2026-11-03T04:38:03.675276834Z"
}
```

## 96. `GET /v1/home/dashboard` → 200 (9ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "바뀐닉5021",
    "date": "2026-11-03",
    "tomatoStatus": "HUNGRY",
    "calorieGoal": 1600,
    "calorieConsumed": 0,
    "calorieRemaining": 1600,
    "calorieExceeded": 0,
    "carb": {
      "goalGram": 200,
      "consumedGram": 0.0,
      "percentage": 0
    },
    "protein": {
      "goalGram": 100,
      "consumedGram": 0.0,
      "percentage": 0
    },
    "fat": {
      "goalGram": 44,
      "consumedGram": 0.0,
      "percentage": 0
    }
  },
  "message": "조회 성공",
  "timestamp": "2026-11-03T04:38:03.684906376Z"
}
```

## 97. `PUT /v1/users/settings/notification` → 200 (15ms)

Request
```json
{
  "pushEnabled": false,
  "dinnerTime": "18:30"
}
```
Response
```json
{
  "success": true,
  "data": null,
  "message": "알림 설정이 저장되었습니다.",
  "timestamp": "2026-11-03T04:38:03.700461209Z"
}
```

## 98. `GET /v1/users/profile` → 200 (8ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "바뀐닉5021",
    "name": "테스트",
    "email": "qas8c5385021@example.com",
    "gender": "F",
    "age": 24,
    "height": 163.0,
    "weight": 56.0,
    "activityLevel": "MODERATE",
    "goal": "LOSE",
    "dailyCalorieGoal": 1600,
    "carbGoalGram": 200,
    "proteinGoalGram": 100,
    "fatGoalGram": 44,
    "isPreciseMode": false,
    "notification": {
      "pushEnabled": false,
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
  "timestamp": "2026-11-03T04:38:03.709293501Z"
}
```

## 99. `PUT /v1/users/password` → 200 (935ms)

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
  "timestamp": "2026-11-03T04:38:04.644556751Z"
}
```

## 100. `POST /v1/auth/login` → 401 (473ms)

Request
```json
{
  "username": "qas8c5385021",
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
  "timestamp": "2026-11-03T04:38:05.118104126Z"
}
```

## 101. `POST /v1/auth/login` → 200 (469ms)

Request
```json
{
  "username": "qas8c5385021",
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
    "userId": "u_129",
    "nickname": "바뀐닉5021"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:38:05.588067168Z"
}
```

## 102. `DELETE /v1/users/account` → 200 (481ms)

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
  "timestamp": "2026-11-03T04:38:06.069989502Z"
}
```

## 103. `POST /v1/auth/login` → 401 (18ms)

Request
```json
{
  "username": "qas8c5385021",
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
  "timestamp": "2026-11-03T04:38:06.088398252Z"
}
```

## 104. `POST /v1/auth/register` → 201 (520ms)

Request
```json
{
  "username": "qas9864d2db2",
  "email": "qas9864d2db2@example.com",
  "nickname": "큐에이864d2d",
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
    "userId": "u_130",
    "nickname": "큐에이864d2d",
    "isNewUser": true
  },
  "message": "회원가입이 완료되었습니다.",
  "timestamp": "2026-11-03T04:38:06.609205419Z"
}
```

## 105. `POST /v1/auth/login` → 200 (487ms)

Request
```json
{
  "username": "qas9864d2db2",
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
    "userId": "u_130",
    "nickname": "큐에이864d2d"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:38:07.094835169Z"
}
```

## 106. `GET /v1/users/profile` → 401 (3ms)

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
  "timestamp": "2026-11-03T04:38:07.102612252Z"
}
```

## 107. `POST /v1/auth/token/refresh` → 200 (15ms)

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
  "timestamp": "2026-11-03T04:38:07.117272169Z"
}
```

## 108. `GET /v1/users/profile` → 200 (12ms)

Request
```json
(없음)
```
Response
```json
{
  "success": true,
  "data": {
    "nickname": "큐에이864d2d",
    "name": "테스트",
    "email": "qas9864d2db2@example.com",
    "dailyCalorieGoal": 2000,
    "carbGoalGram": 250,
    "proteinGoalGram": 125,
    "fatGoalGram": 55,
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
  "timestamp": "2026-11-03T04:38:07.129181752Z"
}
```

## 109. `POST /v1/auth/token/refresh` → 401 (6ms)

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
  "timestamp": "2026-11-03T04:38:07.137127294Z"
}
```

## 110. `POST /v1/auth/logout` → 200 (7ms)

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
  "timestamp": "2026-11-03T04:38:07.144967627Z"
}
```

## 111. `POST /v1/auth/token/refresh` → 401 (5ms)

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
  "timestamp": "2026-11-03T04:38:07.150437086Z"
}
```

## 112. `POST /v1/auth/login` → 200 (460ms)

Request
```json
{
  "username": "qas9864d2db2",
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
    "userId": "u_130",
    "nickname": "큐에이864d2d"
  },
  "message": "로그인 성공",
  "timestamp": "2026-11-03T04:38:07.610137461Z"
}
```

## 113. `DELETE /v1/users/account` → 200 (476ms)

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
  "timestamp": "2026-11-03T04:38:08.087162961Z"
}
```
