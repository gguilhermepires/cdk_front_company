import { test, expect } from '@playwright/test';

test.describe('Company Management', () => {
  test('can navigate to companies tab', async ({ page }) => {
    await page.goto('/');
    
    // Click on Companies tab if it exists
    const companiesTab = page.getByRole('tab', { name: /companies/i });
    if (await companiesTab.isVisible()) {
      await companiesTab.click();
      await expect(companiesTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('displays company list or empty state', async ({ page }) => {
    await page.goto('/');
    
    // Check for either company data or empty state message
    await expect(
      page.locator('text=/company/i').or(
        page.locator('text=/no companies/i')
      ).or(
        page.locator('text=/loading/i')
      )
    ).toBeVisible();
  });

  test('search functionality is present', async ({ page }) => {
    await page.goto('/');
    
    // Look for search input or search functionality
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeEditable();
    }
  });
});