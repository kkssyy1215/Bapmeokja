import { expect, test } from '@playwright/test';
import { createUserByApi, loginToHome, press, visible } from './helpers';

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

  page.on('dialog', (dialog) => dialog.accept());
  await press(page, '로그아웃');
  await expect(page.getByPlaceholder('아이디를 입력하세요')).toBeVisible();
  await page.reload();
  await expect(page.getByPlaceholder('아이디를 입력하세요')).toBeVisible();
});

test('로그인하지 않으면 홈 주소로 들어가도 로그인 화면으로 간다', async ({ page }) => {
  await page.goto('/home');
  await expect(page.getByPlaceholder('아이디를 입력하세요')).toBeVisible();
});
