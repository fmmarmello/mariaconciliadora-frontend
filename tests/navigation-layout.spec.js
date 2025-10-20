import { test, expect } from '@playwright/test';

test.describe('Navigation and Layout Components Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await page.waitForSelector('h1:has-text("Maria Conciliadora")');
  });

  test('should display header with tooltips', async ({ page }) => {
    // Check header elements
    await expect(page.locator('text=Maria Conciliadora')).toBeVisible();
    await expect(page.locator('text=Dashboard Financeiro Inteligente')).toBeVisible();

    // Check brain icon with tooltip
    const brainIcon = page.locator('[data-radix-tooltip-trigger]');
    await expect(brainIcon).toBeVisible();

    // Hover over brain icon to trigger tooltip
    await brainIcon.hover();

    // Check if tooltip appears (this might require waiting)
    await page.waitForTimeout(500);
    // Note: Tooltip content verification might need adjustment based on implementation
  });

  test('should display status badges with tooltips', async ({ page }) => {
    // Check IA Ativa badge
    const iaBadge = page.locator('text=IA Ativa');
    await expect(iaBadge).toBeVisible();

    // Check if tooltip trigger exists for the badge
    const badgeTooltip = iaBadge.locator('..').locator('[data-radix-tooltip-trigger]');
    if (await badgeTooltip.isVisible()) {
      await badgeTooltip.hover();
      await page.waitForTimeout(500);
    }
  });

  test('should display breadcrumb navigation', async ({ page }) => {
    // Check breadcrumb elements
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=/')).toBeVisible();

    // Check current page in breadcrumb
    await expect(page.locator('text=Visão Geral')).toBeVisible();
  });

  test('should update breadcrumb when navigating tabs', async ({ page }) => {
    // Initial breadcrumb should show "Visão Geral"
    await expect(page.locator('text=Visão Geral')).toBeVisible();

    // Navigate to transactions tab
    await page.click('button:has-text("Transações")');
    await expect(page.locator('text=Transações')).toBeVisible();

    // Navigate to upload tab
    await page.click('button:has-text("Upload OFX")');
    await expect(page.locator('text=Upload OFX')).toBeVisible();
  });

  test('should display tooltips on summary cards', async ({ page }) => {
    // Check if summary cards have tooltips
    const cards = page.locator('[data-radix-tooltip-trigger]');
    const cardCount = await cards.count();

    // At least some cards should have tooltips
    expect(cardCount).toBeGreaterThan(0);

    // Test hovering over first card
    if (cardCount > 0) {
      await cards.first().hover();
      await page.waitForTimeout(500);
    }
  });

  test('should handle mobile navigation with Sheet component', async ({ page }) => {
    // Test on mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check if mobile menu button is visible
    const mobileMenuButton = page.locator('button:has-text("Menu")');
    await expect(mobileMenuButton).toBeVisible();

    // Click mobile menu
    await mobileMenuButton.click();

    // Check if Sheet/Drawer opens
    const sheet = page.locator('[role="dialog"]');
    await expect(sheet).toBeVisible();

    // Check navigation options in mobile menu
    await expect(page.locator('text=Navegação')).toBeVisible();
    await expect(page.locator('text=Visão Geral')).toBeVisible();
    await expect(page.locator('text=Transações')).toBeVisible();

    // Close mobile menu
    await page.keyboard.press('Escape');
    await expect(sheet).not.toBeVisible();

    // Reset to desktop
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('should display desktop tab navigation', async ({ page }) => {
    // Test on desktop viewport
    await page.setViewportSize({ width: 1200, height: 800 });

    // Check if desktop tabs are visible
    const tabsList = page.locator('[role="tablist"]');
    await expect(tabsList).toBeVisible();

    // Check individual tabs
    await expect(page.locator('button:has-text("Visão Geral")')).toBeVisible();
    await expect(page.locator('button:has-text("Upload OFX")')).toBeVisible();
    await expect(page.locator('button:has-text("Transações")')).toBeVisible();
    await expect(page.locator('button:has-text("Financeiro")')).toBeVisible();
  });

  test('should test tab navigation functionality', async ({ page }) => {
    // Click on different tabs and verify content changes
    const tabs = [
      { name: 'Transações', content: 'Transações' },
      { name: 'Upload OFX', content: 'Upload de Arquivo' },
      { name: 'Financeiro', content: 'FinancialTracker' },
      { name: 'Visão Geral', content: 'Transações Recentes' }
    ];

    for (const tab of tabs) {
      await page.click(`button:has-text("${tab.name}")`);
      await expect(page.locator(`text=${tab.content}`)).toBeVisible();
    }
  });

  test('should display skeleton loading states', async ({ page }) => {
    // Reload page to see loading state
    await page.reload();

    // Check for skeleton elements during loading
    const skeletons = page.locator('.animate-pulse, [class*="skeleton"]');
    const skeletonCount = await skeletons.count();

    // Should have skeleton elements during loading
    expect(skeletonCount).toBeGreaterThan(0);
  });

  test('should handle tooltip accessibility', async ({ page }) => {
    // Check tooltip triggers have proper attributes
    const tooltipTriggers = page.locator('[data-radix-tooltip-trigger]');
    const triggerCount = await tooltipTriggers.count();

    if (triggerCount > 0) {
      // Check first tooltip trigger
      const firstTrigger = tooltipTriggers.first();
      await expect(firstTrigger).toBeVisible();

      // Test keyboard focus
      await firstTrigger.focus();
      await expect(firstTrigger).toBeFocused();
    }
  });

  test('should test responsive breadcrumb behavior', async ({ page }) => {
    // Test on mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Breadcrumb should still be visible on mobile
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // Test on desktop
    await page.setViewportSize({ width: 1200, height: 800 });

    // Breadcrumb should be properly formatted on desktop
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=/')).toBeVisible();
  });

  test('should test navigation state persistence', async ({ page }) => {
    // Navigate to a specific tab
    await page.click('button:has-text("Transações")');
    await expect(page.locator('text=Transações')).toBeVisible();

    // Refresh page
    await page.reload();

    // Should maintain navigation state or return to default
    // This depends on the app's implementation
    await page.waitForSelector('h1:has-text("Maria Conciliadora")');
  });

  test('should handle tooltip content rendering', async ({ page }) => {
    // Find tooltip triggers
    const tooltipTriggers = page.locator('[data-radix-tooltip-trigger]');
    const triggerCount = await tooltipTriggers.count();

    if (triggerCount > 0) {
      // Hover over first tooltip trigger
      await tooltipTriggers.first().hover();

      // Wait for tooltip to appear
      await page.waitForTimeout(1000);

      // Check if tooltip content is rendered
      // Note: The actual tooltip content verification depends on the tooltip implementation
    }
  });

  test('should test sheet component accessibility', async ({ page }) => {
    // Test mobile navigation
    await page.setViewportSize({ width: 375, height: 667 });

    const mobileMenuButton = page.locator('button:has-text("Menu")');
    await mobileMenuButton.click();

    const sheet = page.locator('[role="dialog"]');

    // Check accessibility attributes
    await expect(sheet).toHaveAttribute('aria-labelledby');
    await expect(sheet).toHaveAttribute('aria-describedby');

    // Test keyboard navigation in sheet
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Close sheet
    await page.keyboard.press('Escape');
    await expect(sheet).not.toBeVisible();

    // Reset viewport
    await page.setViewportSize({ width: 1200, height: 800 });
  });

  test('should test loading skeleton structure', async ({ page }) => {
    // Reload to see loading state
    await page.reload();

    // Check skeleton structure matches expected layout
    const headerSkeleton = page.locator('header .animate-pulse');
    const mainSkeleton = page.locator('main .animate-pulse');

    // Should have skeletons in header and main areas
    const totalSkeletons = await page.locator('.animate-pulse').count();
    expect(totalSkeletons).toBeGreaterThan(5); // Reasonable number of skeleton elements

    // Verify skeleton elements exist
    await expect(headerSkeleton.first()).toBeVisible();
    await expect(mainSkeleton.first()).toBeVisible();
  });

  test('should handle navigation error states', async ({ page }) => {
    // Test navigation to non-existent tab (if any)
    // This test depends on the app's error handling

    // For now, verify that existing navigation works
    await page.click('button:has-text("Visão Geral")');
    await expect(page.locator('text=Transações Recentes')).toBeVisible();
  });
});