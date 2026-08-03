# 밥 먹자! 프론트엔드

AI 음식 이미지 분석, 식단 통계, 맞춤 메뉴 추천, 커뮤니티를 제공하는 React Native 모바일 앱입니다. 현재 백엔드 없이도 졸업작품 발표 흐름을 전부 시연할 수 있도록 목업 데이터와 로컬 저장소를 사용합니다.

## 구현 범위

- 로그인, 회원가입, 신체 정보·목표 온보딩
- 영양 토마토 대시보드와 일일 칼로리·탄단지 현황
- 카메라, 앨범, 직접 입력을 통한 식단 기록
- AI 음식 분석 결과 확인·수정·저장
- 달력 기반 이전 식단 조회
- 일간 영양 통계와 AI 피드백
- 외식·집밥 추천, 예산 필터, 주변 식당 지도형 화면
- 냉장고 재료·유통기한 관리와 재료 기반 레시피 추천
- 커뮤니티 게시물, 좋아요, 댓글, 글쓰기
- 프로필·영양 목표·알림 설정

## 기술 구성

- Expo SDK 57 / React Native 0.86 / TypeScript
- Expo Router (React Navigation 기반)
- Context API + AsyncStorage
- Axios 기반 API 클라이언트
- Expo ImagePicker

## 실행

Node.js 22.13 이상이 필요합니다.

```bash
npm install
npm start
```

실행 후 터미널에서 `i`를 누르면 iOS 시뮬레이터, `a`는 Android 에뮬레이터, `w`는 웹 미리보기를 엽니다.

발표용 계정은 로그인 화면에 미리 입력된 `demo` / `1234`를 사용하거나 `데모 계정으로 바로 시작`을 누르면 됩니다.

## 백엔드 연결

백엔드가 준비되기 전에는 `EXPO_PUBLIC_API_URL`이 비어 있어 로컬 목업 모드로 동작합니다. 연결 시 `.env.local`을 만들고 Spring Boot 서버 주소를 지정합니다.

```bash
EXPO_PUBLIC_API_URL=http://localhost:8080/api
```

공통 Axios 인스턴스는 `src/services/api.ts`, 앱 상태와 목업 CRUD는 `src/context/app-context.tsx`, 초기 데이터는 `src/data/mock.ts`에 있습니다. 백엔드 구현 후 Context의 로컬 동작을 서비스 호출로 순차 교체하면 화면 구조를 유지할 수 있습니다.

## 검사

```bash
npm run typecheck
npm run lint
npx expo export --platform web
```
