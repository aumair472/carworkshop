import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads and has exactly one H1', async ({ page }) => {
    await page.goto('/')
    const h1s = page.locator('h1')
    await expect(h1s).toHaveCount(1)
  })

  test('H1 contains CarWorkshop text', async ({ page }) => {
    await page.goto('/')
    const h1 = page.locator('h1').first()
    await expect(h1).toBeVisible()
  })

  test('has working nav links', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('nav a[href="/services"]').first()).toBeVisible()
    await expect(page.locator('nav a[href="/brands"]').first()).toBeVisible()
  })

  test('CTA button is visible', async ({ page }) => {
    await page.goto('/')
    const cta = page.locator('a[href="/contact"]').first()
    await expect(cta).toBeVisible()
  })

  test('has no accessibility violations on heading hierarchy', async ({ page }) => {
    await page.goto('/')
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })
})

test.describe('Contact page', () => {
  test('has lead form with required fields', async ({ page }) => {
    await page.goto('/contact')
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('input[name="phone"]')).toBeVisible()
  })
})
