import { expect } from '@playwright/test';
import { createUserByApi, field, loginToHome, openTab, press, test, visible } from './helpers';

test('냉장고 재료를 추가하면 집밥 추천으로 이어진다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '추천');
  await press(page, '집밥');
  await expect(visible(page, '추천 집밥 메뉴')).toBeVisible();

  await page.getByText(/내 냉장고/).locator('visible=true').first().click();
  await expect(page).toHaveURL(/\/fridge/);
  await field(page, '재료명').fill('양파');
  await field(page, '수량').fill('2');
  await field(page, '단위').fill('개');
  await press(page, '냉장고에 추가');
  await expect(visible(page, '양파')).toBeVisible();
  await expect(visible(page, '1개 재료를 보관 중')).toBeVisible();

  await press(page, '이 재료로 집밥 추천');
  await expect(page).toHaveURL(/\/recommend/);
});

test('냉장고 재료를 삭제할 수 있다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '추천');
  await press(page, '집밥');
  await page.getByText(/내 냉장고/).locator('visible=true').first().click();
  await field(page, '재료명').fill('두부');
  await field(page, '수량').fill('1');
  await field(page, '단위').fill('모');
  await press(page, '냉장고에 추가');
  await expect(visible(page, '두부')).toBeVisible();
  await press(page, '삭제');
  await expect(page.getByText('두부', { exact: true })).toHaveCount(0);
});
