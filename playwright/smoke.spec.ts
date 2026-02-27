import { test, expect } from '@playwright/test';

/**
 * Smoke tests for RecipeScaler.
 *
 * (a) App loads at root URL with no console errors.
 * (b) Base64-encoded recipe URL loads and renders the expected recipe name
 *     and at least one ingredient (default Manhattan recipe from url-scheme.md).
 */

test.describe('RecipeScaler smoke tests', () => {
  test('(a) app loads at root URL with no console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/');
    // The app should redirect to /r and render
    await expect(page).toHaveURL(/\/r/);
    // Wait for Angular to bootstrap
    await page.waitForSelector('app-root');
    // No console errors
    expect(consoleErrors).toEqual([]);
  });

  test('(b) base64 recipe URL loads and renders recipe', async ({ page }) => {
    // Default "Manhattans for two" recipe URL from contracts/url-scheme.md
    const recipeUrl =
      '/r/eyJuYW1lIjoiTWFuaGF0dGFucyBmb3IgdHdvIiwiZGVzY3JpcHRpb24iOiI8cD5TaGFrZSB3aXRoIGljZSBhbmQgc2VydmUgaW4gYSBjaGlsbGVkIGNvdXBlIGdsYXNzLjwvcD48cD5Gcm9tIExpcXVpZCBJbnRlbGxpZ2VuY2UgYnkgRGF2ZSBBcm5vbGQ8L3A+IiwiYmFzZUluZ3JlZGllbnQiOnsibmFtZSI6IlJpdHRlbmhvdXNlIFJ5ZSB3aGlza2V5IiwiZGVzY3JpcHRpb24iOiI1MCUgQUJWIiwibWVhc3VyZSI6MTIwLCJ1bml0T2ZNZWFzdXJlIjoibWwifSwiYWRkaXRpb25hbEluZ3JlZGllbnRzIjpbeyJuYW1lIjoiQ2FycGFubyBBbnRpY2EgRm9ybXVsYSB2ZXJtb3V0aCIsImRlc2NyaXB0aW9uIjoiMTYuNSUgQUJWIiwibWVhc3VyZSI6NTMsInVuaXRPZk1lYXN1cmUiOiJtbCJ9LHsibmFtZSI6IkFuZ29zdHVyYSBiaXR0ZXJzIiwibWVhc3VyZSI6NCwidW5pdE9mTWVhc3VyZSI6ImRhc2hlcyJ9LHsibmFtZSI6IkJyYW5kaWVkIGNoZXJyaWVzIG9yIG9yYW5nZSB0d2lzdHMiLCJtZWFzdXJlIjoyLCJ1bml0T2ZNZWFzdXJlIjoiIn1dLCJudW1iZXJPZlNlcnZlcyI6Mn0=';

    await page.goto(recipeUrl);

    // Recipe name should be rendered
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Manhattans for two');

    // At least one ingredient should be visible
    const ingredientRows = page.locator('tbody tr');
    const count = await ingredientRows.count();
    expect(count).toBeGreaterThanOrEqual(1);

    // Verify base ingredient name appears
    await expect(page.getByText('Rittenhouse Rye whiskey')).toBeVisible();
  });
});
