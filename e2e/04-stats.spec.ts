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

  await press(page, '피드백 보기 →');
  await expect(page).toHaveURL(/\/ai-feedback/);
});
