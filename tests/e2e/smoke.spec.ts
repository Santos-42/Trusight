import { expect, test } from '@playwright/test';

// Mockup-first: tanpa backend, tanpa API key.
test('landing → buat order mockup', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Transparency You Can Trust')).toBeVisible();
  await page.goto('/app/new-inspection');
  await expect(page.getByText('NEW INSPECTION')).toBeVisible();
});
