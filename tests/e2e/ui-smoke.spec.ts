import { test, expect } from '@playwright/test';

test('首页到定制页加载（Smoke）', async ({ page }) => {
  await page.goto('/');
  // 进入任意一个产品的定制页
  await page.getByText('选择这款并开始定制').first().click();
  await expect(page).toHaveURL(/\/customize\/(\d+)/);
  // 确认页面核心元素出现
  await expect(page.getByText(/下一步/)).toBeVisible();
});