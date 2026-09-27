import { expect, test } from '@playwright/test';

test('main endpoint is reachable', async ({ request }) => {
  test.skip(!process.env.BASE_URL, 'BASE_URL is required for smoke tests');
  const response = await request.get('/');
  expect(response.ok()).toBeTruthy();
});
