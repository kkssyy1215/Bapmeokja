import { expect, Page } from '@playwright/test';
import { createUserByApi, loginToHome, openTab, press, test, visible } from './helpers';

test('외식 추천에서 메뉴 상세와 주변 식당을 볼 수 있다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '추천');
  await expect(visible(page, '추천 외식 메뉴')).toBeVisible();
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

async function menuNames(page: Page): Promise<string[]> {
  const prices = page.getByText(/^예상 [\d,]+원$/).locator('visible=true');
  await expect(prices.first()).toBeVisible();
  return prices.evaluateAll((items) => items.map((item) => item.parentElement?.parentElement?.firstElementChild?.textContent ?? ''));
}

async function menuPrices(page: Page): Promise<number[]> {
  const prices = page.getByText(/^예상 [\d,]+원$/).locator('visible=true');
  await expect(prices.first()).toBeVisible();
  return (await prices.allTextContents()).map((text) => Number(text.replace(/\D/g, '')));
}

test('예산에 맞는 구체적인 메뉴만 보이고 직접 입력할 수 있다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '추천');
  await expect(page.getByText(/보충과 균형|영양 균형을 채우기/).locator('visible=true')).toHaveCount(0);

  await press(page, '5천원');
  await expect.poll(async () => Math.max(...await menuPrices(page))).toBeLessThanOrEqual(5000);

  await press(page, '직접 설정');
  await page.getByPlaceholder('예산을 입력하세요 (원)').fill('3600');
  await press(page, '적용');
  await expect(visible(page, '3,600원')).toBeVisible();
  await expect(visible(page, '주먹밥 세트')).toBeVisible();
});

for (const mode of ['외식', '집밥']) {
  test(`${mode} 새로고침을 누르면 다른 메뉴만 나온다`, async ({ page }) => {
    await loginToHome(page, await createUserByApi());
    await openTab(page, '추천');
    await press(page, mode);
    await expect(visible(page, mode === '외식' ? '추천 외식 메뉴' : '추천 집밥 메뉴')).toBeVisible();
    await press(page, '1만원');
    await expect.poll(async () => (await menuNames(page)).length).toBe(5);
    const before = await menuNames(page);

    await press(page, '새로고침');
    await expect.poll(async () => (await menuNames(page)).some((name) => before.includes(name))).toBe(false);
    expect(await menuNames(page)).toHaveLength(5);
  });
}

test('추천에서 고른 메뉴의 상세가 그대로 열린다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '추천');
  const [name] = await menuNames(page);
  await page.getByText(name, { exact: true }).locator('visible=true').first().click();
  await expect(page).toHaveURL(/\/recommendation-detail/);
  await expect(page.getByText(name, { exact: true }).locator('visible=true').first()).toBeVisible();
});
