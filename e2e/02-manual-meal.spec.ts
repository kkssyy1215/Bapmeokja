import { expect } from '@playwright/test';
import { addManualMeal, createUserByApi, field, loginToHome, press, test, visible } from './helpers';

test('직접 입력한 식단이 홈과 캘린더에 반영된다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await addManualMeal(page, '닭가슴살 샐러드', '420');

  await expect(visible(page, '닭가슴살 샐러드')).toBeVisible();
  await expect(visible(page, /^420/)).toBeVisible();

  await press(page, '전체 보기');
  await expect(page).toHaveURL(/\/history/);
  await expect(visible(page, '닭가슴살 샐러드')).toBeVisible();
});

test('저장한 식단을 수정하고 삭제할 수 있다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await addManualMeal(page, '김치볶음밥', '500');
  await expect(visible(page, '김치볶음밥')).toBeVisible();

  await press(page, '김치볶음밥');
  await press(page, '식단 수정');
  await expect(page).toHaveURL(/\/manual-entry/);
  await field(page, '칼로리 (kcal)').fill('720');
  await field(page, '음식명').fill('제육볶음');
  await press(page, '수정 내용 저장');
  await expect(page).toHaveURL(/\/home/);
  await expect(visible(page, '제육볶음')).toBeVisible();
  await expect(visible(page, /^720/)).toBeVisible();
  await press(page, '제육볶음');
  await press(page, '식단 삭제');
  await expect(page).toHaveURL(/\/home/);
  await expect(visible(page, '아직 기록이 없어요')).toBeVisible();
});
