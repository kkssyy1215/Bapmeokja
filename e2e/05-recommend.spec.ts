import { expect, test } from '@playwright/test';
import { createUserByApi, loginToHome, openTab, press, visible } from './helpers';

test('외식 추천에서 메뉴 상세와 주변 식당을 볼 수 있다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '추천');
  await expect(visible(page, '추천 외식 종류')).toBeVisible();

  page.on('dialog', (dialog) => dialog.accept());
  await press(page, '주변 식당 확인');
  await expect(page).toHaveURL(/\/nearby/);
});

test('추천 메뉴를 누르면 상세 화면이 열린다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '추천');
  await page.getByText('상세 메뉴 보기').or(page.getByText(/^예상 /)).locator('visible=true').first().click();
  await expect(page).toHaveURL(/\/recommendation-detail/);
});
