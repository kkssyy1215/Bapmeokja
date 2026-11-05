import { test as base, expect, Locator, Page, request } from '@playwright/test';

/** 앱 확인창이 뜨면 확인 버튼을 누른다. 모든 테스트에서 쓴다. */
export async function acceptAppDialogs(page: Page): Promise<void> {
  await page.addLocatorHandler(page.getByRole('alertdialog'), async (dialog) => {
    await dialog.locator('[data-testid="dialog-confirm"]').click();
  });
}

export const test = base.extend({
  page: async ({ page }, use) => {
    await acceptAppDialogs(page);
    await use(page);
  },
});

export const API_URL = process.env.E2E_API_URL ?? 'http://127.0.0.1:8080/v1';
export const PASSWORD = 'E2eTest!2026';

export type TestUser = { username: string; nickname: string; email: string; password: string };

export function newUser(): TestUser {
  const suffix = `${Date.now().toString(36)}${Math.floor(Math.random() * 1296).toString(36)}`;
  return {
    username: `e2e${suffix}`.slice(0, 20),
    nickname: `e2e${suffix}`.slice(0, 20),
    email: `e2e${suffix}@example.com`,
    password: PASSWORD,
  };
}

/** 라벨 바로 아래 입력칸. 앱의 Field는 라벨과 입력칸을 연결하지 않아 형제 요소로 찾는다. */
export function field(page: Page, label: string): Locator {
  return page.getByText(label, { exact: true }).locator('visible=true').last().locator('..').locator('input, textarea').first();
}

/** 화면에 보이는 글자를 눌러 버튼이나 항목을 실행한다. */
export async function press(page: Page, text: string): Promise<void> {
  await page.getByText(text, { exact: true }).locator('visible=true').last().click();
}

export function visible(page: Page, text: string | RegExp): Locator {
  return page.getByText(text).locator('visible=true').first();
}

/** 화면과 무관한 준비 단계는 API로 빠르게 끝낸다. */
export async function createUserByApi(user: TestUser = newUser(), onboarded = true): Promise<TestUser> {
  const api = await request.newContext();
  const register = await api.post(`${API_URL}/auth/register`, {
    data: { name: '이투이', nickname: user.nickname, email: user.email, username: user.username, password: user.password, passwordConfirm: user.password, agreeTerms: true, agreePrivacy: true },
  });
  expect(register.ok(), await register.text()).toBeTruthy();
  if (onboarded) {
    const login = await api.post(`${API_URL}/auth/login`, { data: { username: user.username, password: user.password } });
    const token = (await login.json()).data.accessToken as string;
    const profile = await api.post(`${API_URL}/users/profile/initial`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { gender: 'F', age: 25, height: 165, weight: 58, activityLevel: 'MODERATE', goal: 'MAINTAIN' },
    });
    expect(profile.ok(), await profile.text()).toBeTruthy();
  }
  await api.dispose();
  return user;
}

export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/');
  // 시연용 목업 모드에서 통과하는 일이 없도록 실제 서버 연결인지 먼저 확인한다.
  await expect(page.getByText('서버 연결', { exact: true })).toBeVisible();
  await page.getByPlaceholder('아이디를 입력하세요').fill(user.username);
  await page.getByPlaceholder('비밀번호를 입력하세요').fill(user.password);
  await press(page, '로그인');
}

export async function loginToHome(page: Page, user: TestUser): Promise<void> {
  await login(page, user);
  await expect(page).toHaveURL(/\/home/);
  await expect(visible(page, user.nickname)).toBeVisible();
}

/** 하단 탭 이동. */
export async function openTab(page: Page, title: '홈' | '식단' | '통계' | '커뮤니티' | '추천'): Promise<void> {
  await page.getByRole('tab', { name: title }).or(page.getByRole('link', { name: title })).first().click();
}

export async function addManualMeal(page: Page, name: string, calories: string): Promise<void> {
  await openTab(page, '식단');
  await press(page, '직접 입력');
  await expect(page).toHaveURL(/\/manual-entry/);
  await field(page, '음식명').fill(name);
  await field(page, '칼로리 (kcal)').fill(calories);
  await press(page, '식단에 저장');
  await expect(page).toHaveURL(/\/home/);
}
