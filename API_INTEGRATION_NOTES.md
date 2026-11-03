# 백엔드 API 연동 메모

## 기준

- API prefix: `/v1`
- 공통 성공: `success`, `data`, `message`, `timestamp`
- 공통 실패: `success=false`, `data=null`, `message`, `errorCode`, `timestamp`
- 인증: `Authorization: Bearer <accessToken>`
- API 명세 method 55개, runtime OpenAPI path 48개
- frontend 계약: `src/services/bapmeokja-api.ts`, `src/types/api.ts`
- backend runtime 문서: `/swagger-ui.html`, `/v3/api-docs`

## 실행 모드

- `EXPO_PUBLIC_USE_MOCKS=false`: 실제 Spring Boot/MySQL
- `EXPO_PUBLIC_USE_MOCKS=true`: 오프라인 시연 데이터
- `EXPO_PUBLIC_API_URL=http://127.0.0.1:8080/v1`: web/iOS simulator
- 실제 휴대폰은 `127.0.0.1` 대신 개발 PC LAN IP 필요

## 인증 흐름

1. username/email/nickname 중복 확인
2. `/auth/register`
3. `/auth/login`으로 자동 로그인
4. `isNewUser=true`면 `/users/profile/initial`
5. access token 만료 시 `/auth/token/refresh` single-flight 호출과 원 요청 1회 재시도
6. refresh 실패 시 token과 계정별 local cache 제거

회원가입 응답에는 token이 없기 때문에 frontend가 가입 직후 login을 호출한다. 웹 성공 알림 callback에 navigation을 의존하지 않는다.

## 명세 공백을 현재 구현에서 처리한 방식

- 커뮤니티 title 불일치: content 중심 UI/API 사용
- 커뮤니티 사진 분석의 foodName: 게시 전 화면에 표시하고 영양값을 사용자가 수정 가능
- 기존 식단 수정: backend의 record update/delete와 item detail을 사용
- 위치 동의 조회: profile 응답의 `locationConsentGranted` 사용
- 월간 feedback: backend DTO로 필드 고정
- 상대 upload URL: frontend Axios response interceptor에서 API origin 기준 absolute URL 변환
- empty success/failure: `data:null`을 항상 포함해 명세 형식 유지

## 운영 공급자가 필요한 기능

- 비전 AI key: `GEMINI_API_KEY` (코드는 구현됨, `docs/guides/배포-가이드.md` 참고)
- Kakao/Google/Naver 지도·장소 API
- FCM/APNs 발송 worker
- 실제 상품·가격 제휴 API

키가 없을 때 backend fallback은 각각 heuristic 분석, seed 매장+거리 계산, token 저장만, 검색 링크+추정가다. 화면에서 실제 확정값으로 과장하지 않는다.

## 추가된 오류 응답

- `429 RATE_001`: 요청 횟수 초과 (인증 분당 30회, 사진 분석 분당 10회, IP 기준). `Retry-After: 60` 포함. 로컬 Docker는 기본으로 꺼져 있음
- `405 VALID_012`, `415 VALID_013`: 지원하지 않는 메서드·요청 형식
- `404 NOTFOUND_001`: 없는 주소 (이전에는 500)
- `503 NET_001`: AI 호출량 초과·외부 서비스 장애, `504 AI_002`: AI 시간 초과, `502 AI_001`: 음식 인식 실패. 프론트는 직접 입력으로 안내

## 회귀 검사

```bash
npm run typecheck
npm run lint
npx expo export --platform web
cd backend && ./gradlew test --no-daemon
./scripts/api-smoke-test.sh
```
