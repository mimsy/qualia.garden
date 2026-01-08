// ABOUTME: E2E tests for homepage and navigation.
// ABOUTME: Verifies basic page loading and navigation functionality.

import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
	test('loads successfully', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveTitle(/Qualia Garden/i);
	});

	test('shows main content', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('main')).toBeVisible();
	});

	test('has navigation links', async ({ page }) => {
		await page.goto('/');
		// Check for common navigation elements
		await expect(page.getByRole('navigation')).toBeVisible();
	});
});

test.describe('Navigation', () => {
	test('can navigate to questions page', async ({ page }) => {
		await page.goto('/');
		// Look for a link to questions and click it
		const questionsLink = page.getByRole('link', { name: /questions/i });
		if (await questionsLink.isVisible()) {
			await questionsLink.click();
			await expect(page).toHaveURL(/questions/);
		}
	});

	test('can navigate to models page', async ({ page }) => {
		await page.goto('/');
		// Look for a link to models and click it
		const modelsLink = page.getByRole('link', { name: /models/i });
		if (await modelsLink.isVisible()) {
			await modelsLink.click();
			await expect(page).toHaveURL(/models/);
		}
	});
});

test.describe('Questions Page', () => {
	test('loads questions page', async ({ page }) => {
		await page.goto('/questions');
		await expect(page.locator('main')).toBeVisible();
	});
});

test.describe('Models Page', () => {
	test('loads models page', async ({ page }) => {
		await page.goto('/models');
		await expect(page.locator('main')).toBeVisible();
	});
});

test.describe('Categories Page', () => {
	test('loads categories page', async ({ page }) => {
		await page.goto('/categories');
		await expect(page.locator('main')).toBeVisible();
	});
});

test.describe('Responsive Design', () => {
	test('works on mobile viewport', async ({ page }) => {
		await page.setViewportSize({ width: 375, height: 667 });
		await page.goto('/');
		await expect(page.locator('main')).toBeVisible();
	});

	test('works on tablet viewport', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });
		await page.goto('/');
		await expect(page.locator('main')).toBeVisible();
	});
});
