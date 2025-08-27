import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');
  
  // Check that the page loads without errors
  await expect(page).toHaveTitle(/Company Management/i);
  
  // Check for main navigation elements
  await expect(page.getByRole('main')).toBeVisible();
});

test('company management interface is accessible', async ({ page }) => {
  await page.goto('/');
  
  // Look for company-related content
  await expect(page.getByText(/company/i)).toBeVisible();
  
  // Check for tabbed interface
  await expect(page.getByRole('tablist')).toBeVisible();
});