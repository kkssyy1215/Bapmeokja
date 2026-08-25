# 밥 먹자!

음식 기록, 영양 통계, 맞춤 메뉴 추천, 냉장고 관리, 커뮤니티를 한 앱에서 제공하는 캡스톤 프로젝트입니다. Expo/React Native 프론트엔드와 Spring Boot/MySQL 백엔드를 한 저장소에서 실행할 수 있습니다.

## 구현 기능

- 회원가입, 중복 확인, 자동 로그인, JWT access/refresh 재발급, 비밀번호 변경, 회원 탈퇴
- 신체 정보·목표 온보딩과 일일 칼로리·탄수화물·단백질·지방 목표 계산
- 세 상태의 토마토 캐릭터 대시보드와 오늘 식단
- 사진 분석 결과 수정·저장, 직접 식단 입력, 달력·과거 기록, 일/주/월 통계와 피드백
- 외식·집밥 추천, 예산 필터, 주변 식당, 냉장고 재료, 대체 재료, 장보기 링크
- 게시물·사진·영양 정보·댓글·좋아요 커뮤니티
- 알림 시간, 위치 동의, 프로필, 예산, 계정 보안 설정
- Swagger/OpenAPI, Flyway 스키마·초기 데이터, Docker Compose, GitHub Actions CI

## 기술 구성

| 구분 | 구성 |
|---|---|
| Frontend | Expo SDK 57, React Native 0.86, TypeScript, Expo Router/React Navigation, Context API, Axios, AsyncStorage, SecureStore |
| Backend | Spring Boot 3.5.16, Java 17, Gradle 8.14.3, Spring Security/JWT, Spring Data JPA, Bean Validation |
| Data/API | MySQL 8.4, Flyway, Swagger UI/OpenAPI |
| Local runtime | Docker Compose |

## 빠른 실행

필수 도구는 Node.js 22 이상과 Docker Desktop입니다.

```bash
cp .env.example .env.local
docker compose up -d --build
npm ci
npm run web -- --port 8081
```

실행 후 확인 주소:

- 앱: <http://localhost:8081>
- 백엔드 상태: <http://localhost:8080/actuator/health>
- Swagger UI: <http://localhost:8080/swagger-ui.html>
- OpenAPI JSON: <http://localhost:8080/v3/api-docs>

`docker compose stop`으로 데이터를 유지한 채 중지할 수 있습니다. 데이터를 포함해 완전히 제거하는 `docker compose down -v`는 로컬 DB와 업로드 볼륨도 삭제하므로 주의하세요.

### iOS·Android에서 실행

```bash
npm start
```

터미널에서 `i`는 iOS 시뮬레이터, `a`는 Android 에뮬레이터를 엽니다. 실제 휴대폰의 Expo Go에서 테스트할 때는 `.env.local`의 `127.0.0.1`을 개발 PC의 같은 Wi-Fi LAN IP로 바꿔야 합니다. Android 에뮬레이터에서는 일반적으로 `10.0.2.2`를 사용합니다. 값을 바꾼 뒤 Expo 서버를 다시 시작하세요.

## 환경 변수

`.env.local`과 실제 비밀값은 Git에서 제외됩니다. 예시는 `.env.example`과 `backend/.env.example`을 확인하세요.

```dotenv
EXPO_PUBLIC_USE_MOCKS=false
EXPO_PUBLIC_API_URL=http://127.0.0.1:8080/v1
MYSQL_PASSWORD=로컬_DB_비밀번호
MYSQL_ROOT_PASSWORD=로컬_ROOT_비밀번호
JWT_SECRET=최소_32바이트_임의_문자열
```

- `EXPO_PUBLIC_USE_MOCKS=false`: 실제 Spring Boot API와 MySQL을 사용합니다.
- `EXPO_PUBLIC_USE_MOCKS=true`: 서버 없이 발표 가능한 로컬 시연 데이터를 사용합니다.
- 운영 환경에서는 Docker Compose의 기본 개발 비밀번호를 사용하지 말고 secret manager나 배포 환경 변수로 주입해야 합니다.

## 검사와 자동화

```bash
npm run typecheck
npm run lint
npx expo export --platform web

cd backend
JAVA_HOME=/path/to/java17 ./gradlew test --no-daemon
```

Docker 백엔드가 실행 중이면 핵심 사용자 흐름을 실제 HTTP 요청으로 검사할 수 있습니다. 스크립트가 임시 계정을 만들고 회원가입 → 로그인 → 온보딩 → 대시보드/추천 조회를 확인한 뒤 계정을 삭제합니다.

```bash
./scripts/api-smoke-test.sh
```

`.github/workflows/ci.yml`은 push와 pull request마다 프론트 타입 검사·린트·웹 export와 백엔드 테스트를 실행합니다.

## 주요 폴더

```text
src/app/                 Expo Router 화면
src/context/             로그인 세션과 앱 상태
src/services/            Axios/JWT/API 계약/DTO 변환
assets/characters/       토마토 캐릭터 3종
backend/src/main/java/   Spring Boot 도메인 구현
backend/src/main/resources/db/migration/
                         Flyway 스키마와 카탈로그 초기 데이터
scripts/                 로컬 통합 검사 자동화
```

자세한 현재 상태와 다음 작업 기준은 `PROJECT_HANDOFF.md`, API 계약 설명은 `API_INTEGRATION_NOTES.md`에 정리되어 있습니다.

## 외부 연동 경계

일반 사용자 흐름은 로컬 풀스택으로 동작하지만, 다음 기능은 운영 키나 별도 공급자가 필요합니다.

- 사진 분석: 현재 사용자 수정이 가능한 휴리스틱 추정 결과. 실제 비전 AI 공급자 연결 필요
- 주변 식당: 현재 DB 초기 매장과 거리 계산. Kakao/Google/Naver 지도·장소 API 연결 필요
- 푸시 알림: 기기 토큰·설정 저장까지 구현. FCM/APNs 발송 worker 필요
- 장보기: 검색 링크와 예상가 제공. 실제 상품·가격 제휴 API 연결 필요

화면은 이러한 값을 확정 정보처럼 표현하지 않고 추정값·시연 데이터임을 명시합니다.
