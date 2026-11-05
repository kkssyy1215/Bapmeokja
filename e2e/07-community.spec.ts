import { expect, Page } from '@playwright/test';
import { createUserByApi, field, loginToHome, openTab, press, test, visible } from './helpers';

async function writePost(page: Page, text: string) {
  await openTab(page, '커뮤니티');
  // 하단 탭에도 같은 글자가 있어 화면의 첫 번째 버튼을 누른다.
  await page.getByRole('button', { name: '글쓰기' }).locator('visible=true').first().click();
  await expect(page).toHaveURL(/\/community\/new-post/);
  await field(page, '내용').fill(text);
  await press(page, '게시하기');
  await expect(page).not.toHaveURL(/new-post/);
}

test('글을 쓰면 다른 사용자가 좋아요와 댓글을 남길 수 있다', async ({ browser, page }) => {
  const text = `E2E 글 ${Date.now()}`;
  await loginToHome(page, await createUserByApi());
  await writePost(page, text);

  const context = await browser.newContext();
  const other = await context.newPage();
  await loginToHome(other, await createUserByApi());
  await openTab(other, '커뮤니티');
  await visible(other, text).click();
  await expect(other).toHaveURL(/\/community\/post_/);

  await other.getByText('♡ 좋아요 0', { exact: true }).locator('visible=true').click();
  await expect(other.getByText('♥ 좋아요 1', { exact: true }).locator('visible=true')).toBeVisible();
  await other.getByPlaceholder('따뜻한 댓글을 남겨 주세요').fill('맛있어 보여요');
  await press(other, '등록');
  await expect(visible(other, '맛있어 보여요')).toBeVisible();
  await context.close();
});

test('내 글을 삭제할 수 있다', async ({ page }) => {
  const text = `삭제할 글 ${Date.now()}`;
  await loginToHome(page, await createUserByApi());
  await writePost(page, text);
  await visible(page, text).click();
  await expect(page).toHaveURL(/\/community\/post_/);
  await press(page, '삭제');
  await expect(page).not.toHaveURL(/\/community\/post_/);
  await expect(visible(page, '최근 게시물')).toBeVisible();
  await expect(page.getByText(text, { exact: true }).locator('visible=true')).toHaveCount(0);
});

test('게시글과 댓글을 수정할 수 있고 사진은 원본 비율로 보인다', async ({ page }) => {
  await loginToHome(page, await createUserByApi());
  await openTab(page, '커뮤니티');
  await page.getByRole('button', { name: '글쓰기' }).locator('visible=true').first().click();
  const chooser = page.waitForEvent('filechooser');
  await press(page, '식단 사진 추가');
  await (await chooser).setFiles('e2e/fixtures/meal.png');
  await field(page, '내용').fill('수정 전 글');
  await expect(page.getByText('게시하기', { exact: true })).toBeVisible();
  await page.waitForTimeout(800);
  await press(page, '게시하기');
  await expect(page).toHaveURL(/\/community$/);
  await page.getByText(/오늘의 한 끼|수정 전 글/).locator('visible=true').first().click();
  await expect(page).toHaveURL(/\/community\/post_/);

  // 사진이 잘리지 않도록 표시 영역의 비율이 원본 비율과 같은지 확인한다.
  const photo = page.locator('img[src*="/uploads/community/"]').locator('visible=true').first();
  await expect(photo).toBeVisible();
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => {
    const box = img.getBoundingClientRect();
    return Math.abs(box.width / box.height - img.naturalWidth / img.naturalHeight) < 0.02;
  })).toBe(true);

  await press(page, '수정');
  await page.getByLabel('게시글 수정').locator('visible=true').first().fill('수정 후 글');
  await press(page, '저장');
  await expect(visible(page, '수정 후 글')).toBeVisible();

  await page.getByPlaceholder('따뜻한 댓글을 남겨 주세요').locator('visible=true').first().fill('처음 댓글');
  await press(page, '등록');
  await expect(visible(page, '처음 댓글')).toBeVisible();
  await page.getByRole('button', { name: '댓글 수정하기' }).locator('visible=true').first().click();
  await page.getByLabel('댓글 수정').locator('visible=true').first().fill('고친 댓글');
  await press(page, '저장');
  await expect(visible(page, '고친 댓글')).toBeVisible();

  await page.reload();
  await expect(visible(page, '수정 후 글')).toBeVisible();
  await expect(visible(page, '고친 댓글')).toBeVisible();
});

test('댓글에 답글을 달면 그 아래에 모이고 함께 삭제된다', async ({ page }) => {
  const text = `답글 테스트 ${Date.now()}`;
  await loginToHome(page, await createUserByApi());
  await writePost(page, text);
  await visible(page, text).click();
  await expect(page).toHaveURL(/\/community\/post_/);

  await page.getByPlaceholder('따뜻한 댓글을 남겨 주세요').locator('visible=true').first().fill('원래 댓글');
  await press(page, '등록');
  await expect(visible(page, '원래 댓글')).toBeVisible();

  await page.getByRole('button', { name: /답글 달기/ }).locator('visible=true').first().click();
  await expect(visible(page, /답글 작성 중/)).toBeVisible();
  await page.getByPlaceholder('답글을 남겨 주세요').locator('visible=true').first().fill('달린 답글');
  await press(page, '등록');
  await expect(visible(page, '달린 답글')).toBeVisible();
  await expect(visible(page, '댓글 2')).toBeVisible();

  await page.reload();
  await expect(visible(page, '달린 답글')).toBeVisible();
  const root = await visible(page, '원래 댓글').boundingBox();
  const reply = await visible(page, '달린 답글').boundingBox();
  expect(reply!.x).toBeGreaterThan(root!.x);
  expect(reply!.y).toBeGreaterThan(root!.y);
  await page.getByRole('button', { name: '댓글 삭제하기' }).locator('visible=true').first().click();
  await expect(page.getByText('달린 답글', { exact: true }).locator('visible=true')).toHaveCount(0);
  await expect(visible(page, '댓글 0')).toBeVisible();
});
