# 백엔드 기능 구현 현황

## 한 줄 요약

애플리케이션 API 57개(명세 54개 + 추가 3개)가 모두 구현되어 있고 통합 테스트 136건을 통과했습니다. 사진 분석 API 2개는 Gemini 연동 코드가 완성되어 `GEMINI_API_KEY`를 넣으면 실제 판독으로 동작하며, 키가 없으면 파일명 기반 시연용 분석기로 동작합니다. 실제 Gemini API로 음식 사진 인식부터 저장까지 확인했습니다.

> 집계 기준: `backend/src/main/java`의 REST Controller 매핑을 기준으로 했으며 Swagger/Actuator가 제공하는 관리 경로는 제외했습니다. `밥먹자_API명세서2.md`의 54개 엔드포인트를 대조한 결과 모두 구현되어 있어 미구현은 0개입니다. 명세에 없는 추가 3개는 식단 단건 조회, 푸시 기기 등록, 커뮤니티 이미지 제공입니다.

## Backend 기술 스택

| 항목 | 확인된 구현 |
|---|---|
| 언어 | Java 17 ([build.gradle](backend/build.gradle#L10)) |
| Framework | Spring Boot 3.5.16, Spring Web, Validation, Security ([build.gradle](backend/build.gradle#L1)) |
| DB 연결 | MySQL Connector/J + Spring Data JPA/Hibernate, Flyway migration ([application.yml](backend/src/main/resources/application.yml#L4), [build.gradle](backend/build.gradle#L34)) |
| 인증 | 무상태 JWT Bearer 인증, Refresh Token 회전·DB 저장, BCrypt strength 12 ([SecurityConfig.java](backend/src/main/java/com/bapmeokja/api/config/SecurityConfig.java#L28), [JwtProvider.java](backend/src/main/java/com/bapmeokja/api/security/JwtProvider.java#L1)) |
| API 문서 | springdoc OpenAPI 2.8.14, Swagger UI 및 OpenAPI JSON ([build.gradle](backend/build.gradle#L27), [OpenApiConfig.java](backend/src/main/java/com/bapmeokja/api/config/OpenApiConfig.java#L10)) |
| 주요 라이브러리 | JJWT 0.12.6, MySQL Connector/J, Flyway, Lombok ([build.gradle](backend/build.gradle#L27)) |

## API 구현 현황

각 행의 `Controller → Service`는 실제 핸들러 연결입니다. DB 표기는 `JPA`가 해당 경로에서 조회/저장을 수행함을 뜻하고, `파일+JPA`는 이미지 로컬 저장과 DB 저장을 모두 수행함을 뜻합니다. ✅은 Controller에서 처리 로직과 저장소/파일 처리까지 연결되어 테스트를 통과했음을 뜻하고, 🔑는 여기에 더해 실제 동작에 외부 API 키가 필요함을 뜻합니다.

| # | Method | Endpoint | 기능 | Controller → Service | DB/저장소 | 상태 |
|---:|---|---|---|---|---|---|
| 1 | POST | `/v1/auth/login` | 로그인·토큰 발급 | AuthController → AuthService | JPA | ✅ |
| 2 | POST | `/v1/auth/register` | 회원가입·기본 알림 설정 | AuthController → AuthService | JPA | ✅ |
| 3 | GET | `/v1/auth/check/username` | 아이디 중복 확인 | AuthController → AuthService | JPA | ✅ |
| 4 | GET | `/v1/auth/check/email` | 이메일 중복·형식 확인 | AuthController → AuthService | JPA | ✅ |
| 5 | GET | `/v1/auth/check/nickname` | 닉네임 중복 확인 | AuthController → AuthService | JPA | ✅ |
| 6 | POST | `/v1/auth/token/refresh` | Refresh Token 검증·교체 | AuthController → AuthService | JPA | ✅ |
| 7 | POST | `/v1/auth/logout` | 사용자 Refresh Token 삭제 | AuthController → AuthService | JPA | ✅ |
| 8 | POST | `/v1/users/profile/initial` | 초기 프로필·영양 목표 저장 | UserController → UserService | JPA | ✅ |
| 9 | GET | `/v1/users/profile` | 프로필·알림 설정 조회 | UserController → UserService | JPA | ✅ |
| 10 | PUT | `/v1/users/profile` | 프로필 수정·목표 재계산 | UserController → UserService | JPA | ✅ |
| 11 | PUT | `/v1/users/settings/notification` | 알림 설정 수정 | UserController → UserService | JPA | ✅ |
| 12 | PUT | `/v1/users/settings/budget` | 외식·요리 예산 수정 | UserController → UserService | JPA | ✅ |
| 13 | POST | `/v1/users/location-consent` | 위치 동의 상태 저장 | UserController → UserService | JPA | ✅ |
| 14 | POST | `/v1/users/devices` | 기기 푸시 토큰 등록 | UserController → UserService | JPA | ✅ |
| 15 | PUT | `/v1/users/password` | 비밀번호 변경·기존 토큰 폐기 | UserController → UserService | JPA | ✅ |
| 16 | DELETE | `/v1/users/account` | 계정 및 종속 데이터 삭제 | UserController → UserService | JPA | ✅ |
| 17 | POST | `/v1/diet/analyze` | 사진 식단 분석 결과 생성 | DietAnalysisController → DietAnalysisService | 파일+JPA+Gemini | 🔑 |
| 18 | GET | `/v1/diet/items/{itemId}` | 분석 음식 항목 상세 조회 | DietAnalysisController → DietAnalysisService | JPA | ✅ |
| 19 | POST | `/v1/diet/records` | 분석 연결 식단 저장 | DietRecordController → DietRecordService | JPA | ✅ |
| 20 | POST | `/v1/diet/records/manual` | 직접 입력 식단 저장 | DietRecordController → DietRecordService | JPA | ✅ |
| 21 | GET | `/v1/diet/calendar` | 월별 기록 날짜 조회 | DietRecordController → DietRecordService | JPA | ✅ |
| 22 | GET | `/v1/diet/records` | 날짜별 식단·열량 조회 | DietRecordController → DietRecordService | JPA | ✅ |
| 23 | GET | `/v1/diet/records/{recordId}` | 식단 상세 조회 | DietRecordController → DietRecordService | JPA | ✅ |
| 24 | PUT | `/v1/diet/records/{recordId}` | 식단·항목 수정 | DietRecordController → DietRecordService | JPA | ✅ |
| 25 | DELETE | `/v1/diet/records/{recordId}` | 식단 삭제 | DietRecordController → DietRecordService | JPA | ✅ |
| 26 | GET | `/v1/diet/foods/search` | 음식 카탈로그 검색 | FoodSearchController → FoodSearchService | JPA | ✅ |
| 27 | GET | `/v1/ai/feedback/daily` | 일간 규칙 기반 피드백 | FeedbackController → FeedbackService | JPA | ✅ |
| 28 | GET | `/v1/ai/feedback/weekly` | 주간 규칙 기반 피드백 | FeedbackController → FeedbackService | JPA | ✅ |
| 29 | GET | `/v1/ai/feedback/monthly` | 월간 규칙 기반 피드백 | FeedbackController → FeedbackService | JPA | ✅ |
| 30 | POST | `/v1/fridge/ingredients` | 냉장고 재료 등록 | FridgeController → FridgeService | JPA | ✅ |
| 31 | GET | `/v1/fridge/ingredients` | 사용자 재료·유통기한 조회 | FridgeController → FridgeService | JPA | ✅ |
| 32 | PUT | `/v1/fridge/ingredients/{ingredientId}` | 재료 수량·기한 수정 | FridgeController → FridgeService | JPA | ✅ |
| 33 | DELETE | `/v1/fridge/ingredients/{ingredientId}` | 재료 삭제 | FridgeController → FridgeService | JPA | ✅ |
| 34 | GET | `/v1/community/posts` | 게시글 목록·페이지 조회 | CommunityController → CommunityService | JPA | ✅ |
| 35 | POST | `/v1/community/analyze-image` | 게시글용 사진 영양 추정 | CommunityController → CommunityService | 파일 검증+Gemini | 🔑 |
| 36 | POST | `/v1/community/posts` | 게시글·이미지 등록 | CommunityController → CommunityService | 파일+JPA | ✅ |
| 37 | GET | `/v1/community/posts/{postId}` | 게시글·댓글·좋아요 조회 | CommunityController → CommunityService | JPA | ✅ |
| 38 | PUT | `/v1/community/posts/{postId}` | 본인 게시글 수정 | CommunityController → CommunityService | JPA | ✅ |
| 39 | DELETE | `/v1/community/posts/{postId}` | 본인 게시글 삭제 | CommunityController → CommunityService | JPA+파일 | ✅ |
| 40 | POST | `/v1/community/posts/{postId}/comments` | 댓글 등록 | CommunityController → CommunityService | JPA | ✅ |
| 41 | DELETE | `/v1/community/posts/{postId}/comments/{commentId}` | 본인 댓글 삭제 | CommunityController → CommunityService | JPA | ✅ |
| 42 | POST | `/v1/community/posts/{postId}/likes` | 좋아요 토글 | CommunityController → CommunityService | JPA | ✅ |
| 43 | GET | `/v1/uploads/community/{fileName:.+}` | 커뮤니티 이미지 제공 | CommunityImageController → CommunityImageStorage | 로컬 파일 | ✅ |
| 44 | GET | `/v1/home/dashboard` | 오늘 섭취량·목표 요약 | DashboardController → DashboardService | JPA | ✅ |
| 45 | GET | `/v1/statistics/daily` | 일간 영양 통계 | StatisticsController → StatisticsService | JPA | ✅ |
| 46 | GET | `/v1/statistics/weekly` | 주간 영양 통계 | StatisticsController → StatisticsService | JPA | ✅ |
| 47 | GET | `/v1/statistics/monthly` | 월간 영양 통계 | StatisticsController → StatisticsService | JPA | ✅ |
| 48 | GET | `/v1/menu/recommend/summary` | 잔여 열량·영양·예산 요약 | MenuController → MenuService | JPA | ✅ |
| 49 | GET | `/v1/menu/recommend/dining-out` | 외식 카테고리 추천 | MenuController → MenuService | JPA | ✅ |
| 50 | GET | `/v1/menu/categories/{categoryId}/items` | 카테고리 메뉴·가격 조회 | MenuController → MenuService | JPA | ✅ |
| 51 | GET | `/v1/menu/items/{itemId}` | 메뉴·재료 상세 조회 | MenuController → MenuService | JPA | ✅ |
| 52 | GET | `/v1/menu/nearby-stores` | 위치 기반 저장 매장·메뉴 조회 | MenuController → NearbyStoreService | JPA+거리 계산 | ✅ |
| 53 | GET | `/v1/menu/recommend/home-cooking` | 냉장고·예산 기반 요리 추천 | RecipeController → RecipeService | JPA | ✅ |
| 54 | GET | `/v1/menu/recipes` | 카테고리 레시피 조회 | RecipeController → RecipeService | JPA | ✅ |
| 55 | GET | `/v1/menu/recipes/{recipeId}` | 레시피·재료·대체재·순서 조회 | RecipeController → RecipeService | JPA | ✅ |
| 56 | POST | `/v1/menu/recommend/leftover` | 냉장고 재료 기반 레시피 추천 | RecipeController → RecipeService | JPA | ✅ |
| 57 | GET | `/v1/menu/recipes/{recipeId}/shopping-list` | 부족 재료·예상 금액·검색 링크 | ShoppingController → ShoppingService | JPA+계산 | ✅ |

## PPT용 API 요약

| 기능 | API 예시 | 상태 |
|---|---|---|
| 인증·프로필 | `/v1/auth/*`, `/v1/users/*` (16개) | ✅ 구현 완료 |
| 식단 기록·검색 | `/v1/diet/*` (10개) | ✅ 구현 완료 |
| 사진 영양 분석 | `POST /v1/diet/analyze` | 🔑 Gemini 연동 완료, 키 없으면 시연용 분석기 |
| 통계·피드백·대시보드 | `/v1/home/*`, `/v1/statistics/*`, `/v1/ai/feedback/*` (7개) | ✅ 구현 완료; 피드백은 규칙 기반 |
| 냉장고·추천·레시피·장보기 | `/v1/fridge/*`, `/v1/menu/*` (14개) | ✅ 구현 완료; 지도/실시간 상품 공급자 미연동 |
| 커뮤니티 | `/v1/community/*` (9개) | ✅ 구현 완료; 이미지 분석은 식단과 같은 분석기 사용 |
| 이미지 제공 | `/v1/uploads/community/*` | ✅ 로컬 파일 응답 |

표 안의 개수는 전체 엔드포인트를 기능 그룹별로 합산한 값입니다. 키가 필요한 API 2개는 본문에 따로 기재했습니다.

## 구현 진행률

- 구현 완료: **57개** (이 중 2개는 실제 AI 판독에 `GEMINI_API_KEY` 필요)
- 미구현: **0개**
- 구현률: **57 / 57 = 100%**
- 테스트: 통합 136/136, 시스템 시나리오 9/9, 탐색 40/40, 단위 72/72 (2026-11-03)

사진 분석은 [FoodImageAnalyzerConfig.java](backend/src/main/java/com/bapmeokja/api/diet/config/FoodImageAnalyzerConfig.java)가 키 유무에 따라 분석기를 고릅니다. 키가 있으면 [GeminiFoodImageAnalyzer.java](backend/src/main/java/com/bapmeokja/api/diet/service/GeminiFoodImageAnalyzer.java)가 사진을 판독하고, 없으면 [HeuristicFoodImageAnalyzer.java](backend/src/main/java/com/bapmeokja/api/diet/service/HeuristicFoodImageAnalyzer.java)가 파일명으로 예시 값을 고릅니다. 커뮤니티 사진 분석도 같은 분석기를 씁니다. 실제 Gemini API(`gemini-3.5-flash-lite`)로 쌀국수 사진이 "소고기 쌀국수"로 인식되어 저장·홈 반영까지 되는 것을 확인했습니다. 인식 정확도는 여러 사진으로 따로 측정해야 합니다.

또한 저장 기기 토큰을 실제 발송하는 FCM/APNs worker, 외부 지도/장소 API, 실시간 판매 상품·가격 조회는 현재 코드에서 확인되지 않습니다. 이는 각각 API 없는 미구현 연동 기능이며, 구현률의 57개 라우트 분모에 넣지 않았습니다. 현재 nearby API는 DB 매장 데이터와 거리 계산으로 응답하고, 쇼핑 목록은 예상 가격 및 외부 검색 URL을 만듭니다.

## 프론트엔드 연결 현황

API 호출 구현은 [bapmeokja-api.ts](src/services/bapmeokja-api.ts#L50), 인증·토큰 interceptor는 [api.ts](src/services/api.ts#L1)에 있습니다. 화면/context에서는 인증·프로필, 홈 대시보드, 식단 분석/기록, 통계·피드백, 메뉴·레시피·냉장고, 커뮤니티 기능을 실제 API 모드에서 호출하도록 연결되어 있습니다. 단, `EXPO_PUBLIC_USE_MOCKS=true`이거나 `EXPO_PUBLIC_API_URL`이 없으면 mock mode가 선택됩니다([api.ts](src/services/api.ts#L10)). 따라서 프론트 코드에 API wrapper가 있다는 것만으로 현재 실행 환경이 서버 연결 상태라고 단정할 수 없습니다.

백엔드에는 있으나 프론트 화면 호출을 확인하지 못한 API:

- `GET /v1/diet/items/{itemId}`
- `GET /v1/diet/foods/search`
- `PUT`, `DELETE /v1/diet/records/{recordId}`
- `PUT /v1/fridge/ingredients/{ingredientId}`
- `PUT /v1/community/posts/{postId}`
- `POST /v1/users/devices` (클라이언트 wrapper는 있으나 실제 호출부 확인 안 됨)

## 핵심 비즈니스 로직

- **사용자별 영양 목표 계산** — [NutritionCalculator.java](backend/src/main/java/com/bapmeokja/api/user/service/NutritionCalculator.java#L12): 입력은 성별·나이·키·체중·활동 수준·목표와 선택적 체성분입니다. 기초대사량 추정치에 활동계수와 감량/유지/증량 조정을 적용하고, 칼로리 범위 및 100kcal 단위로 보정한 뒤 탄수화물·단백질·지방 목표를 반환합니다. 정밀 모드에서는 제지방량 기반 단백질 목표를 사용합니다.
- **식단 기록과 영양 합계 계산** — [DietRecordService.java](backend/src/main/java/com/bapmeokja/api/diet/service/DietRecordService.java#L39), [DietRecord.java](backend/src/main/java/com/bapmeokja/api/diet/domain/DietRecord.java#L109): 입력은 사용자, 끼니·시간, 음식별 중량·영양 값입니다. 사용자의 분석 소유권을 확인하고 항목을 엔티티에 연결한 뒤 항목 합계로 기록 총량을 계산해 저장·응답합니다. 영양값은 요청/분석 항목의 값을 합산하며 이 흐름에서 음식 DB를 다시 조회해 재산출하지는 않습니다.
- **추천 사유 계산** — [MenuService.java](backend/src/main/java/com/bapmeokja/api/menu/MenuService.java#L39): 사용자 목표와 오늘 섭취량을 조회해 영양소별 목표 달성률을 비교하고, 가장 낮은 항목을 추천 사유로 만듭니다. 추천 카테고리는 DB에서 조회합니다.
- **냉장고 기반 레시피 추천** — [RecipeService.java](backend/src/main/java/com/bapmeokja/api/recipe/RecipeService.java#L1): DB의 레시피·재료와 로그인 사용자의 냉장고 재료를 조회한 후 재료명 일치도와 예산을 기준으로 후보를 정렬/반환합니다. 외부 AI 추천이 아니라 코드 내 비교 로직입니다.
- **위치 기반 매장 탐색** — [NearbyStoreService.java](backend/src/main/java/com/bapmeokja/api/store/NearbyStoreService.java#L1): 위치 동의와 좌표를 받아 DB 매장 좌표와의 거리를 계산하고 요청 반경·카테고리 조건에 맞는 매장을 반환합니다. 외부 지도/장소 공급자는 사용하지 않습니다.
- **게시글·댓글·좋아요의 소유권 및 카운트 관리** — [CommunityService.java](backend/src/main/java/com/bapmeokja/api/community/CommunityService.java#L110): 게시글 잠금·작성자 검사 후 수정/삭제하고, 댓글 및 좋아요 변경 때 관련 카운트를 갱신합니다. 데이터 변경은 Repository/JPA 트랜잭션 안에서 처리합니다.

### 핵심 로직 흐름

```text
프로필 입력 → 목표·활동 계수 계산 → 칼로리/영양 목표 저장
음식 항목 입력 → 식단 기록 항목 구성 → 영양 합계 재계산 → DB 저장
오늘 섭취량 + 목표 → 영양소 달성률 비교 → 추천 사유·카테고리 반환
좌표 + 반경 → 저장 매장 거리 계산 → 조건에 맞는 매장 반환
```

## PPT에 넣을 핵심 코드

### 1. 사용자 목표 칼로리 계산

파일: [backend/src/main/java/com/bapmeokja/api/user/service/NutritionCalculator.java](backend/src/main/java/com/bapmeokja/api/user/service/NutritionCalculator.java#L24)

```java
double baseMetabolicRate = 10 * weight + 6.25 * height - 5 * age + (gender == Gender.M ? 5 : -161);
double goalAdjustment = switch (goal) {
    case LOSE -> -450;
    case MAINTAIN -> 0;
    case GAIN -> 300;
};
int calorieGoal = roundToHundred(clamp(
        baseMetabolicRate * activityLevel.getMultiplier() + goalAdjustment,
        minimumCalories,
        5000
));
```

선정 이유: Controller 입력 전달을 넘어 개인 프로필을 목표 수치로 변환하는 핵심 도메인 계산이 드러납니다.

발표 설명: “사용자 신체 정보와 활동 수준, 감량·유지·증량 목표를 반영해 하루 칼로리 목표를 계산합니다. 계산된 값은 성별별 최소치와 상한 범위 안에서 100kcal 단위로 조정됩니다.”

### 2. 식단 항목 합산

파일: [backend/src/main/java/com/bapmeokja/api/diet/domain/DietRecord.java](backend/src/main/java/com/bapmeokja/api/diet/domain/DietRecord.java#L109)

```java
private void recalculateTotals() {
    totalWeightGram = sum(items.stream().map(DietRecordItem::getWeightGram).toList());
    totalCalorie = sum(items.stream().map(DietRecordItem::getCalorie).toList());
    totalCarb = sum(items.stream().map(DietRecordItem::getCarb).toList());
    totalProtein = sum(items.stream().map(DietRecordItem::getProtein).toList());
    totalFat = sum(items.stream().map(DietRecordItem::getFat).toList());
}
```

선정 이유: 식사별 음식 목록에서 중량과 주요 영양소 합계를 산출하는 실제 도메인 로직입니다.

발표 설명: “한 끼의 음식 항목이 추가되거나 교체되면 중량과 열량, 탄수화물·단백질·지방 합계를 다시 계산해 기록에 반영합니다.”

## Swagger / API 테스트

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`
- `springdoc-openapi-starter-webmvc-ui`와 [OpenApiConfig.java](backend/src/main/java/com/bapmeokja/api/config/OpenApiConfig.java#L10)가 문서 제목·버전과 JWT Bearer scheme을 설정합니다. Spring Controller 매핑을 대상으로 API 문서가 생성됩니다.
- 캡처 추천: Swagger UI의 전체 태그/엔드포인트 목록, JWT `Authorize` 창, `POST /v1/diet/records/manual` 요청·응답 예시. 실제 동작 요청을 보이려면 서버·DB를 실행하고 토큰을 발급한 뒤 캡처하세요.
- API 연동 smoke test: [scripts/api-smoke-test.sh](scripts/api-smoke-test.sh#L1). 실제 HTTP로 health, 중복 확인, 회원가입·로그인, 프로필, 식단·통계, 냉장고, 커뮤니티, 대시보드·추천 일부를 확인합니다. 모든 57개 라우트를 검증하는 테스트는 아닙니다.
- 테스트 설정 [application-test.yml](backend/src/main/resources/application-test.yml#L1)은 H2를 사용합니다. 실제 MySQL 기준 통합 검증과 모든 Controller 경로를 포괄하는 검증은 별도 실행 환경/테스트 범위로 구분해야 합니다.

## 추천 캡처 화면

1. Swagger UI에서 API 태그와 주요 엔드포인트가 생성된 화면을 캡처합니다.
2. `POST /v1/diet/records/manual`의 요청 JSON과 응답 record ID·총열량을 보여줍니다.
3. `NutritionCalculator.calculate` 또는 `DietRecord.recalculateTotals` 코드와, 해당 API가 반환한 결과 화면을 나란히 보여줍니다.

## PPT 발표 멘트 (약 30~40초)

“백엔드는 Java와 Spring Boot 기반이며 MySQL과 JPA로 데이터를 저장하고 JWT 인증을 적용했습니다. 현재 코드에서 확인되는 API는 57개로, 회원·프로필, 식단 기록과 통계, 냉장고, 메뉴·레시피 추천, 커뮤니티 기능이 서비스와 데이터 저장까지 연결되어 있습니다. API 명세서 54개와 추가 3개, 총 57개를 모두 구현했고 테스트를 통과했습니다. 사진 분석은 Gemini 연동까지 구현했으며, API 키를 넣으면 실제 사진을 판독합니다.”

## 이 슬라이드에 실제로 넣으면 가장 좋은 자료 3개

1. **구현 57 / 57** 상태 요약과 사진 분석에 키가 필요하다는 한 줄.
2. **PPT용 API 요약 표**: 인증·식단·통계·추천·커뮤니티를 묶고 구현 상태 표시.
3. **영양 목표 계산 코드 또는 식단 합계 코드** 중 하나와 Swagger의 실제 요청·응답 캡처.