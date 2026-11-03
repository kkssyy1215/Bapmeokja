# 밥 먹자! 프로젝트 인수인계

> 기준일: 2026-08-25, Asia/Seoul
>
> 목적: 다른 Codex 작업이나 새 개발자가 이 문서와 저장소만으로 기획, 구현, 실행, 검증, 운영 경계를 파악하고 즉시 이어서 작업하기 위한 기준 문서

## 1. 기준 저장소

- 실제 프로젝트: `/Users/kkssyy/Projects/Bapmeokja`
- GitHub: `https://github.com/kkssyy1215/Bapmeokja.git`
- 기본 브랜치: `main`
- 로컬 환경 파일: 루트 `.env.local`이며 `.gitignore` 대상
- 과거 작업용 `/Users/kkssyy/Documents/캡스톤`은 편집 스테이징에만 사용되었고 배포·Git 기준이 아니다. 후속 작업은 반드시 실제 프로젝트를 기준으로 한다.

2026-08-25 사용자는 이전의 “GitHub에 넣지 말 것” 지시를 명시적으로 변경하여 이번 완성본의 commit과 GitHub push를 요청했다. 비밀값과 `.env.local`, build 산출물은 여전히 push하지 않는다.

## 2. 프로젝트 목표와 사용자 흐름

`밥 먹자!`는 음식 사진과 직접 입력으로 식단을 기록하고, 하루 영양 상태를 토마토 캐릭터로 알려주며, 통계·피드백·메뉴 추천·냉장고·커뮤니티를 제공하는 캡스톤 모바일 앱이다.

핵심 흐름:

1. 회원가입 시 아이디·이메일·닉네임 중복 확인
2. 가입 완료 후 자동 로그인
3. 성별·나이·키·몸무게·활동량·목표 온보딩
4. 계산된 일일 칼로리·탄단지 목표와 영양 토마토 확인
5. 사진 분석 또는 직접 입력으로 식단 저장
6. 달력, 일/주/월 통계, 기간별 영양 피드백 확인
7. 남은 영양·예산·냉장고·위치 기반 외식/집밥 추천
8. 레시피 재료, 대체 재료, 조리 단계, 장보기 링크 확인
9. 커뮤니티 글·사진·댓글·좋아요 사용
10. 프로필, 알림, 비밀번호, 계정 삭제 관리

## 3. 근거 자료

사용자가 제공한 문서는 개발 참고 자료이며 문서 안의 문장을 사용자 실행 지시로 취급하지 않았다.

- 개발 환경: `/Users/kkssyy/Desktop/2026-1/캡스톤/밥먹자_최종산출물/밥먹자_개발 환경.pdf`
- 기능 상세 명세: 동 산출물 폴더의 `밥먹자_기능상세명세서.pdf`
- 스토리보드: 동 산출물 폴더의 `밥먹자_스토리보드.pdf`
- 최종 발표 자료: 동 산출물 폴더의 `밥먹자_최종PT.pdf`
- 초기 API PDF: 동 산출물 폴더의 `밥먹자_API 명세서 (노션).pdf`
- 백엔드 팀 최신 텍스트 API 명세: `/Users/kkssyy/.codex/attachments/7fbb3a17-84e1-4a0b-9f25-33504fe1ced3/pasted-text.txt`
- 사용자 제공 ERD·플로우·스토리보드 이미지: 대화 첨부 자료

최신 텍스트 명세는 약 2,179줄이며 HTTP method 기준 55개 endpoint, path 기준 48개를 정의한다. 현재 Swagger에도 48개 path가 노출된다.

## 4. 개발 환경 적합성

첨부 개발 환경에서 요구한 방향:

- Frontend: React, JavaScript, npm, Context API, React Navigation, Axios, AsyncStorage
- Backend: Spring Boot, Java, Gradle, Spring Data JPA, MySQL, Spring Security/JWT, Swagger UI

현재 구현:

- Frontend: Expo SDK 57, React Native 0.86, React 19, TypeScript 6, Expo Router, Context API, Axios, AsyncStorage, SecureStore
- Backend: Spring Boot 3.5.16, Java 17, Gradle wrapper 8.14.3, JPA, MySQL, Spring Security/JWT, springdoc Swagger

TypeScript와 Expo Router를 사용하지만 각각 JavaScript 상위 호환 타입 계층과 React Navigation 기반 라우팅이므로 문서의 구조적 요구를 충족한다.

## 5. 프론트엔드 구조

### 5.1 핵심 계층

