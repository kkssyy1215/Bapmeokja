import { expect, test } from '@playwright/test';
import { addManualMeal, createUserByApi, loginToHome, press, visible } from './helpers';

test('직접 입력한 식단이 홈과 캘린더에 반영된다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await addManualMeal(page, '닭가슴살 샐러드', '420');

  await expect(visible(page, '닭가슴살 샐러드')).toBeVisible();
  await expect(visible(page, /^420/)).toBeVisible();

  await press(page, '전체 보기');
  await expect(page).toHaveURL(/\/history/);
  await expect(visible(page, '닭가슴살 샐러드')).toBeVisible();
});
