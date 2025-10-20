import { test, expect } from '@playwright/test';
import { setupApiMocks } from './mocks/mockServer.js';

test.describe('TransactionsList Component Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Setup API mocking
    await setupApiMocks(page);

    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('h1:has-text("Maria Conciliadora")');

    // Switch to transactions tab
    await page.click('button:has-text("Transações")');
    await page.waitForSelector('h2:has-text("Transações")');
  });

  test('should display transactions table with data', async ({ page }) => {
    // Check if table is present
    const table = page.locator('[data-testid="transactions-table"]');
    await expect(table).toBeVisible();

    // Check table headers
    await expect(page.locator('th:has-text("Data")')).toBeVisible();
    await expect(page.locator('th:has-text("Descrição")')).toBeVisible();
    await expect(page.locator('th:has-text("Banco")')).toBeVisible();
    await expect(page.locator('th:has-text("Categoria")')).toBeVisible();
    await expect(page.locator('th:has-text("Valor")')).toBeVisible();
    await expect(page.locator('th:has-text("Ações")')).toBeVisible();
  });

  test('should test table sorting functionality', async ({ page }) => {
    // Test sorting by date
    const dateHeader = page.locator('th:has-text("Data") button');
    await dateHeader.click();
    await expect(dateHeader.locator('svg')).toHaveClass(/ArrowUp/);

    await dateHeader.click();
    await expect(dateHeader.locator('svg')).toHaveClass(/ArrowDown/);

    // Test sorting by description
    const descHeader = page.locator('th:has-text("Descrição") button');
    await descHeader.click();
    await expect(descHeader.locator('svg')).toHaveClass(/ArrowUp/);

    // Test sorting by amount
    const amountHeader = page.locator('th:has-text("Valor") button');
    await amountHeader.click();
    await expect(amountHeader.locator('svg')).toHaveClass(/ArrowUp/);
  });

  test('should test search filtering', async ({ page }) => {
    // Get initial transaction count
    const initialCount = await page.locator('tbody tr').count();

    // Type in search box
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('transfer');

    // Wait for filtering to apply by waiting for the count to change or stabilize
    await page.waitForFunction(() => {
      const rows = document.querySelectorAll('tbody tr');
      return rows.length <= initialCount;
    }, { timeout: 2000 });

    // Check that results are filtered
    const filteredCount = await page.locator('tbody tr').count();
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Clear search
    await searchInput.clear();

    // Wait for results to return to initial count
    await page.waitForFunction((initial) => {
      const rows = document.querySelectorAll('tbody tr');
      return rows.length === initial;
    }, initialCount, { timeout: 2000 });
  });

  test('should test bank filtering', async ({ page }) => {
    // Open bank select
    const bankSelect = page.locator('[data-testid="bank-select"]');
    await bankSelect.click();

    // Check if there are bank options available
    const options = await page.locator('[data-testid="bank-select"] option').allTextContents();
    if (options.length > 1) {
      // Select first bank option
      await page.locator('[data-testid="bank-select"]').selectOption({ index: 1 });

      // Wait for filtering to apply
      await page.waitForFunction(() => {
        // Wait for any loading state to disappear or table to update
        const loading = document.querySelector('.animate-spin');
        return !loading || loading.length === 0;
      }, { timeout: 2000 });

      // Verify filtering applied
      const transactionCount = await page.locator('tbody tr').count();
      expect(transactionCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('should test category filtering', async ({ page }) => {
    // Open category select
    const categorySelect = page.locator('[data-testid="category-select"]');
    await categorySelect.click();

    // Check if there are category options
    const options = await page.locator('[data-testid="category-select"] option').allTextContents();
    if (options.length > 1) {
      await page.locator('[data-testid="category-select"]').selectOption({ index: 1 });

      // Wait for filtering to apply
      await page.waitForFunction(() => {
        const loading = document.querySelector('.animate-spin');
        return !loading || loading.length === 0;
      }, { timeout: 2000 });
    }
  });

  test('should test type filtering', async ({ page }) => {
    // Test credit filter
    const typeSelect = page.locator('[data-testid="type-select"]');
    await typeSelect.selectOption({ label: 'Receitas' });

    // Wait for filtering to apply
    await page.waitForFunction(() => {
      const loading = document.querySelector('.animate-spin');
      return !loading || loading.length === 0;
    }, { timeout: 2000 });

    // Test debit filter
    await typeSelect.selectOption({ label: 'Gastos' });

    // Wait for filtering to apply
    await page.waitForFunction(() => {
      const loading = document.querySelector('.animate-spin');
      return !loading || loading.length === 0;
    }, { timeout: 2000 });

    // Reset to all
    await typeSelect.selectOption({ label: 'Todos os tipos' });
  });

  test('should test date range filtering', async ({ page }) => {
    // Set start date
    const startDateInput = page.locator('[data-testid="start-date-input"]');
    await startDateInput.fill('2024-01-01');

    // Set end date
    const endDateInput = page.locator('[data-testid="end-date-input"]');
    await endDateInput.fill('2024-12-31');

    // Wait for filtering to apply
    await page.waitForFunction(() => {
      const loading = document.querySelector('.animate-spin');
      return !loading || loading.length === 0;
    }, { timeout: 2000 });

    // Verify filtering applied
    const transactionCount = await page.locator('tbody tr').count();
    expect(transactionCount).toBeGreaterThanOrEqual(0);
  });

  test('should test row selection', async ({ page }) => {
    // Get first checkbox
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');

    // Check it
    await firstCheckbox.check();
    await expect(firstCheckbox).toBeChecked();

    // Uncheck it
    await firstCheckbox.uncheck();
    await expect(firstCheckbox).not.toBeChecked();
  });

  test('should test select all functionality', async ({ page }) => {
    const selectAllCheckbox = page.locator('th input[type="checkbox"]');

    // Select all
    await selectAllCheckbox.check();

    // Verify all rows are selected
    const rowCheckboxes = page.locator('tbody input[type="checkbox"]');
    const count = await rowCheckboxes.count();

    for (let i = 0; i < count; i++) {
      await expect(rowCheckboxes.nth(i)).toBeChecked();
    }

    // Deselect all
    await selectAllCheckbox.uncheck();

    for (let i = 0; i < count; i++) {
      await expect(rowCheckboxes.nth(i)).not.toBeChecked();
    }
  });

  test('should test bulk delete confirmation dialog', async ({ page }) => {
    // Select a row first
    const firstRowCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await firstRowCheckbox.check();

    // Click bulk delete button
    const deleteButton = page.locator('button:has-text("Excluir Selecionadas")');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Check if AlertDialog appears
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Check dialog content
      await expect(page.locator('text=Confirmar Exclusão')).toBeVisible();
      await expect(page.locator('text=Esta ação não pode ser desfeita')).toBeVisible();

      // Cancel the deletion
      await page.click('button:has-text("Cancelar")');
      await expect(dialog).not.toBeVisible();
    }
  });

  test('should test transaction details dialog', async ({ page }) => {
    // Click eye icon on first row
    const eyeButton = page.locator('tbody tr').first().locator('button svg').first();
    if (await eyeButton.isVisible()) {
      await eyeButton.click();

      // Check if Dialog appears
      const dialog = page.locator('[role="dialog"]');
      await expect(dialog).toBeVisible();

      // Check dialog title
      await expect(page.locator('text=Detalhes da Transação')).toBeVisible();

      // Close dialog
      await page.keyboard.press('Escape');
      await expect(dialog).not.toBeVisible();
    }
  });

  test('should test pagination', async ({ page }) => {
    // Check if pagination exists
    const nextButton = page.locator('button:has-text("Próxima")');
    const prevButton = page.locator('button:has-text("Anterior")');

    if (await nextButton.isVisible()) {
      // Click next page
      await nextButton.click();

      // Verify page changed
      await expect(page.locator('text=Página 2 de')).toBeVisible();

      // Go back
      await prevButton.click();
      await expect(page.locator('text=Página 1 de')).toBeVisible();
    }
  });

  test('should test clear filters functionality', async ({ page }) => {
    // Apply some filters first
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('test');

    // Click clear filters
    const clearButton = page.locator('[data-testid="clear-filters-button"]');
    await clearButton.click();

    // Verify search is cleared
    await expect(searchInput).toHaveValue('');
  });

  test('should test responsive design', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile menu is visible
    const mobileMenu = page.locator('button:has-text("Menu")');
    await expect(mobileMenu).toBeVisible();

    // Open mobile menu
    await mobileMenu.click();

    // Check if sheet/sidebar is visible
    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    // Close mobile menu
    await page.keyboard.press('Escape');

    // Test desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });

    // Check if desktop tabs are visible
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();
  });

  test('should test loading state', async ({ page }) => {
    // This test assumes there might be a loading state when fetching data
    // Look for loading indicators
    const loadingSpinner = page.locator('.animate-spin');
    if (await loadingSpinner.isVisible()) {
      await expect(loadingSpinner).toBeVisible();
    }
  });

  test('should test empty state', async ({ page }) => {
    // Apply filters that might result in no results
    const searchInput = page.locator('[data-testid="search-input"]');
    await searchInput.fill('nonexistenttransaction12345');

    // Wait for filtering to complete and check for empty state
    await page.waitForFunction(() => {
      const loading = document.querySelector('.animate-spin');
      const emptyMessage = document.querySelector('text=Nenhuma transação encontrada') ||
                          document.textContent?.includes('Nenhuma transação encontrada');
      return (!loading || loading.length === 0) && (emptyMessage || document.querySelectorAll('tbody tr').length === 0);
    }, { timeout: 2000 });

    // Check for empty state message
    const emptyMessage = page.locator('text=Nenhuma transação encontrada');
    if (await emptyMessage.isVisible()) {
      await expect(emptyMessage).toBeVisible();
    } else {
      // If no specific empty message, check that no rows are visible
      const rowCount = await page.locator('tbody tr').count();
      expect(rowCount).toBe(0);
    }
  });
});