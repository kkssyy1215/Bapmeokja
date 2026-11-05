import { expect, test } from '@playwright/test';
import { addManualMeal, createUserByApi, loginToHome, openTab, press, visible } from './helpers';

test('기록이 일간·주간·월간 통계와 AI 피드백에 반영된다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await addManualMeal(page, '비빔밥', '650');

  await openTab(page, '통계');
  await expect(visible(page, '오늘 섭취 칼로리')).toBeVisible();
  await expect(visible(page, /^650/)).toBeVisible();

  await press(page, '주간');
  await expect(visible(page, '오늘 섭취 칼로리')).toBeHidden();
  await press(page, '월간');
  await expect(page.getByText('통계를 불러오고 있어요')).toHaveCount(0);

  await press(page, '이번 달 식단 피드백 보기');
  await expect(page).toHaveURL(/\/ai-feedback/);
  // 실제 서버 응답으로 분석 결과와 다음 행동이 보이는지 기간별로 확인한다.
  await expect(visible(page, '제안에 맞는 메뉴 보기')).toBeVisible();
  await press(page, '일간');
  await expect(visible(page, '제안에 맞는 메뉴 보기')).toBeVisible();
});

test('기록이 없으면 식단 피드백이 오류 대신 기록 안내를 보여 준다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await press(page, '오늘의 식단 피드백 보기');
  await expect(visible(page, '오늘 기록이 아직 없어요')).toBeVisible();
  await expect(visible(page, '피드백을 만들 수 없어요')).toBeHidden();
  await press(page, '식단 기록하기');
  await expect(page).toHaveURL(/\/records/);
});
