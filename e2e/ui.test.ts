import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:3000/');
});

test.describe('basic', () => {
  test('render', async ({ page }) => {
    await expect(page.getByText('Yay! Welcome to umi!')).toBeVisible();
  });
});
test.describe('md support', () => {
  test('render', async ({ page }) => {
    await page.goto('http://localhost:3000/about');
    await expect(page.getByText('如何使用 Mongchhi')).toBeVisible();
  });
});

test.describe('404 support', () => {
  test('render', async ({ page }) => {
    await page.goto('http://localhost:3000/404');
    await expect(page.getByText('[404 Layout]')).toBeVisible();
  });
});
