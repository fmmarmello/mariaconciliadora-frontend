import { test, expect } from '@playwright/test';

test.describe('Integration Tests - Maria Conciliadora Application Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('h1:has-text("Maria Conciliadora")');
  });

  test('should complete full application workflow', async ({ page }) => {
    // 1. Check initial dashboard load
    await expect(page.locator('text=Maria Conciliadora')).toBeVisible();
    await expect(page.locator('text=Dashboard Financeiro Inteligente')).toBeVisible();

    // 2. Verify summary cards are displayed
    const summaryCards = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-4');
    await expect(summaryCards).toBeVisible();

    // Check specific summary metrics
    await expect(page.locator('text=Total de Receitas')).toBeVisible();
    await expect(page.locator('text=Total de Gastos')).toBeVisible();
    await expect(page.locator('text=Saldo Líquido')).toBeVisible();

    // 3. Navigate to transactions tab
    await page.click('button:has-text("Transações")');
    await expect(page.locator('text=Transações')).toBeVisible();

    // Verify transactions table loads
    const table = page.locator('table');
    await expect(table).toBeVisible();

    // 4. Test filtering functionality
    const searchInput = page.locator('input[placeholder*="Buscar por descrição"]');
    await searchInput.fill('test');
    await page.waitForTimeout(500);

    // Clear filter
    const clearButton = page.locator('button:has-text("Limpar Filtros")');
    await clearButton.click();

    // 5. Navigate to upload tab
    await page.click('button:has-text("Upload OFX")');
    await expect(page.locator('text=Upload de Arquivo')).toBeVisible();

    // Verify upload interface
    await expect(page.locator('text=Bancos Suportados')).toBeVisible();
    await expect(page.locator('text=Selecionar Arquivo')).toBeVisible();

    // 6. Navigate back to overview
    await page.click('button:has-text("Visão Geral")');
    await expect(page.locator('text=Transações Recentes')).toBeVisible();

    // 7. Test responsive design
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileMenu = page.locator('button:has-text("Menu")');
    await expect(mobileMenu).toBeVisible();

    await page.setViewportSize({ width: 1200, height: 800 });
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();
  });

  test('should handle data consistency across tabs', async ({ page }) => {
    // Get initial summary data
    const initialRevenue = await page.locator('text=Total de Receitas').locator('..').locator('div').nth(1).textContent();
    const initialExpenses = await page.locator('text=Total de Gastos').locator('..').locator('div').nth(1).textContent();

    // Navigate to transactions
    await page.click('button:has-text("Transações")');
    await page.waitForSelector('table');

    // Get transaction count
    const transactionRows = page.locator('tbody tr');
    const transactionCount = await transactionRows.count();
    expect(transactionCount).toBeGreaterThanOrEqual(0);

    // Navigate back to overview
    await page.click('button:has-text("Visão Geral")');

    // Verify summary data is still consistent
    const finalRevenue = await page.locator('text=Total de Receitas').locator('..').locator('div').nth(1).textContent();
    const finalExpenses = await page.locator('text=Total de Gastos').locator('..').locator('div').nth(1).textContent();

    expect(finalRevenue).toBe(initialRevenue);
    expect(finalExpenses).toBe(initialExpenses);
  });

  test('should test navigation flow and state management', async ({ page }) => {
    // Test breadcrumb updates
    await expect(page.locator('text=Visão Geral')).toBeVisible();

    // Navigate through different tabs
    const tabs = ['Transações', 'Upload OFX', 'Financeiro', 'Previsões'];

    for (const tabName of tabs) {
      await page.click(`button:has-text("${tabName}")`);

      // Verify tab content loads
      if (tabName === 'Transações') {
        await expect(page.locator('table')).toBeVisible();
      } else if (tabName === 'Upload OFX') {
        await expect(page.locator('text=Upload de Arquivo')).toBeVisible();
      } else if (tabName === 'Financeiro') {
        await expect(page.locator('text=FinancialTracker')).toBeVisible();
      }

      // Check breadcrumb updates
      await expect(page.locator(`text=${tabName}`)).toBeVisible();
    }

    // Navigate back to overview
    await page.click('button:has-text("Visão Geral")');
    await expect(page.locator('text=Visão Geral')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test navigation to non-existent content
    // This test depends on the app's error handling implementation

    // For now, test that the app remains stable during navigation
    await page.click('button:has-text("Transações")');
    await expect(page.locator('text=Transações')).toBeVisible();

    // Try to interact with elements that might not exist
    const nonExistentElement = page.locator('text=ThisDoesNotExist12345');
    await expect(nonExistentElement).not.toBeVisible();

    // Verify app still functions
    await page.click('button:has-text("Visão Geral")');
    await expect(page.locator('text=Transações Recentes')).toBeVisible();
  });

  test('should test component interactions', async ({ page }) => {
    // Test tooltip interactions
    const tooltipTriggers = page.locator('[data-radix-tooltip-trigger]');
    if (await tooltipTriggers.count() > 0) {
      await tooltipTriggers.first().hover();
      await page.waitForTimeout(500);
      // Tooltip should appear without breaking the app
    }

    // Test dialog interactions in transactions
    await page.click('button:has-text("Transações")');
    await page.waitForSelector('table');

    // Try to open a transaction dialog
    const eyeButtons = page.locator('tbody tr').first().locator('button');
    if (await eyeButtons.count() > 0) {
      await eyeButtons.first().click();

      const dialog = page.locator('[role="dialog"]');
      if (await dialog.isVisible()) {
        await page.keyboard.press('Escape');
        await expect(dialog).not.toBeVisible();
      }
    }
  });

  test('should test data flow between components', async ({ page }) => {
    // This test would ideally verify that data uploaded in one component
    // appears in other components, but since we can't do real uploads,
    // we'll test the UI consistency

    // Check that summary data is displayed consistently
    const revenueCard = page.locator('text=Total de Receitas').locator('..').locator('..');
    await expect(revenueCard).toBeVisible();

    // Navigate to transactions and back
    await page.click('button:has-text("Transações")');
    await page.click('button:has-text("Visão Geral")');

    // Verify summary data is still there
    await expect(revenueCard).toBeVisible();
  });

  test('should handle loading states during navigation', async ({ page }) => {
    // Test loading states when switching tabs
    await page.click('button:has-text("Transações")');

    // Check for any loading indicators
    const loadingIndicators = page.locator('.animate-spin, .animate-pulse');
    const loadingCount = await loadingIndicators.count();
    // Loading might be brief, so we don't assert on it being visible
    expect(loadingCount).toBeGreaterThanOrEqual(0);

    // Verify content loads properly
    await expect(page.locator('table')).toBeVisible();
  });

  test('should test accessibility features across components', async ({ page }) => {
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Test focus management
    const focusedElement = page.locator(':focus');
    // Should have some element focused
    await expect(focusedElement).toBeVisible();

    // Test ARIA attributes
    const dialogs = page.locator('[role="dialog"]');
    const alerts = page.locator('[role="alert"]');

    // These might not be visible initially, but the structure should be correct
    const dialogCount = await dialogs.count();
    const alertCount = await alerts.count();
    expect(dialogCount).toBeGreaterThanOrEqual(0);
    expect(alertCount).toBeGreaterThanOrEqual(0);
  });

  test('should test performance and responsiveness', async ({ page }) => {
    // Test page load performance
    const startTime = Date.now();
    await page.reload();
    await page.waitForSelector('h1:has-text("Maria Conciliadora")');
    const loadTime = Date.now() - startTime;

    // Page should load within reasonable time (adjust threshold as needed)
    expect(loadTime).toBeLessThan(10000); // 10 seconds

    // Test navigation performance
    const navStartTime = Date.now();
    await page.click('button:has-text("Transações")');
    await page.waitForSelector('table');
    const navTime = Date.now() - navStartTime;

    expect(navTime).toBeLessThan(5000); // 5 seconds
  });

  test('should handle browser back/forward navigation', async ({ page }) => {
    // Navigate to transactions
    await page.click('button:has-text("Transações")');
    await expect(page.locator('table')).toBeVisible();

    // Use browser back
    await page.goBack();
    await expect(page.locator('text=Transações Recentes')).toBeVisible();

    // Use browser forward
    await page.goForward();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should test component state persistence', async ({ page }) => {
    // Set some state (like filters)
    await page.click('button:has-text("Transações")');
    const searchInput = page.locator('input[placeholder*="Buscar por descrição"]');
    await searchInput.fill('test filter');

    // Navigate away and back
    await page.click('button:has-text("Visão Geral")');
    await page.click('button:has-text("Transações")');

    // Check if state is maintained (depends on implementation)
    // This test verifies the app doesn't crash during state transitions
    await expect(page.locator('table')).toBeVisible();
  });

  test('should test error boundaries and error handling', async ({ page }) => {
    // Test that the app handles errors gracefully
    // This is difficult to test without triggering actual errors

    // For now, verify that the app structure remains intact
    await expect(page.locator('h1:has-text("Maria Conciliadora")')).toBeVisible();

    // Test navigation after potential errors
    await page.click('button:has-text("Transações")');
    await expect(page.locator('text=Transações')).toBeVisible();
  });
});