import { expect, test } from '@playwright/test';
import { createUserByApi, loginToHome, openTab, press, visible } from './helpers';

test('외식 추천에서 메뉴 상세와 주변 식당을 볼 수 있다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '추천');
  await expect(visible(page, '추천 외식 메뉴')).toBeVisible();

  page.on('dialog', (dialog) => dialog.accept());
  await press(page, '주변 식당 보기');
  await expect(page).toHaveURL(/\/nearby/);
  // 추천 메뉴를 파는 실제 식당은 네이버 지도로 연결한다.
  await expect(visible(page, /네이버 지도에서 .+ 식당 보기/)).toBeVisible();
  const popup = page.context().waitForEvent('page');
  await page.getByText(/네이버 지도에서 .+ 식당 보기/).locator('visible=true').first().click();
  await expect.poll(async () => (await popup).url()).toContain('map.naver.com');
});

test('추천 메뉴를 누르면 상세 화면이 열린다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '추천');
  await page.getByText('상세 메뉴 보기').or(page.getByText(/^예상 /)).locator('visible=true').first().click();
  await expect(page).toHaveURL(/\/recommendation-detail/);
});

test('예산을 바꾸면 추천 메뉴가 달라지고 직접 입력할 수 있다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '추천');
  await expect(visible(page, '샌드위치')).toBeVisible();

  await press(page, '5천원');
  await expect(visible(page, '간편식')).toBeVisible();
  await expect(page.getByText('샌드위치', { exact: true }).locator('visible=true')).toHaveCount(0);

  await press(page, '직접 설정');
  await page.getByPlaceholder('예산을 입력하세요 (원)').fill('13000');
  await press(page, '적용');
  await expect(visible(page, '13,000원')).toBeVisible();
  await expect(visible(page, '포케')).toBeVisible();
});
