import { expect, test } from '@playwright/test';

test('loads default recipe and scales ingredients', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/r\//);
  await expect(page.getByRole('heading', { name: 'Manhattans for two' })).toBeVisible();

  const ingredientInputs = page.locator('input[id*="-ingredient-"]');
  await expect(ingredientInputs).toHaveCount(4);

  const firstInput = ingredientInputs.nth(0);
  const secondInput = ingredientInputs.nth(1);

  await expect(firstInput).toHaveValue('120');
  await expect(secondInput).toHaveValue('53');

  await firstInput.fill('240');
  await firstInput.blur();

  await expect(secondInput).toHaveValue('106');
});
