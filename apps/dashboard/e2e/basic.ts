import { test } from '@playwright/test';

test('can launch app', async ({ page }) => {
  await page.goto('/');
});
