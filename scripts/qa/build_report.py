"""테스트 결과 JSON으로 결과서의 상세 표(부록)를 만든다.

실행: python3 scripts/qa/build_report.py
입력: docs/test/results/*.json  출력: docs/test/results/*-table.md
"""

import json
from collections import defaultdict

from bapqa import RESULT_DIR

API_NAMES = {
    1: "로그인", 2: "회원가입", 3: "아이디 중복 확인", 4: "이메일 중복 확인", 5: "닉네임 중복 확인",
    6: "토큰 재발급", 7: "로그아웃", 8: "초기 신체정보 등록", 9: "프로필 조회", 10: "프로필 수정",
    11: "알림 설정 수정", 12: "예산 설정", 13: "위치 정보 동의", 14: "푸시 기기 등록", 15: "비밀번호 변경",
    16: "회원 탈퇴", 17: "음식 사진 분석", 18: "분석 항목 상세", 19: "식단 저장(분석 기반)", 20: "식단 저장(직접 입력)",
    21: "월간 캘린더", 22: "날짜별 식단 조회", 23: "식단 상세 조회", 24: "식단 수정", 25: "식단 삭제",
    26: "음식 검색", 27: "일간 AI 피드백", 28: "주간 AI 피드백", 29: "월간 AI 피드백", 30: "냉장고 재료 등록",
    31: "냉장고 재료 조회", 32: "냉장고 재료 수정", 33: "냉장고 재료 삭제", 34: "게시글 목록", 35: "게시글 사진 영양 추정",
    36: "게시글 작성", 37: "게시글 상세", 38: "게시글 수정", 39: "게시글 삭제", 40: "댓글 작성",
    41: "댓글 삭제", 42: "좋아요 토글", 43: "커뮤니티 이미지 제공", 44: "홈 대시보드", 45: "일간 통계",
    46: "주간 통계", 47: "월간 통계", 48: "추천 요약", 49: "외식 추천", 50: "카테고리 메뉴 목록",
    51: "메뉴 상세", 52: "주변 매장 조회", 53: "집밥 추천", 54: "레시피 목록", 55: "레시피 상세",
    56: "남은 재료 기반 추천", 57: "장보기 리스트",
}


def esc(value):
    return str(value).replace("|", "\\|").replace("\n", " ")


def integration_tables():
    data = json.loads((RESULT_DIR / "integration-result.json").read_text(encoding="utf-8"))
    cases = data["cases"]
    by_api = defaultdict(list)
    for c in cases:
        by_api[c["api_no"]].append(c)
    endpoint_of = {n: cs[0]["endpoint"] for n, cs in by_api.items()}

    lines = ["# 부록 A. API별 통합 테스트 결과", "",
             f"실행 시각: {data['summary']['executedAt']} · 대상: `{data['summary']['server']}`", "",
             "| # | API | 기능 | 정상 | 예외 | DB검증 | 결과 |", "|---:|---|---|:---:|:---:|:---:|:---:|"]
    for n in range(1, 58):
        cs = by_api.get(n, [])
        count = lambda k: sum(c["kind"] == k for c in cs)
        ok = cs and all(c["passed"] for c in cs)
        lines.append(f"| {n} | `{endpoint_of.get(n, '-')}` | {API_NAMES[n]} | {count('정상')} | {count('예외')} | "
                     f"{count('DB검증')} | {'✅ 통과' if ok else '❌ 실패'} |")

    lines += ["", "# 부록 B. 통합 테스트 케이스 전체 목록", "",
              "| ID | API# | 엔드포인트 | 구분 | 테스트 내용 | 기대 결과 | 실제 결과 | 판정 |",
              "|---|---:|---|---|---|---|---|:---:|"]
    for c in cases:
        lines.append(f"| {c['case_id']} | {c['api_no']} | `{esc(c['endpoint'])}` | {c['kind']} | {esc(c['title'])} | "
                     f"{esc(c['expected'])} | {esc(c['actual'])} | {'PASS' if c['passed'] else 'FAIL'} |")
    (RESULT_DIR / "integration-table.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def system_tables():
    data = json.loads((RESULT_DIR / "system-result.json").read_text(encoding="utf-8"))
    lines = ["# 부록 C. 시스템 테스트 시나리오별 단계 결과", "",
             f"실행 시각: {data['summary']['executedAt']} · 대상: `{data['summary']['server']}`", ""]
    for sc in data["scenarios"]:
        passed = sum(s["passed"] for s in sc["steps"])
        lines += [f"## {sc['scenario_id']} {sc['name']}", "",
                  f"- 관련 기능: {sc['feature']}", f"- 사전 조건: {sc['precondition']}",
                  f"- 결과: {'✅ 통과' if sc['passed'] else '❌ 실패'} ({passed}/{len(sc['steps'])} 단계)", "",
                  "| 단계 | 사용자 행동 / 검증 내용 | 기대 결과 | 실제 결과 | 판정 |", "|---:|---|---|---|:---:|"]
        for s in sc["steps"]:
            lines.append(f"| {s['no']} | {esc(s['action'])} | {esc(s['expected'])} | {esc(s['actual'])[:80]} | "
                         f"{'PASS' if s['passed'] else 'FAIL'} |")
        lines.append("")
    (RESULT_DIR / "system-table.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


if __name__ == "__main__":
    integration_tables()
    system_tables()
    print("written:", RESULT_DIR / "integration-table.md", RESULT_DIR / "system-table.md")
