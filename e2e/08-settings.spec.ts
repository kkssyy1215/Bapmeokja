import { expect, test } from '@playwright/test';
import { createUserByApi, field, login, loginToHome, newUser, press, visible } from './helpers';

test('프로필을 수정하면 저장 후 이전 화면으로 돌아간다', async ({ page }) => {
  const user = await createUserByApi();
  await loginToHome(page, user);
  await page.getByRole('button', { name: '설정' }).click();
  await press(page, '내 정보 관리');
  const nickname = newUser().nickname;
  await field(page, '닉네임').fill(nickname);
  await press(page, '변경사항 저장');
  await expect(page).not.toHaveURL(/settings\/profile/);
  await expect(visible(page, nickname)).toBeVisible();
});

test('비밀번호를 바꾸면 새 비밀번호로 로그인한다', async ({ page }) => {
  const user = await createUserByApi();
  await loginToHome(page, user);
  await page.getByRole('button', { name: '설정' }).click();
  await press(page, '비밀번호 변경');
  const changed = 'NewE2e!2026';
  await field(page, '현재 비밀번호').fill(user.password);
  await field(page, '새 비밀번호').fill(changed);
  await field(page, '새 비밀번호 확인').fill(changed);
  await press(page, '비밀번호 변경');
  await expect(page).not.toHaveURL(/settings\/password/);

  await page.context().clearCookies();
  await page.evaluate(() => localStorage.clear());
  await loginToHome(page, { ...user, password: changed });
});

test('회원 탈퇴하면 로그인 화면으로 가고 다시 로그인할 수 없다', async ({ page }) => {
  const user = await createUserByApi();
  await loginToHome(page, user);
  await page.getByRole('button', { name: '설정' }).click();
  await press(page, '회원 탈퇴');
  await field(page, '현재 비밀번호').fill(user.password);
  await field(page, "확인을 위해 '회원탈퇴' 입력").fill('회원탈퇴');
  page.on('dialog', (dialog) => dialog.accept());
  await press(page, '계정과 데이터 영구 삭제');

  await expect(page.getByPlaceholder('아이디를 입력하세요')).toBeVisible();
  await login(page, user);
  await expect(page).not.toHaveURL(/\/home/, { timeout: 5_000 });
});