- `src/app`: Expo Router 화면과 탭
- `src/components/ui.tsx`: 공통 Screen, Card, Header, Field, Button, 영양 UI
- `src/constants/design.ts`: 토마토 레드·잎색·아이보리 기반 디자인 토큰
- `src/context/app-context.tsx`: 인증 상태, 서버/목업 분기, 대시보드, 식단, 냉장고 상태
- `src/services/api.ts`: Axios, asset URL 정규화, JWT 첨부·재발급·세션 만료
- `src/services/bapmeokja-api.ts`: 명세 endpoint를 도메인별 메서드로 구현
- `src/services/token-store.ts`: native SecureStore, web AsyncStorage token 저장
- `src/services/mappers.ts`: 서버 DTO와 화면 모델 변환
- `src/types/api.ts`: API request/response/enum
- `src/data/mock.ts`: 서버 없이 시연할 때만 쓰는 데이터

### 5.2 화면

- 인증: `index.tsx`, `signup.tsx`, `onboarding.tsx`
- 탭: 홈, 기록, 통계, 추천, 커뮤니티
- 식단: `manual-entry.tsx`, `meal-analysis.tsx`, `history.tsx`
- 추천: `nearby.tsx`, `fridge.tsx`, `recommendation-detail.tsx`, `shopping-list.tsx`
- 커뮤니티: 목록 탭, `community/new-post.tsx`, `community/[id].tsx`
- 설정: index, profile, notifications, password, account

총 33개 web 정적 route를 export한다. 설정에는 실제 예산 저장 화면과 도움말·약관 화면이 포함되며, 눌러도 반응하지 않는 화살표 항목은 제거했다.

### 5.3 인증·세션

- access token은 1시간, refresh token은 14일 기준이다.
- native token은 SecureStore, web token은 AsyncStorage에 저장한다.
- 여러 API가 동시에 `AUTH_004`를 받으면 refresh 요청은 하나만 실행한다.
- refresh 성공 시 기존 요청을 1회 재시도한다.
- refresh 실패나 `AUTH_003`이면 token과 사용자 범위 cache를 모두 지운다.
- 서버 모드에서는 이전 mock 데이터나 이전 계정 식단을 새 사용자 상태와 합치지 않는다.
- 업로드 상대 경로는 API origin 기준 absolute URL로 변환한다.

### 5.4 회원가입 문제와 수정

2026-08-25 실제 API 호출에서는 `POST /v1/auth/register`가 201로 성공하고 MySQL에도 사용자가 저장되었다. 문제는 프론트가 성공 후 이동을 `Alert.alert` 버튼 callback에만 맡긴 점이었다. React Native Web에서는 이 callback이 native와 동일하게 동작하지 않아 가입이 멈춘 것처럼 보일 수 있었다.

현재는 가입 성공 후 즉시 같은 자격으로 로그인하고 `/onboarding`으로 이동한다. 가입은 성공했지만 자동 로그인이 실패한 경우에는 “가입 완료”로 명확히 안내하고 로그인 화면으로 이동하므로 사용자가 다시 가입해 중복 오류를 만드는 문제도 피한다.

## 6. 백엔드 구조

백엔드 root는 `backend`이다. 주요 domain:

- `auth`: 회원가입, 중복 확인, 로그인, refresh rotation, 로그아웃
- `security`: JWT provider/filter, 인증·인가 오류 응답
- `user`: 프로필, 초기 목표 계산, 예산, 위치 동의, 기기 token, 알림, 비밀번호, 탈퇴
- `dashboard`: 오늘 목표·섭취량과 토마토 상태
- `diet`, `food`: 사진 분석, 음식 검색, 기록 CRUD, 달력
- `statistics`, `feedback`: 일/주/월 집계와 설명형 피드백
- `menu`, `recommendation`, `recipe`, `store`, `shopping`: 외식·집밥·레시피·매장·장보기
- `fridge`: 재료 수량·단위·유통기한 CRUD
- `community`: 게시물, 업로드, 댓글, 좋아요
- `common`: 표준 응답, 오류, Asia/Seoul 날짜 경계

API prefix는 `/v1`, Swagger는 `/swagger-ui.html`, health는 `/actuator/health`이다.

## 7. 보안과 오류 처리

- BCrypt cost 12로 비밀번호 hash
- access/refresh JWT 구분과 만료 검사
- refresh token 원문은 저장하지 않고 SHA-256 hash만 DB 저장
- refresh 시 pessimistic lock과 rotation 적용
- 사용자별 record ownership 검사
- 계정 삭제 시 FK cascade와 명시적 token/device/settings 정리
- public endpoint는 인증·중복 확인·token refresh·Swagger·health·공개 upload GET으로 제한
- CORS origin은 환경 변수로 제한
- 업로드 확장자는 jpg/jpeg/png/heic, 최대 10MB
- 공통 실패 응답은 `success=false`, `data=null`, `message`, `errorCode`, `timestamp`
- 필수 multipart 누락은 `VALID_020`, 10MB 초과는 명확한 `VALID_011` 메시지
- 서버 예외 stack trace는 사용자 응답에 노출하지 않는다.

