import { expect } from '@playwright/test';
import { createUserByApi, loginToHome, press, test, visible } from './helpers';

test('새로고침해도 로그인이 유지된다', async ({ page }) => {
  const user = await createUserByApi();
  await loginToHome(page, user);
  await page.reload();
  await expect(visible(page, user.nickname)).toBeVisible();
});

test('로그아웃하면 로그인 화면으로 돌아가고 새로고침해도 유지되지 않는다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await page.getByRole('button', { name: '설정' }).click();
  await expect(page).toHaveURL(/\/settings/);
  await press(page, '로그아웃');
  await expect(page.getByPlaceholder('아이디를 입력하세요')).toBeVisible();
  await page.reload();
  await expect(page.getByPlaceholder('아이디를 입력하세요')).toBeVisible();
});

test('로그인하지 않으면 홈 주소로 들어가도 로그인 화면으로 간다', async ({ page }) => {
  await page.goto('/home');
  await expect(page.getByPlaceholder('아이디를 입력하세요')).toBeVisible();
});

test('주소로 바로 들어와도 뒤로 가기를 누르면 홈으로 간다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await page.goto('/fridge');
  await expect(visible(page, '내 냉장고')).toBeVisible();
  await page.getByRole('button', { name: '뒤로' }).locator('visible=true').first().click();
  await expect(page).toHaveURL(/\/home/);
});

test('서버가 느려도 로그아웃이 바로 끝나고 브라우저 확인창에 의존하지 않는다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  // 확인창이 막힌 인앱 브라우저처럼 만든다.
  await page.addInitScript(() => { window.confirm = () => false; });
  await page.reload();
  await page.route('**/auth/logout', async (route) => { await new Promise((resolve) => setTimeout(resolve, 12_000)); await route.continue().catch(() => undefined); });
  await page.getByRole('button', { name: '설정' }).click();
  await expect(page).toHaveURL(/\/settings/);
  const start = Date.now();
  await press(page, '로그아웃');
  await expect(page.getByPlaceholder('아이디를 입력하세요')).toBeVisible();
  expect(Date.now() - start).toBeLessThan(5_000);
  await page.reload();
  await expect(page.getByPlaceholder('아이디를 입력하세요')).toBeVisible();
});
