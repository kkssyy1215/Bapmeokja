# 밥먹자 테스트 · 디버깅 산출물

> 2026-10-14 시작, 2026-11-03 최종 실행 · 대상: 로컬 Docker(MySQL 8.4 + Spring Boot) 서버와 Expo 웹 앱
> 모든 수치는 실제 실행 결과이며, 원본 결과는 [`results/`](results/)에 JSON과 요청·응답 로그로 남겨 두었습니다.

## 한눈에 보기

| 산출물 항목 | 결과 | 문서 |
|---|---|---|
| 테스트 계획 | 단위 → 통합 → 시스템 3단계, 합격 기준 정의 | [01-테스트-계획서](01-테스트-계획서.md) |
| **단위 테스트 리포트** | 백엔드 JUnit **72/72 통과** (23개 클래스) · 라인 커버리지 **41.3%** · 프론트 타입 검사 0 오류 | [02-단위-테스트-리포트](02-단위-테스트-리포트.md) |
| **통합 테스트 결과서** | API↔DB **57/57개 API 통과** (케이스 **136/136**, DB 직접 검증 13건) · 탐색 테스트 **40/40** · Front↔Back 화면 **25개 경로 표시 확인** | [03-통합-테스트-결과서](03-통합-테스트-결과서.md) |
| **시스템 테스트 결과서** | 사용자 시나리오 **9/9 통과** (검증 단계 **103/103**) · 기능(F01~F10) 시나리오 커버율 **100%** | [04-시스템-테스트-결과서](04-시스템-테스트-결과서.md) |
| **버그/이슈 리포트** | 발견 **16건** → 수정 **11건**, 회피 절차 문서화 1건, 남은 4건 (모두 프론트) | [05-버그-이슈-리포트](05-버그-이슈-리포트.md) |
| CI 연동 | GitHub Actions에 API 통합·시스템 테스트 job 추가, 리포트 artifact 업로드 | [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) |

## 테스트 진행 흐름

```text
1차 실행 ── 통합 130건 중 128건 통과 (2건 실패: 500 오류)
   │        단위 28건 통과 · 프론트 타입 검사 실패 (CI도 실패 상태)
   ▼
디버깅 ─── 원인 분석 → 수정 → 회귀 테스트 추가 (BUG-001 ~ BUG-005)
   │        Front↔Back 실데이터 연동 중 화면 오류 2건 추가 발견·수정
   ▼
10/14 실행 ─ 단위 37/37 · 통합 133/133 · 시스템 9/9 · 타입 검사 통과
   │
   ▼
탐색 테스트 ─ 실제 서버 경계 상황에서 버그 4건 추가 발견·수정 (BUG-006 ~ 009)
   ▼
최종 실행 ─ 단위 72/72 · 통합 136/136 · 시스템 9/9 · 탐색 40/40
```

## 다시 실행하는 방법

```bash
docker compose up -d --build                 # MySQL + 백엔드 실행
npm run test:integration                     # 57개 API 통합 테스트 → results/integration-*
npm run test:system                          # 9개 사용자 시나리오 → results/system-*
npm run test:exploratory                     # 경계 상황 40건 → results/exploratory-*
npm run test:report                          # 결과 JSON → 부록 표(md) 생성
cd backend && ./gradlew test                 # 단위 테스트 + JaCoCo 커버리지 리포트
```

JDK 17이 없는 PC에서도 Gradle이 자동으로 내려받아 단위 테스트를 실행합니다.

## 폴더 구성

| 경로 | 내용 |
|---|---|
| `results/integration-result.json` | 통합 테스트 136건의 기대값·실제값·판정 (최종 실행) |
| `results/integration-result-run1.json` | 수정 전 1차 실행 결과 (2건 실패 기록) |
| `results/integration-api-log.md` | 통합 테스트 요청·응답 원문 로그 (토큰·비밀번호 마스킹) |
| `results/system-result.json`, `system-api-log.md` | 시스템 테스트 시나리오·단계 결과와 로그 |
| `results/unit-backend-result.json` | 백엔드 단위 테스트 72건 목록 |
| `results/exploratory-result.json` | 탐색 테스트 40건 결과 |
| `results/integration-table.md`, `system-table.md` | 결과서 부록 표 (자동 생성) |
| `screenshots/` | Front↔Back 연동 및 버그 수정 전후 화면 11장 |
| `../../scripts/qa/` | 테스트 코드 (Python 표준 라이브러리만 사용) |