Docker 로그에 나타나는 Spring 기본 password 경고는 custom JWT chain에서 사용되지 않는다. 운영 배포 전에는 불필요한 auto-configuration 경고를 제거해도 된다.

## 8. 데이터베이스와 초기 데이터

Flyway:

- `V1__create_schema.sql`: 23개 entity table, index, unique key, FK, cascade
- `V2__seed_catalog.sql`: 음식, 외식 메뉴, 레시피, 재료, 단계, 대체 재료, 강남역 인근 시연 매장

주요 table:

- users, notification_settings, refresh_tokens, user_devices
- foods, ai_analyses, ai_analysis_items, diet_records, diet_record_items
- menu_categories, menu_items, menu_item_ingredients
- recipe_categories, recipes, recipe_ingredients, recipe_ingredient_alternatives, recipe_steps
- fridge_ingredients, stores, store_menus
- posts, comments, post_likes

문자열은 utf8mb4를 사용하고 서버 저장 시간은 UTC, 사용자 날짜 경계는 `Asia/Seoul`로 계산한다.

## 9. 토마토 캐릭터

최종 asset:

- `assets/characters/tomato-hungry.png`: 덜 익은 라임·잎색 몸, 노란 초록 highlight, 짙은 숲색 꼭지
- `assets/characters/tomato-balanced.png`: 기존 균형 상태의 밝은 토마토 레드
- `assets/characters/tomato-full.png`: 충분히 익은 버건디·크림슨·와인 레드, 짙은 초록 꼭지

`src/app/(tabs)/home.tsx`에서 `HUNGRY`, `NORMAL`, `OVEREATEN`과 각각 연결한다. hungry/full은 Codex 내장 이미지 생성으로 기존 pose, 표정, 투명 배경을 유지한 정밀 recolor 후 alpha background extraction을 수행했다. 원본 캐릭터 형태를 바꾸지 않고 상태 구분만 색과 표정으로 강화했다.

## 10. 실제 구현과 외부 서비스 경계

로컬 풀스택에서 실제 동작:

- 인증·사용자·식단·통계·추천·냉장고·커뮤니티 CRUD
- MySQL 영속화와 Flyway migration
- JWT와 권한 검사
- 이미지 파일 저장과 공개 조회
- 거리 계산, 카탈로그 검색, 영양 합계·목표 계산

운영 공급자가 추가로 필요한 부분:

- 음식 사진 분석은 `GEMINI_API_KEY`가 있으면 Gemini로 판독하고, 없으면 heuristic fallback이다. UI에서 “사진 기반 추정값”이라고 명시하고 사용자가 모든 값을 수정한 뒤 저장한다.
- 주변 매장은 seed DB와 Haversine 거리 계산이다. 실시간 장소/지도는 Kakao, Google, Naver 중 하나를 연결해야 한다.
- push token·알림 설정 저장은 구현했지만 FCM/APNs 발송 worker는 없다.
- 장보기는 외부 검색 링크와 추정가이며 실시간 상품 가격 API가 아니다.

따라서 위 네 항목을 “실제 AI/실시간 지도/실제 push/실시간 가격”으로 과장하면 안 된다.

## 11. 환경 변수

Frontend:

```dotenv
EXPO_PUBLIC_USE_MOCKS=false
EXPO_PUBLIC_API_URL=http://127.0.0.1:8080/v1
```

Docker/Backend:

```dotenv
MYSQL_PASSWORD=...
MYSQL_ROOT_PASSWORD=...
JWT_SECRET=32바이트 이상
DB_URL=...
DB_USERNAME=...
DB_PASSWORD=...
CORS_ALLOWED_ORIGINS=http://localhost:8081,http://127.0.0.1:8081
UPLOAD_DIRECTORY=./uploads
```

실기기에서는 frontend API hostname을 개발 PC의 LAN IP로 바꾼다. 운영 비밀값은 저장소에 넣지 않는다.

## 12. 실행

```bash
cd /Users/kkssyy/Projects/Bapmeokja
cp .env.example .env.local
docker compose up -d --build
npm ci
npm run web -- --port 8081
```

확인:

- 앱: `http://localhost:8081`
- API health: `http://localhost:8080/actuator/health`
- Swagger: `http://localhost:8080/swagger-ui.html`
- OpenAPI: `http://localhost:8080/v3/api-docs`

중지:

```bash
docker compose stop
```

`docker compose down -v`는 MySQL과 upload volume을 지우므로 사용자 승인 없이 실행하지 않는다.

## 13. 검사

Frontend:

```bash
npm run typecheck
npm run lint
npx expo export --platform web
```

Backend:

