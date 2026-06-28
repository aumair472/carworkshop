import { test, expect, type Page } from '@playwright/test'

// Adapted to the real Home editor DOM (label-based AdminInput fields, chip
// MultiSelect, role-based Repeaters). Validates the admin editor round-trips
// content_json to the public home page, including the sections that were
// previously hardcoded (How It Works, Why Choose Us, Reviews) and SEO meta.

const EMAIL = 'aumair472@gmail.com'
const PASSWORD = 'Admin@123'
const HOME_EDITOR = '/admin/pages/static/home'

const loggedIn = (url: string | URL) => {
  const u = new URL(String(url))
  return /\/admin(\/|$)/.test(u.pathname) && !u.pathname.includes('/login')
}

async function loginAsAdmin(page: Page) {
  await page.goto('/admin/login')
  await page.waitForLoadState('networkidle')
  if (loggedIn(page.url())) return
  const email = page.locator('input[name="email"]')
  const password = page.locator('input[name="password"]')
  await email.click()
  await email.fill(EMAIL)
  await password.fill(PASSWORD)
  await expect(email).toHaveValue(EMAIL)
  await Promise.all([
    page.waitForURL(loggedIn, { timeout: 15000 }),
    page.getByRole('button', { name: 'Sign In' }).click(),
  ])
}

test('Step 1: Login to admin', async ({ page }) => {
  await loginAsAdmin(page)
  await page.screenshot({ path: 'e2e/screenshots/01-login-success.png', fullPage: true })
  expect(page.url()).toContain('/admin')
})

test('Step 2: Home editor loads with all sections', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto(HOME_EDITOR)
  await page.waitForLoadState('networkidle')
  await expect(page.getByRole('heading', { name: 'Home Page', level: 1 })).toBeVisible()
  for (const s of ['Hero', 'Trust Bar', 'Popular Services', 'How It Works', 'Why Choose Us', 'Customer Reviews', 'Locations', 'FAQ', 'CTA Banner']) {
    await expect(page.getByRole('button', { name: s, exact: true })).toBeVisible()
  }
  await page.screenshot({ path: 'e2e/screenshots/02-home-editor.png', fullPage: true })
})

test('Step 3: Edit hero, SEO + a review, publish, verify on public page', async ({ page }) => {
  await loginAsAdmin(page)
  await page.goto(HOME_EDITOR)
  await page.waitForLoadState('networkidle')

  // Hero H1 (AdminInput renders a labelled textbox).
  const h1 = page.getByRole('textbox', { name: 'H1 Heading' }).first()
  await h1.fill('Car Service & Repair in UAE — Free Pickup & Delivery')

  // SEO meta (sidebar SeoCard).
  await page.getByRole('textbox', { name: 'Meta Title' }).fill('Car Service & Repair in UAE | Free Pickup | CarWorkshop.ae')
  await page.getByRole('textbox', { name: 'Meta Description' }).fill('CarWorkshop.ae offers professional car service and repair across UAE with free pickup and delivery. Certified technicians, transparent pricing, 12-month warranty.')

  // Add one customer review (proves Reviews section is content-driven).
  await page.getByRole('button', { name: '+ Add Review' }).click()
  await page.getByRole('textbox', { name: 'Customer name' }).last().fill('Ahmed Al-Rashid')
  await page.getByRole('textbox', { name: 'Service used' }).last().fill('Oil Change')
  await page.getByRole('textbox', { name: 'Review text' }).last().fill('Excellent service! Picked up my Audi A4 and returned it the same day, 30% cheaper than the dealer.')

  // Publish.
  await page.getByRole('button', { name: 'Publish' }).last().click()
  await expect(page.getByText(/published/i).first()).toBeVisible({ timeout: 10000 })

  // Verify public page. Reload until ISR revalidation lands (publish is async).
  await expect(async () => {
    await page.goto('/')
    expect(await page.title()).toContain('Free Pickup')
  }).toPass({ timeout: 10000 })
  await page.waitForLoadState('networkidle')

  const audit = await page.evaluate(() => ({
    h1count: document.querySelectorAll('h1').length,
    title: document.title,
    descLen: document.querySelector('meta[name="description"]')?.getAttribute('content')?.length ?? 0,
    jsonld: document.querySelectorAll('script[type="application/ld+json"]').length,
    hasReview: document.body.innerText.includes('Ahmed Al-Rashid'),
    trustBars: document.body.innerText.split('Cars Serviced').length - 1,
  }))

  expect(audit.h1count).toBe(1)
  expect(audit.trustBars).toBe(1) // no duplicate trust bar (hero used to hardcode one)
  expect(audit.title).toContain('Free Pickup')
  expect(audit.jsonld).toBeGreaterThan(0)
  expect(audit.hasReview).toBe(true)

  await page.screenshot({ path: 'e2e/screenshots/16-home-preview-full.png', fullPage: true })
})
