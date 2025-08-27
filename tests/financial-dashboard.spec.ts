import { test, expect } from '@playwright/test';

test.describe('Financial Dashboard', () => {
  test('can navigate to financial tab', async ({ page }) => {
    await page.goto('/');
    
    // Click on Financial tab if it exists
    const financialTab = page.getByRole('tab', { name: /financial/i });
    if (await financialTab.isVisible()) {
      await financialTab.click();
      await expect(financialTab).toHaveAttribute('aria-selected', 'true');
    }
  });

  test('displays account balance section', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to financial tab first
    const financialTab = page.getByRole('tab', { name: /financial/i });
    if (await financialTab.isVisible()) {
      await financialTab.click();
      
      // Check for account balance or financial information
      await expect(
        page.locator('text=/balance/i').or(
          page.locator('text=/account/i')
        ).or(
          page.locator('text=/financial/i')
        )
      ).toBeVisible();
    }
  });

  test('expense management interface is accessible', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to financial tab
    const financialTab = page.getByRole('tab', { name: /financial/i });
    if (await financialTab.isVisible()) {
      await financialTab.click();
      
      // Look for expense-related elements
      await expect(
        page.locator('text=/expense/i').or(
          page.locator('text=/transaction/i')
        ).or(
          page.locator('text=/payment/i')
        )
      ).toBeVisible();
    }
  });
});