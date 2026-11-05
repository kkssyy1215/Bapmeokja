import { expect } from '@playwright/test';
import { field, login, newUser, press, test, visible } from './helpers';

test('회원가입 → 기본 정보 입력 → 홈 진입', async ({ page }) => {
  const user = newUser();
  await page.goto('/');
  await press(page, '회원가입');
  await expect(page).toHaveURL(/\/signup/);

  await field(page, '이름').fill('이투이');
  await field(page, '닉네임').fill(user.nickname);
  await field(page, '이메일').fill(user.email);
  await field(page, '아이디').fill(user.username);
  // 닉네임, 이메일, 아이디 순서로 중복 확인 버튼이 있다. 누르면 '확인됨'으로 바뀐다.
  for (let checked = 0; checked < 3; checked += 1) {
    await page.getByText('중복 확인', { exact: true }).first().click();
    await expect(page.getByText('확인됨', { exact: true })).toHaveCount(checked + 1);
  }
  await field(page, '비밀번호').fill(user.password);
  await field(page, '비밀번호 확인').fill(user.password);
  await press(page, '이용약관 동의 (필수)');
  await press(page, '개인정보 처리방침 동의 (필수)');
  await press(page, '회원가입');

  await expect(page).toHaveURL(/\/onboarding/);
  await press(page, '여성');
  await field(page, '나이 (세)').fill('25');
  await field(page, '키 (cm)').fill('165');
  await field(page, '몸무게 (kg)').fill('58');
  await press(page, '하루 목표 계산하기');

  await expect(page).toHaveURL(/\/home/);
  await expect(visible(page, user.nickname)).toBeVisible();
  await expect(visible(page, '오늘 섭취')).toBeVisible();
});

test('틀린 비밀번호로는 로그인되지 않는다', async ({ page }) => {
  await login(page, { ...newUser(), password: 'Wrong!pass123' });
  await expect(page).not.toHaveURL(/\/home/, { timeout: 5_000 });
  await expect(page.getByPlaceholder('아이디를 입력하세요')).toBeVisible();
});
