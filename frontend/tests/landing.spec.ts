import { test, expect } from '@playwright/test';

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the hero section correctly', async ({ page }) => {
    // Check main title
    const title = page.locator('h1');
    await expect(title).toContainText('Run Your Workshop');
    await expect(title).toContainText('Faster, Smarter');
    await expect(title).toContainText('and Fully Digital');

    // Check CTA buttons
    const ctaButton = page.getByRole('button', { name: /Start Free Trial/i });
    await expect(ctaButton).toBeVisible();

    const demoButton = page.getByRole('button', { name: /Try Live Demo/i });
    await expect(demoButton).toBeVisible();

    // Check trust stats
    await expect(page.getByText('Workshops Active')).toBeVisible();
    await expect(page.getByText('Job Cards Created')).toBeVisible();
  });

  test('should have all major sections present', async ({ page }) => {
    // Demo section
    await expect(page.locator('#demo-video')).toBeVisible();
    await expect(page.getByText('See Your Workshop, Fully Digital')).toBeVisible();

    // Problem/Solution section
    await expect(page.getByText('The paper-based workshop is costing you money')).toBeVisible();
    await expect(page.getByText('Traditional Workshop')).toBeVisible();
    await expect(page.getByText('Digital Workshop')).toBeVisible();

    // How It Works section
    await expect(page.getByText('How It Works', { exact: true })).toBeVisible();
    await expect(page.getByText('Customer Walks In')).toBeVisible();
    await expect(page.getByText('Invoice & Delivery')).toBeVisible();

    // Testimonials
    await expect(page.getByText('Trusted by workshops across India')).toBeVisible();

    // Pricing
    await expect(page.getByText('Ready to choose your plan?')).toBeVisible();
  });

  test('should highlight the professional pricing plan', async ({ page }) => {
    const professionalPlan = page.getByText('Professional', { exact: true }).locator('xpath=./ancestor::div[contains(@class, "rounded-2xl")]');
    await expect(professionalPlan).toContainText('Most Popular');
    
    // Check for the highlighted/border class we added (or just prominence)
    // In our implementation, we added a specific styling for professional
    await expect(professionalPlan).toBeVisible();
  });

  test('should have a working theme toggle', async ({ page }) => {
    // The ThemeToggle is in the StickyNav/LandingHero
    const themeToggle = page.locator('button').filter({ has: page.locator('svg.lucide-sun, svg.lucide-moon') });
    await expect(themeToggle).toBeVisible();
    
    // Check initial state (should be light or dark based on system, but usually light by default in new sessions)
    // We can't easily check the system theme but we can click it and check for class changes on html
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');
    
    await themeToggle.click();
    const afterClickClass = await html.getAttribute('class');
    
    expect(afterClickClass).not.toBe(initialClass);
  });
});
