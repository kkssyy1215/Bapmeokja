# 부록 A. API별 통합 테스트 결과

실행 시각: 2026-11-03 13:37:50 · 대상: `http://127.0.0.1:8080/v1`

| # | API | 기능 | 정상 | 예외 | DB검증 | 결과 |
|---:|---|---|:---:|:---:|:---:|:---:|
| 1 | `POST /auth/login` | 로그인 | 2 | 1 | 0 | ✅ 통과 |
| 2 | `POST /auth/register` | 회원가입 | 1 | 4 | 2 | ✅ 통과 |
| 3 | `GET /auth/check/username` | 아이디 중복 확인 | 2 | 0 | 0 | ✅ 통과 |
| 4 | `GET /auth/check/email` | 이메일 중복 확인 | 1 | 1 | 0 | ✅ 통과 |
| 5 | `GET /auth/check/nickname` | 닉네임 중복 확인 | 1 | 0 | 0 | ✅ 통과 |
| 6 | `POST /auth/token/refresh` | 토큰 재발급 | 1 | 1 | 0 | ✅ 통과 |
| 7 | `POST /auth/logout` | 로그아웃 | 2 | 0 | 0 | ✅ 통과 |
| 8 | `POST /users/profile/initial` | 초기 신체정보 등록 | 1 | 1 | 1 | ✅ 통과 |
| 9 | `GET /users/profile` | 프로필 조회 | 1 | 4 | 0 | ✅ 통과 |
| 10 | `PUT /users/profile` | 프로필 수정 | 1 | 0 | 1 | ✅ 통과 |
| 11 | `PUT /users/settings/notification` | 알림 설정 수정 | 1 | 1 | 0 | ✅ 통과 |
| 12 | `PUT /users/settings/budget` | 예산 설정 | 1 | 1 | 1 | ✅ 통과 |
| 13 | `POST /users/location-consent` | 위치 정보 동의 | 1 | 1 | 0 | ✅ 통과 |
| 14 | `POST /users/devices` | 푸시 기기 등록 | 1 | 1 | 0 | ✅ 통과 |
| 15 | `PUT /users/password` | 비밀번호 변경 | 2 | 2 | 0 | ✅ 통과 |
| 16 | `DELETE /users/account` | 회원 탈퇴 | 2 | 1 | 1 | ✅ 통과 |
| 17 | `POST /diet/analyze` | 음식 사진 분석 | 1 | 3 | 1 | ✅ 통과 |
| 18 | `GET /diet/items/{itemId}` | 분석 항목 상세 | 1 | 2 | 0 | ✅ 통과 |
| 19 | `POST /diet/records` | 식단 저장(분석 기반) | 1 | 1 | 1 | ✅ 통과 |
| 20 | `POST /diet/records/manual` | 식단 저장(직접 입력) | 1 | 2 | 0 | ✅ 통과 |
| 21 | `GET /diet/calendar` | 월간 캘린더 | 1 | 2 | 0 | ✅ 통과 |
| 22 | `GET /diet/records` | 날짜별 식단 조회 | 1 | 1 | 0 | ✅ 통과 |
| 23 | `GET /diet/records/{recordId}` | 식단 상세 조회 | 1 | 1 | 0 | ✅ 통과 |
| 24 | `PUT /diet/records/{recordId}` | 식단 수정 | 1 | 1 | 1 | ✅ 통과 |
| 25 | `DELETE /diet/records/{recordId}` | 식단 삭제 | 2 | 1 | 0 | ✅ 통과 |
| 26 | `GET /diet/foods/search` | 음식 검색 | 2 | 0 | 0 | ✅ 통과 |
| 27 | `GET /ai/feedback/daily` | 일간 AI 피드백 | 1 | 0 | 0 | ✅ 통과 |
| 28 | `GET /ai/feedback/weekly` | 주간 AI 피드백 | 1 | 0 | 0 | ✅ 통과 |
| 29 | `GET /ai/feedback/monthly` | 월간 AI 피드백 | 1 | 1 | 0 | ✅ 통과 |
| 30 | `POST /fridge/ingredients` | 냉장고 재료 등록 | 1 | 1 | 1 | ✅ 통과 |
| 31 | `GET /fridge/ingredients` | 냉장고 재료 조회 | 1 | 0 | 0 | ✅ 통과 |
| 32 | `PUT /fridge/ingredients/{ingredientId}` | 냉장고 재료 수정 | 1 | 1 | 1 | ✅ 통과 |
| 33 | `DELETE /fridge/ingredients/{ingredientId}` | 냉장고 재료 삭제 | 1 | 1 | 1 | ✅ 통과 |
| 34 | `GET /community/posts` | 게시글 목록 | 1 | 2 | 0 | ✅ 통과 |
| 35 | `POST /community/analyze-image` | 게시글 사진 영양 추정 | 1 | 1 | 0 | ✅ 통과 |
| 36 | `POST /community/posts` | 게시글 작성 | 1 | 1 | 1 | ✅ 통과 |
| 37 | `GET /community/posts/{postId}` | 게시글 상세 | 2 | 1 | 0 | ✅ 통과 |
| 38 | `PUT /community/posts/{postId}` | 게시글 수정 | 1 | 1 | 0 | ✅ 통과 |
| 39 | `DELETE /community/posts/{postId}` | 게시글 삭제 | 1 | 1 | 0 | ✅ 통과 |
| 40 | `POST /community/posts/{postId}/comments` | 댓글 작성 | 1 | 1 | 0 | ✅ 통과 |
| 41 | `DELETE /community/posts/{postId}/comments/{commentId}` | 댓글 삭제 | 1 | 1 | 0 | ✅ 통과 |
| 42 | `POST /community/posts/{postId}/likes` | 좋아요 토글 | 2 | 0 | 0 | ✅ 통과 |
| 43 | `GET /v1/uploads/community/{fileName}` | 커뮤니티 이미지 제공 | 1 | 1 | 0 | ✅ 통과 |
| 44 | `GET /home/dashboard` | 홈 대시보드 | 2 | 0 | 0 | ✅ 통과 |
| 45 | `GET /statistics/daily` | 일간 통계 | 1 | 1 | 0 | ✅ 통과 |
| 46 | `GET /statistics/weekly` | 주간 통계 | 1 | 0 | 0 | ✅ 통과 |
| 47 | `GET /statistics/monthly` | 월간 통계 | 1 | 0 | 0 | ✅ 통과 |
| 48 | `GET /menu/recommend/summary` | 추천 요약 | 1 | 0 | 0 | ✅ 통과 |
| 49 | `GET /menu/recommend/dining-out` | 외식 추천 | 1 | 0 | 0 | ✅ 통과 |
| 50 | `GET /menu/categories/{categoryId}/items` | 카테고리 메뉴 목록 | 1 | 1 | 0 | ✅ 통과 |
| 51 | `GET /menu/items/{itemId}` | 메뉴 상세 | 1 | 1 | 0 | ✅ 통과 |
| 52 | `GET /menu/nearby-stores` | 주변 매장 조회 | 1 | 3 | 0 | ✅ 통과 |
| 53 | `GET /menu/recommend/home-cooking` | 집밥 추천 | 1 | 0 | 0 | ✅ 통과 |
| 54 | `GET /menu/recipes` | 레시피 목록 | 1 | 1 | 0 | ✅ 통과 |
| 55 | `GET /menu/recipes/{recipeId}` | 레시피 상세 | 1 | 1 | 0 | ✅ 통과 |
| 56 | `POST /menu/recommend/leftover` | 남은 재료 기반 추천 | 1 | 0 | 0 | ✅ 통과 |
| 57 | `GET /menu/recipes/{recipeId}/shopping-list` | 장보기 리스트 | 1 | 1 | 0 | ✅ 통과 |