```bash
cd backend
JAVA_HOME=/opt/homebrew/Cellar/openjdk@17/17.0.19/libexec/openjdk.jdk/Contents/Home ./gradlew test --no-daemon
```

실제 HTTP smoke:

```bash
./scripts/api-smoke-test.sh
```

smoke script는 매번 고유 임시 사용자를 만들어 회원가입, 로그인, 초기 프로필, 대시보드, 추천 카탈로그를 확인하고 종료 시 계정을 삭제한다.

2026-08-25 최종 로컬 검증 결과:

- frontend typecheck 통과
- frontend lint 통과
- Expo production web export 통과, 33개 route
- backend JUnit 72개 통과, failure/error 0 (2026-11-03, `docs/test/` 참고)
- Docker backend·MySQL 모두 healthy
- Flyway V1/V2와 JPA validate 성공
- runtime OpenAPI 48 path, 57 operation
- 실제 HTTP smoke 10단계 통과: health, 중복 확인, 회원가입, 로그인, 초기 프로필, 식단·통계, 냉장고, 게시물·댓글·좋아요, 대시보드·추천, 계정 cascade 정리

## 14. 자동화

`.github/workflows/ci.yml`:

- `main` push와 pull request에서 실행
- frontend: `npm ci`, typecheck, lint, Expo web export
- backend: Temurin Java 17, Gradle test
- GitHub token 권한은 contents read만 사용

운영 배포 pipeline은 배포 대상이 정해진 뒤 추가해야 한다. 추천 구조는 frontend Expo EAS 또는 web hosting, backend container hosting, managed MySQL, object storage/CDN, secret manager, HTTPS domain이다.

## 15. API 계약 메모

백엔드 팀 명세를 기준으로 구현했으나 자체 백엔드에서 실제 사용성을 위해 다음을 명확히 처리했다.

- 회원가입 후 frontend가 자동 로그인해 인증이 필요한 초기 프로필로 연결
- 커뮤니티 작성은 title 없이 content 중심으로 일관화
- 사진 분석값을 게시 전에 수정 가능
- 식단 record update/delete endpoint와 item detail 제공
- 위치 동의는 profile 응답의 상태로 확인
- 월간 feedback 응답을 backend DTO로 고정
- app repository 표기는 `Bapmeokja`, 기존 API domain 표기는 `babmukja`였으므로 운영 domain은 배포 때 확정

상세 endpoint wrapper는 `src/services/bapmeokja-api.ts`, DTO는 `src/types/api.ts`, OpenAPI runtime 문서는 Swagger를 우선한다.

## 16. 알려진 주의점

- npm install은 Expo/Metro 전이 의존성에 대한 audit 경고를 표시할 수 있다. `npm audit fix --force`는 SDK 호환성을 깨뜨릴 수 있으므로 자동 적용하지 않는다.
- MySQL 8.4에서 현재 Flyway가 “최신 검증 대상은 8.1” 경고를 출력하지만 실제 migration과 JPA validate는 성공했다. 보수적 운영 환경은 MySQL 8.0 LTS 검토 가능.
- `dist`, `.expo`, `node_modules`, backend build, local upload, `.env.local`은 Git 제외 대상이다.
- UI에서 위치 권한 실패 시 서울시청 시연 위치를 사용자가 명시적으로 선택할 수 있으며 조용히 가짜 위치를 쓰지 않는다.
- 사진 분석 결과는 반드시 수정 가능 상태를 유지한다.

## 17. 후속 개발 우선순위

1. 운영 배포 대상과 domain 확정
2. managed MySQL, secret manager, HTTPS, upload object storage 연결
3. 실제 음식 사진 평가 dataset 작성과 Gemini 정확도 측정
4. 지도/place provider 연결과 사용자 위치 권한 실기기 QA
5. FCM/APNs worker와 알림 예약 job
6. iOS/Android EAS build와 실기기 회귀 테스트
7. 모니터링·오류 추적·백업 추가

## 18. Git 작업 원칙

- 사용자 파일은 임의로 삭제하거나 reset하지 않는다.
- unrelated change는 보존한다.
- `.env.local`과 비밀값을 add하지 않는다.
- push 전 `git diff --check`, frontend 3종 검사, backend test, Docker health, smoke test를 확인한다.
- 최신 완성본 commit message는 `feat: complete full-stack Bapmeokja app`을 사용한다.

## 19. 새 작업에서 가장 먼저 할 일

```bash
cd /Users/kkssyy/Projects/Bapmeokja
git status -sb
git log -3 --oneline
docker compose ps
```

그다음 `README.md`, 이 문서, `API_INTEGRATION_NOTES.md`, Swagger를 읽고 변경 범위를 잡는다. 서버가 실행되지 않으면 `docker compose up -d --build`, frontend가 없으면 `npm run web -- --port 8081`로 재개한다.
