import { expect, Page, test } from '@playwright/test';
import { createUserByApi, field, loginToHome, openTab, press, visible } from './helpers';

async function writePost(page: Page, text: string) {
  await openTab(page, '커뮤니티');
  // 하단 탭에도 같은 글자가 있어 화면의 첫 번째 버튼을 누른다.
  await page.getByText('＋', { exact: true }).locator('visible=true').first().click();
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
  await press(other, '댓글 등록');
  await expect(visible(other, '맛있어 보여요')).toBeVisible();
  await context.close();
});

test('내 글을 삭제할 수 있다', async ({ page }) => {
  const text = `삭제할 글 ${Date.now()}`;
  await loginToHome(page, await createUserByApi());
  await writePost(page, text);
  await visible(page, text).click();
  await expect(page).toHaveURL(/\/community\/post_/);

  page.on('dialog', (dialog) => dialog.accept());
  await press(page, '삭제');
  await expect(page).not.toHaveURL(/\/community\/post_/);
  await expect(visible(page, '최근 게시물')).toBeVisible();
  await expect(page.getByText(text, { exact: true }).locator('visible=true')).toHaveCount(0);
});