# 부록 B. 통합 테스트 케이스 전체 목록

| ID | API# | 엔드포인트 | 구분 | 테스트 내용 | 기대 결과 | 실제 결과 | 판정 |
|---|---:|---|---|---|---|---|:---:|
| IT-001 | 3 | `GET /auth/check/username` | 정상 | 미사용 아이디 중복 확인 | 200 + isDuplicated=false | 200 | PASS |
| IT-002 | 4 | `GET /auth/check/email` | 정상 | 미사용 이메일 중복 확인 | 200 + isDuplicated=false | 200 | PASS |
| IT-003 | 4 | `GET /auth/check/email` | 예외 | 이메일 형식 오류 | 400 | 400 VALID_011 | PASS |
| IT-004 | 5 | `GET /auth/check/nickname` | 정상 | 미사용 닉네임 중복 확인 | 200 + isDuplicated=false | 200 | PASS |
| IT-005 | 2 | `POST /auth/register` | 정상 | 회원가입 | 201 | 201 | PASS |
| IT-006 | 2 | `POST /auth/register` | DB검증 | users 테이블에 사용자 저장 | 1 row | 1 | PASS |
| IT-007 | 2 | `POST /auth/register` | DB검증 | 기본 알림 설정 생성 | 1 row | 1 | PASS |
| IT-008 | 2 | `POST /auth/register` | 예외 | 중복 아이디 가입 거부 | 409 | 409 AUTH_002 | PASS |
| IT-009 | 2 | `POST /auth/register` | 예외 | 비밀번호 규칙 위반 | 400 | 400 VALID_003 | PASS |
| IT-010 | 2 | `POST /auth/register` | 예외 | 비밀번호 확인 불일치 | 400 | 400 VALID_004 | PASS |
| IT-011 | 2 | `POST /auth/register` | 예외 | 약관 미동의 | 400 | 400 VALID_005 | PASS |
| IT-012 | 3 | `GET /auth/check/username` | 정상 | 가입된 아이디는 중복으로 표시 | 200 + isDuplicated=true | 200 | PASS |
| IT-013 | 1 | `POST /auth/login` | 정상 | 로그인 및 토큰 발급 | 200 + isNewUser=true | 200 | PASS |
| IT-014 | 1 | `POST /auth/login` | 예외 | 잘못된 비밀번호 | 401 | 401 AUTH_001 | PASS |
| IT-015 | 6 | `POST /auth/token/refresh` | 정상 | 토큰 재발급(회전) | 200 + 새 refresh token | 200 | PASS |
| IT-016 | 6 | `POST /auth/token/refresh` | 예외 | 이미 사용한 refresh token 재사용 거부 | 401 | 401 AUTH_003 | PASS |
| IT-017 | 9 | `GET /users/profile` | 예외 | 토큰 없이 접근 | 401 | 401 AUTH_003 | PASS |
| IT-018 | 9 | `GET /users/profile` | 예외 | 위조 토큰 접근 | 401 | 401 AUTH_003 | PASS |
| IT-019 | 8 | `POST /users/profile/initial` | 정상 | 초기 신체정보 등록 및 목표 계산 | 200 + 목표 칼로리 > 0 | 200 | PASS |
| IT-020 | 8 | `POST /users/profile/initial` | DB검증 | users.daily_calorie_goal 저장 | > 0 | 1800 | PASS |
| IT-021 | 8 | `POST /users/profile/initial` | 예외 | 나이 범위 오류 | 400 | 400 VALID_011 | PASS |
| IT-022 | 9 | `GET /users/profile` | 예외 | 없는 주소는 404(BUG-006 회귀) | 404 | 404 NOTFOUND_001 | PASS |
| IT-023 | 9 | `GET /users/profile` | 예외 | 지원하지 않는 메서드는 405(BUG-006 회귀) | 405 | 405 VALID_012 | PASS |
| IT-024 | 17 | `POST /diet/analyze` | 예외 | multipart가 아닌 요청은 415(BUG-006 회귀) | 415 | 415 VALID_013 | PASS |
| IT-025 | 9 | `GET /users/profile` | 정상 | 프로필 조회 | 200 + 닉네임 일치 | 200 | PASS |
| IT-026 | 10 | `PUT /users/profile` | 정상 | 프로필 수정 및 목표 재계산 | 200 | 200 | PASS |
| IT-027 | 10 | `PUT /users/profile` | DB검증 | users.weight 갱신 | 53.5 | 53.5 | PASS |
| IT-028 | 11 | `PUT /users/settings/notification` | 정상 | 알림 설정 수정 | 200 | 200 | PASS |
| IT-029 | 11 | `PUT /users/settings/notification` | 예외 | 시각 형식 오류 | 400 | 400 VALID_010 | PASS |
| IT-030 | 12 | `PUT /users/settings/budget` | 정상 | 예산 설정 | 200 | 200 | PASS |
| IT-031 | 12 | `PUT /users/settings/budget` | DB검증 | 외식 예산 저장 | 12000 | 12000 | PASS |
| IT-032 | 12 | `PUT /users/settings/budget` | 예외 | 음수 예산 거부 | 400 | 400 VALID_011 | PASS |
| IT-033 | 14 | `POST /users/devices` | 정상 | 푸시 기기 등록 | 200 | 200 | PASS |
| IT-034 | 14 | `POST /users/devices` | 예외 | 지원하지 않는 플랫폼 | 400 | 400 VALID_011 | PASS |
| IT-035 | 44 | `GET /home/dashboard` | 정상 | 오늘 대시보드 조회(기록 전) | 200 + calorieConsumed=0 | 200 | PASS |
| IT-036 | 17 | `POST /diet/analyze` | 정상 | 음식 사진 분석 | 200 + items ≥ 1 | 200 | PASS |
| IT-037 | 17 | `POST /diet/analyze` | DB검증 | ai_analyses/ai_analysis_items 저장 | 2 rows | 2 | PASS |
| IT-038 | 17 | `POST /diet/analyze` | 예외 | 이미지 누락 | 400 | 400 VALID_020 | PASS |
| IT-039 | 17 | `POST /diet/analyze` | 예외 | 지원하지 않는 형식(gif) | 400 | 400 VALID_011 | PASS |
| IT-040 | 18 | `GET /diet/items/{itemId}` | 정상 | 분석 항목 상세 조회 | 200 | 200 | PASS |
| IT-041 | 18 | `GET /diet/items/{itemId}` | 예외 | 다른 사용자의 분석 항목 접근 차단 | 403 또는 404 | 404 | PASS |
| IT-042 | 18 | `GET /diet/items/{itemId}` | 예외 | 없는 항목 | 404 | 404 NOTFOUND_001 | PASS |
| IT-043 | 19 | `POST /diet/records` | 정상 | 분석 결과로 식단 저장 | 201 | 201 | PASS |
| IT-044 | 19 | `POST /diet/records` | DB검증 | diet_records.total_calorie = 항목 합계 | 243 | 243 | PASS |
| IT-045 | 19 | `POST /diet/records` | 예외 | 다른 사용자의 analyzeId로 저장 차단 | 403 또는 404 | 404 | PASS |
| IT-046 | 20 | `POST /diet/records/manual` | 정상 | 직접 입력 식단 저장 | 201 | 201 | PASS |
| IT-047 | 20 | `POST /diet/records/manual` | 예외 | 음식 항목 없음 | 400 | 400 VALID_011 | PASS |
| IT-048 | 20 | `POST /diet/records/manual` | 예외 | 음수 칼로리 | 400 | 400 VALID_011 | PASS |
| IT-049 | 21 | `GET /diet/calendar` | 정상 | 월간 캘린더에 오늘 표시 | 200 + 2026-11-03 포함 | 200 | PASS |
| IT-050 | 21 | `GET /diet/calendar` | 예외 | 잘못된 월(13) | 400 | 400 VALID_011 | PASS |
| IT-051 | 22 | `GET /diet/records` | 정상 | 날짜별 식단 조회 | 200 + records 2건 | 200 | PASS |
| IT-052 | 22 | `GET /diet/records` | 예외 | 날짜 형식 오류 | 400 | 400 VALID_011 | PASS |
| IT-053 | 21 | `GET /diet/calendar` | 예외 | 숫자가 아닌 연도(BUG-001 회귀) | 400 | 400 VALID_011 | PASS |
| IT-054 | 23 | `GET /diet/records/{recordId}` | 정상 | 식단 상세 조회 | 200 | 200 | PASS |
| IT-055 | 23 | `GET /diet/records/{recordId}` | 예외 | 다른 사용자의 식단 조회 차단 | 403 또는 404 | 404 | PASS |
| IT-056 | 24 | `PUT /diet/records/{recordId}` | 정상 | 식단 수정 | 200 | 200 | PASS |
| IT-057 | 24 | `PUT /diet/records/{recordId}` | DB검증 | 끼니·칼로리 갱신 | DINNER/190 | DINNER/190 | PASS |
| IT-058 | 24 | `PUT /diet/records/{recordId}` | 예외 | 다른 사용자의 식단 수정 차단 | 403 또는 404 | 404 | PASS |
| IT-059 | 26 | `GET /diet/foods/search` | 정상 | 음식 검색 | 200 + 결과 ≥ 1 | 200 | PASS |
| IT-060 | 26 | `GET /diet/foods/search` | 정상 | 검색 결과 없음 | 200 + 빈 목록 | 200 | PASS |
| IT-061 | 44 | `GET /home/dashboard` | 정상 | 기록 후 섭취 칼로리 반영 | 200 + calorieConsumed=433 | 200 | PASS |
| IT-062 | 45 | `GET /statistics/daily` | 정상 | 기간별 조회 | 200 + data 존재 | 200 | PASS |
| IT-063 | 46 | `GET /statistics/weekly` | 정상 | 기간별 조회 | 200 + data 존재 | 200 | PASS |
| IT-064 | 47 | `GET /statistics/monthly` | 정상 | 기간별 조회 | 200 + data 존재 | 200 | PASS |
| IT-065 | 27 | `GET /ai/feedback/daily` | 정상 | 기간별 조회 | 200 + data 존재 | 200 | PASS |
| IT-066 | 28 | `GET /ai/feedback/weekly` | 정상 | 기간별 조회 | 200 + data 존재 | 200 | PASS |
| IT-067 | 29 | `GET /ai/feedback/monthly` | 정상 | 기간별 조회 | 200 + data 존재 | 200 | PASS |
| IT-068 | 45 | `GET /statistics/daily` | 예외 | 날짜 형식 오류 | 400 | 400 VALID_011 | PASS |
| IT-069 | 29 | `GET /ai/feedback/monthly` | 예외 | 잘못된 월(0) | 400 | 400 VALID_011 | PASS |
| IT-070 | 48 | `GET /menu/recommend/summary` | 정상 | 잔여 영양·예산 요약 | 200 + 예산 12000 반영 | 200 | PASS |
| IT-071 | 49 | `GET /menu/recommend/dining-out` | 정상 | 외식 카테고리 추천 | 200 + 카테고리 ≥ 1 | 200 | PASS |
| IT-072 | 50 | `GET /menu/categories/{categoryId}/items` | 정상 | 카테고리 메뉴 목록 | 200 + 메뉴 ≥ 1 | 200 | PASS |
| IT-073 | 50 | `GET /menu/categories/{categoryId}/items` | 예외 | 없는 카테고리 | 404 | 404 NOTFOUND_001 | PASS |
| IT-074 | 51 | `GET /menu/items/{itemId}` | 정상 | 메뉴 상세·재료 | 200 + 재료 ≥ 1 | 200 | PASS |
| IT-075 | 51 | `GET /menu/items/{itemId}` | 예외 | 없는 메뉴 | 404 | 404 NOTFOUND_001 | PASS |
| IT-076 | 52 | `GET /menu/nearby-stores` | 예외 | 위치 동의 전 주변 매장 조회 차단 | 403 | 403 AUTH_020 | PASS |
| IT-077 | 13 | `POST /users/location-consent` | 정상 | 위치 정보 동의 | 200 + granted=true | 200 | PASS |
| IT-078 | 13 | `POST /users/location-consent` | 예외 | agreed 누락 | 400 | 400 VALID_011 | PASS |
| IT-079 | 52 | `GET /menu/nearby-stores` | 정상 | 동의 후 주변 매장 조회 | 200 + 매장 ≥ 1 | 200 | PASS |
| IT-080 | 52 | `GET /menu/nearby-stores` | 예외 | 위도 범위 오류 | 400 | 400 VALID_011 | PASS |
| IT-081 | 52 | `GET /menu/nearby-stores` | 예외 | 숫자가 아닌 위도(BUG-001 회귀) | 400 | 400 VALID_011 | PASS |
| IT-082 | 30 | `POST /fridge/ingredients` | 정상 | 재료 3개 등록 | 201 + registeredCount=3 | 201 | PASS |
| IT-083 | 30 | `POST /fridge/ingredients` | DB검증 | fridge_ingredients 3행 저장 | 3 | 3 | PASS |
| IT-084 | 30 | `POST /fridge/ingredients` | 예외 | 수량 0 거부 | 400 | 400 VALID_011 | PASS |
| IT-085 | 31 | `GET /fridge/ingredients` | 정상 | 재료 목록·유통기한 임박 표시 | 200 + 임박 재료 표시 | 200 | PASS |
| IT-086 | 32 | `PUT /fridge/ingredients/{ingredientId}` | 정상 | 재료 수량 수정 | 200 | 200 | PASS |
| IT-087 | 32 | `PUT /fridge/ingredients/{ingredientId}` | DB검증 | quantity 갱신 | 3 | 3 | PASS |
| IT-088 | 32 | `PUT /fridge/ingredients/{ingredientId}` | 예외 | 다른 사용자의 재료 수정 차단 | 403 또는 404 | 404 | PASS |
| IT-089 | 53 | `GET /menu/recommend/home-cooking` | 정상 | 집밥 카테고리 추천 | 200 + 카테고리 ≥ 1 | 200 | PASS |
| IT-090 | 54 | `GET /menu/recipes` | 정상 | 카테고리 레시피 목록 | 200 + 레시피 ≥ 1 | 200 | PASS |
| IT-091 | 54 | `GET /menu/recipes` | 예외 | 없는 카테고리 | 404 | 404 NOTFOUND_001 | PASS |
| IT-092 | 55 | `GET /menu/recipes/{recipeId}` | 정상 | 레시피 상세(재료·대체재·단계) | 200 + steps ≥ 1 | 200 | PASS |
| IT-093 | 55 | `GET /menu/recipes/{recipeId}` | 예외 | 없는 레시피 | 404 | 404 NOTFOUND_001 | PASS |
| IT-094 | 56 | `POST /menu/recommend/leftover` | 정상 | 냉장고 재료 기반 추천 | 200 + 레시피 ≥ 1 | 200 | PASS |
| IT-095 | 57 | `GET /menu/recipes/{recipeId}/shopping-list` | 정상 | 부족 재료·예상 금액 | 200 | 200 | PASS |
| IT-096 | 57 | `GET /menu/recipes/{recipeId}/shopping-list` | 예외 | 없는 레시피 | 404 | 404 NOTFOUND_001 | PASS |
| IT-097 | 33 | `DELETE /fridge/ingredients/{ingredientId}` | 예외 | 다른 사용자의 재료 삭제 차단 | 403 또는 404 | 404 | PASS |
| IT-098 | 33 | `DELETE /fridge/ingredients/{ingredientId}` | 정상 | 재료 삭제 | 200 | 200 | PASS |
| IT-099 | 33 | `DELETE /fridge/ingredients/{ingredientId}` | DB검증 | 행 삭제 | 0 | 0 | PASS |
| IT-100 | 35 | `POST /community/analyze-image` | 정상 | 게시글용 사진 영양 추정 | 200 + calorie > 0 | 200 | PASS |
| IT-101 | 35 | `POST /community/analyze-image` | 예외 | 이미지가 아닌 파일 | 400 | 400 VALID_011 | PASS |
| IT-102 | 36 | `POST /community/posts` | 정상 | 사진 포함 게시글 등록 | 201 | 201 | PASS |
| IT-103 | 36 | `POST /community/posts` | DB검증 | posts 저장(image_url 포함) | 1 | 1 | PASS |
| IT-104 | 36 | `POST /community/posts` | 예외 | 빈 내용 | 400 | 400 VALID_010 | PASS |
| IT-105 | 34 | `GET /community/posts` | 정상 | 게시글 목록(다른 사용자 시점) | 200 + 작성 글 포함 | 200 | PASS |
| IT-106 | 34 | `GET /community/posts` | 예외 | 페이지 크기 초과(999) | 400 | 400 VALID_011 | PASS |
| IT-107 | 34 | `GET /community/posts` | 예외 | 숫자가 아닌 page(BUG-001 회귀) | 400 | 400 VALID_011 | PASS |
| IT-108 | 37 | `GET /community/posts/{postId}` | 정상 | 게시글 상세 | 200 + imageUrl 존재 | 200 | PASS |
| IT-109 | 43 | `GET /v1/uploads/community/{fileName}` | 정상 | 업로드 이미지 제공 | 200 + PNG 바이트 일치 | 200 | PASS |
| IT-110 | 43 | `GET /v1/uploads/community/{fileName}` | 예외 | 경로 조작 파일명 차단 | 400 또는 404 | 400 | PASS |
| IT-111 | 38 | `PUT /community/posts/{postId}` | 예외 | 다른 사용자의 게시글 수정 차단 | 403 또는 404 | 403 | PASS |
| IT-112 | 38 | `PUT /community/posts/{postId}` | 정상 | 본인 게시글 수정 | 200 | 200 | PASS |
| IT-113 | 40 | `POST /community/posts/{postId}/comments` | 정상 | 댓글 등록 | 201 | 201 | PASS |
| IT-114 | 40 | `POST /community/posts/{postId}/comments` | 예외 | 빈 댓글 | 400 | 400 VALID_010 | PASS |
| IT-115 | 42 | `POST /community/posts/{postId}/likes` | 정상 | 좋아요 등록 | 200 + isLiked=true, count=1 | 200 | PASS |
| IT-116 | 42 | `POST /community/posts/{postId}/likes` | 정상 | 좋아요 취소(토글) | 200 + isLiked=false, count=0 | 200 | PASS |
| IT-117 | 37 | `GET /community/posts/{postId}` | 정상 | 댓글 수 반영 | 200 + commentCount=1 | 200 | PASS |
| IT-118 | 41 | `DELETE /community/posts/{postId}/comments/{commentId}` | 예외 | 타인 댓글 삭제 차단 | 403 또는 404 | 403 | PASS |
| IT-119 | 41 | `DELETE /community/posts/{postId}/comments/{commentId}` | 정상 | 본인 댓글 삭제 | 200 | 200 | PASS |
| IT-120 | 39 | `DELETE /community/posts/{postId}` | 예외 | 다른 사용자의 게시글 삭제 차단 | 403 또는 404 | 403 | PASS |
| IT-121 | 39 | `DELETE /community/posts/{postId}` | 정상 | 본인 게시글 삭제 | 200 | 200 | PASS |
| IT-122 | 37 | `GET /community/posts/{postId}` | 예외 | 삭제된 게시글 조회 | 404 | 404 NOTFOUND_001 | PASS |
| IT-123 | 25 | `DELETE /diet/records/{recordId}` | 예외 | 다른 사용자의 식단 삭제 차단 | 403 또는 404 | 404 | PASS |
| IT-124 | 25 | `DELETE /diet/records/{recordId}` | 정상 | 식단 삭제 | 200 | 200 | PASS |
| IT-125 | 25 | `DELETE /diet/records/{recordId}` | 정상 | 삭제 후 조회 시 404 | 404 | 404 NOTFOUND_001 | PASS |
| IT-126 | 15 | `PUT /users/password` | 예외 | 현재 비밀번호 불일치 | 401 | 401 AUTH_010 | PASS |
| IT-127 | 15 | `PUT /users/password` | 예외 | 새 비밀번호 확인 불일치 | 400 | 400 VALID_004 | PASS |
| IT-128 | 15 | `PUT /users/password` | 정상 | 비밀번호 변경 | 200 | 200 | PASS |
| IT-129 | 15 | `PUT /users/password` | 정상 | 변경 후 기존 refresh token 폐기 | 401 | 401 AUTH_003 | PASS |
| IT-130 | 1 | `POST /auth/login` | 정상 | 새 비밀번호로 로그인 | 200 | 200 | PASS |
| IT-131 | 7 | `POST /auth/logout` | 정상 | 로그아웃 | 200 | 200 | PASS |
| IT-132 | 7 | `POST /auth/logout` | 정상 | 로그아웃 후 refresh token 무효 | 401 | 401 AUTH_003 | PASS |
| IT-133 | 16 | `DELETE /users/account` | 예외 | 비밀번호 불일치 시 탈퇴 거부 | 401 | 401 AUTH_010 | PASS |
| IT-134 | 16 | `DELETE /users/account` | 정상 | 회원 탈퇴 | 200 | 200 | PASS |
| IT-135 | 16 | `DELETE /users/account` | DB검증 | 사용자·종속 식단 데이터 삭제 | 0 | 0 | PASS |
| IT-136 | 16 | `DELETE /users/account` | 정상 | 탈퇴 후 로그인 불가 | 401 | 401 AUTH_001 | PASS |
