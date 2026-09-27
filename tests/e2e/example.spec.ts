import { expect, test } from '@playwright/test';

test('application responds in staging', async ({ page }) => {
  test.skip(!process.env.BASE_URL, 'BASE_URL is required for E2E tests');
  const response = await page.goto('/');
  expect(response?.ok()).toBeTruthy();
});
