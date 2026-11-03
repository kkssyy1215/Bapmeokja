import { expect, test } from '@playwright/test';
import { createUserByApi, loginToHome, openTab, press, visible } from './helpers';

test('사진을 올려 분석하고 저장하면 홈으로 돌아가 반영된다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '식단');

  const chooser = page.waitForEvent('filechooser');
  await press(page, '앨범에서 선택');
  await (await chooser).setFiles('e2e/fixtures/meal.png');

  await expect(page).toHaveURL(/\/meal-analysis/);
  await expect(visible(page, '인식한 음식')).toBeVisible({ timeout: 45_000 });
  await press(page, '이 내용으로 저장');

  await expect(page).toHaveURL(/\/home/);
  await expect(page.getByText('아직 오늘 기록이 없어요')).toHaveCount(0);
});
