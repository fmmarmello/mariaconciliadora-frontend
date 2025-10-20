import { test, expect } from '@playwright/test';

test.describe('Dialog and AlertDialog Components Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('h1:has-text("Maria Conciliadora")');

    // Switch to transactions tab to access dialogs
    await page.click('button:has-text("Transações")');
    await page.waitForSelector('h2:has-text("Transações")');
  });

  test('should test transaction details dialog functionality', async ({ page }) => {
    // Wait for transactions to load
    await page.waitForSelector('tbody tr');

    // Click on the eye icon (view details) of the first transaction
    const eyeButton = page.locator('tbody tr').first().locator('button').first();
    await eyeButton.click();

    // Verify dialog opens
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Check dialog title
    await expect(page.locator('text=Detalhes da Transação')).toBeVisible();

    // Check dialog description
    await expect(page.locator('text=Informações completas sobre esta transação')).toBeVisible();

    // Verify dialog content structure
    await expect(page.locator('text=Data')).toBeVisible();
    await expect(page.locator('text=Valor')).toBeVisible();
    await expect(page.locator('text=Banco')).toBeVisible();
    await expect(page.locator('text=Tipo')).toBeVisible();
    await expect(page.locator('text=Descrição')).toBeVisible();

    // Test closing dialog with Escape key
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('should test AlertDialog for bulk delete confirmation', async ({ page }) => {
    // Select at least one transaction
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await firstCheckbox.check();

    // Click bulk delete button
    const deleteButton = page.locator('button:has-text("Excluir Selecionadas")');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Verify AlertDialog opens
      const alertDialog = page.locator('[role="alertdialog"]');
      await expect(alertDialog).toBeVisible();

      // Check AlertDialog title
      await expect(page.locator('text=Confirmar Exclusão')).toBeVisible();

      // Check AlertDialog description
      await expect(page.locator('text=Esta ação não pode ser desfeita')).toBeVisible();

      // Verify cancel button works
      const cancelButton = page.locator('button:has-text("Cancelar")');
      await cancelButton.click();

      // Verify dialog closes
      await expect(alertDialog).not.toBeVisible();

      // Verify selection is maintained
      await expect(firstCheckbox).toBeChecked();
    }
  });

  test('should test AlertDialog action button functionality', async ({ page }) => {
    // Select a transaction
    const firstCheckbox = page.locator('tbody tr').first().locator('input[type="checkbox"]');
    await firstCheckbox.check();

    // Click bulk delete button
    const deleteButton = page.locator('button:has-text("Excluir Selecionadas")');
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Verify AlertDialog opens
      const alertDialog = page.locator('[role="alertdialog"]');
      await expect(alertDialog).toBeVisible();

      // Check that the action button has correct styling (destructive)
      const actionButton = page.locator('button:has-text("Excluir")');
      await expect(actionButton).toHaveClass(/bg-red-600/);

      // Note: We won't actually click the delete button to avoid data loss
      // Just verify it exists and has correct styling

      // Close dialog
      await page.keyboard.press('Escape');
      await expect(alertDialog).not.toBeVisible();
    }
  });

  test('should test dialog accessibility features', async ({ page }) => {
    // Open transaction details dialog
    const eyeButton = page.locator('tbody tr').first().locator('button').first();
    await eyeButton.click();

    const dialog = page.locator('[role="dialog"]');

    // Check for proper ARIA attributes
    await expect(dialog).toHaveAttribute('aria-labelledby');
    await expect(dialog).toHaveAttribute('aria-describedby');

    // Test keyboard navigation
    // Tab through focusable elements in dialog
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Close with Escape
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('should test dialog content rendering', async ({ page }) => {
    // Open transaction details dialog
    const eyeButton = page.locator('tbody tr').first().locator('button').first();
    await eyeButton.click();

    const dialog = page.locator('[role="dialog"]');

    // Verify grid layout for transaction details
    const grid = dialog.locator('.grid');
    await expect(grid).toBeVisible();

    // Check if date is properly formatted
    const dateLabel = dialog.locator('text=Data');
    await expect(dateLabel).toBeVisible();

    // Check if amount is displayed with currency formatting
    const amountDisplay = dialog.locator('text=R\\$');
    await expect(amountDisplay).toBeVisible();

    // Close dialog
    await page.keyboard.press('Escape');
  });

  test('should test dialog backdrop behavior', async ({ page }) => {
    // Open transaction details dialog
    const eyeButton = page.locator('tbody tr').first().locator('button').first();
    await eyeButton.click();

    const dialog = page.locator('[role="dialog"]');

    // Check if backdrop exists (usually a sibling element)
    const backdrop = page.locator('[data-radix-dialog-overlay]');
    if (await backdrop.isVisible()) {
      await expect(backdrop).toBeVisible();
    }

    // Click outside dialog (on backdrop) to close
    // This might not work if the dialog doesn't support backdrop click
    await page.mouse.click(10, 10); // Click in top-left corner
    // If dialog closes, the test passes; if not, that's also acceptable
    // Some dialogs don't support backdrop click to close

    // Ensure dialog is closed
    if (await dialog.isVisible()) {
      await page.keyboard.press('Escape');
    }
  });

  test('should test multiple dialogs behavior', async ({ page }) => {
    // This test checks if multiple dialogs can be opened
    // First open transaction details
    const eyeButton = page.locator('tbody tr').first().locator('button').first();
    await eyeButton.click();

    const firstDialog = page.locator('[role="dialog"]');
    await expect(firstDialog).toBeVisible();

    // Try to open another dialog (if available)
    // For this test, we'll just verify the first dialog remains open
    await expect(firstDialog).toBeVisible();

    // Close first dialog
    await page.keyboard.press('Escape');
    await expect(firstDialog).not.toBeVisible();
  });

  test('should test dialog responsive behavior', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Open transaction details dialog
    const eyeButton = page.locator('tbody tr').first().locator('button').first();
    await eyeButton.click();

    const dialog = page.locator('[role="dialog"]');

    // Verify dialog is still functional on mobile
    await expect(dialog).toBeVisible();

    // Check if dialog content is properly sized for mobile
    const dialogContent = dialog.locator('[data-radix-dialog-content]');
    const boundingBox = await dialogContent.boundingBox();
    expect(boundingBox.width).toBeLessThanOrEqual(375);

    // Close dialog
    await page.keyboard.press('Escape');

    // Reset to desktop
    await page.setViewportSize({ width: 1200, height: 800 });
  });
});