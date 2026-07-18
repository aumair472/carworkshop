import { test, expect, type Page } from '@playwright/test'

// Full content authoring pass on 6 live Hummer pages (real publish, not test-and-revert).
const BASE = 'https://carworkshop-ten.vercel.app'
const SHOT = 'e2e/screenshots/hummer'
const HUMMER_BRAND_ID = '94abe199-78bb-443c-be0c-f4658bc33eac'

test.use({ baseURL: BASE })
test.describe.configure({ mode: 'serial' })

async function adminLogin(page: Page) {
  await page.goto('/admin/login')
  await page.waitForLoadState('networkidle')
  if (page.url().includes('/admin/login')) {
    await page.getByPlaceholder('admin@carworkshop.ae').fill('aumair472@gmail.com')
    await page.getByPlaceholder('••••••••').fill('Admin@123')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL(u => !u.pathname.includes('/admin/login'), { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  }
}

// Locates a generated_pages row by its exact public path (via the "Open page" link)
// and opens its editor — precise, no text-substring ambiguity across location variants.
async function editGeneratedPage(page: Page, searchTerm: string, publicPath: string) {
  await page.goto('/admin/seo-pages')
  await page.waitForLoadState('networkidle')
  await page.getByPlaceholder('Page Name').fill(searchTerm)
  await page.getByRole('button', { name: 'Search' }).click()
  await page.waitForLoadState('networkidle')

  const openLink = page.locator(`a[href="${publicPath}"]`)
  await expect(openLink).toBeVisible({ timeout: 10000 })
  const row = openLink.locator('xpath=ancestor::tr[1]')
  const editLink = row.locator('a[href^="/admin/seo-pages/"]').first()
  await Promise.all([
    page.waitForURL(u => /\/admin\/seo-pages\/[^/]+$/.test(u.pathname), { timeout: 15000 }),
    editLink.click(),
  ])
  await page.waitForLoadState('networkidle')
}

async function saveGeneratedPage(page: Page) {
  const [res] = await Promise.all([
    page.waitForResponse(r => /\/api\/admin\/seo-pages\/[^/]+$/.test(r.url()) && ['PATCH', 'PUT'].includes(r.request().method())),
    page.getByRole('button', { name: 'SAVE & EXIT' }).click(),
  ])
  console.log(`${res.ok() ? '✅' : '❌'} Saved: ${res.status()}`)
  if (!res.ok()) console.log('Error body:', await res.text().catch(() => '<unreadable>'))
  expect(res.ok()).toBe(true)
}

async function checkPublicPage(page: Page, path: string, label: string) {
  const resp = await page.goto(path, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  await page.screenshot({ path: `${SHOT}/${label}-public.png`, fullPage: true })

  const status = resp?.status() ?? 0
  const title = await page.title()
  const h1Count = await page.locator('h1').count()
  const h1Text = await page.locator('h1').first().textContent().catch(() => '')
  const desc = await page.getAttribute('meta[name="description"]', 'content')
  const canonical = await page.getAttribute('link[rel="canonical"]', 'href')
  const robots = await page.getAttribute('meta[name="robots"]', 'content')
  const jsonLd = await page.locator('script[type="application/ld+json"]').count()

  console.log(`\n── ${path} ──`)
  console.log(`Status: ${status} | Title: ${title.slice(0, 60)}`)
  console.log(`H1 count: ${h1Count} | Text: ${h1Text?.slice(0, 50)}`)
  console.log(`Desc: ${!!desc} | Canonical: ${canonical} | JSON-LD: ${jsonLd} | Robots: ${robots ?? 'not set'}`)

  const issues: string[] = []
  if (status !== 200) issues.push(`STATUS ${status}`)
  if (h1Count !== 1) issues.push(`H1 COUNT ${h1Count}`)
  if (!desc) issues.push('NO DESC')
  if (!canonical) issues.push('NO CANONICAL')
  if (jsonLd === 0) issues.push('NO JSON-LD')
  if (robots?.includes('noindex')) issues.push('NOINDEX')
  console.log(issues.length === 0 ? '✅ all checks pass' : `❌ ${issues.join(' | ')}`)

  return { status, title, h1Count, h1Text, desc, canonical, jsonLd, robots }
}

test('Page 1 — Hummer Brand Hub (/brands/hummer)', async ({ page }) => {
  await adminLogin(page)
  console.log('\n=== BEFORE ===')
  await checkPublicPage(page, '/brands/hummer', 'brand-hub')

  await page.goto(`/admin/brands/${HUMMER_BRAND_ID}`)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/brand-edit-form.png`, fullPage: true })

  // Brand Info tab
  await page.getByLabel('Brand Name', { exact: true }).fill('Hummer')
  const editors = page.locator('.ProseMirror')
  await editors.nth(0).click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Expert Hummer service and repair in UAE. Our certified technicians specialise in all Hummer models including the H1, H2, H3, and the new electric Hummer EV. We offer free pickup and delivery across Dubai, Abu Dhabi, and Sharjah with a 12-month parts and labour warranty on all work.')
  await editors.nth(1).click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Hummer H2/H3: transmission issues, cooling system leaks, fuel pump failure, electrical faults. Hummer EV: battery management, software updates, air suspension calibration, charging system issues.')
  console.log('✅ Brand Info updated')

  // Page Content tab
  await page.getByRole('tab', { name: 'Page Content' }).click()
  await page.waitForTimeout(300)
  await page.getByLabel('H1 Heading', { exact: true }).fill('Expert Hummer Service & Repair in UAE')
  await page.getByLabel('Subheadline', { exact: true }).fill('Certified Hummer technicians. Free pickup & delivery. 12-month warranty.')

  const uspItems = [
    'Certified Hummer specialist technicians',
    '12-month warranty on all parts and labour',
    'Free collection and delivery across UAE',
  ]
  const addReasonBtn = page.getByRole('button', { name: '+ Add reason' })
  for (const usp of uspItems) {
    await addReasonBtn.click()
    await page.locator('input[placeholder="Title"]').last().fill(usp)
  }

  const brandFaqs = [
    { q: 'How much does Hummer service cost in UAE?', a: 'Hummer service in UAE starts from AED 349 for a major service. The exact cost depends on your Hummer model and the type of service required. We provide a full quote before starting any work.' },
    { q: 'Do you service the Hummer EV in UAE?', a: 'Yes. We are experienced with the new electric Hummer EV, including battery diagnostics, software updates, and all maintenance requirements. Our technicians are trained on EV-specific systems.' },
    { q: 'Which Hummer models do you service?', a: 'We service all Hummer models including H1, H2, H3, and the new electric Hummer EV across all UAE emirates.' },
  ]
  const addFaqBtn = page.getByRole('button', { name: '+ Add FAQ' })
  for (const faq of brandFaqs) {
    await addFaqBtn.click()
    await page.getByLabel('Question', { exact: true }).last().fill(faq.q)
    await page.getByLabel('Answer', { exact: true }).last().fill(faq.a)
  }
  console.log(`✅ ${brandFaqs.length} brand FAQs added`)

  const [publishRes] = await Promise.all([
    page.waitForResponse(r => /\/api\/admin\/brands\/[^/]+$/.test(r.url()) && r.request().method() === 'PATCH'),
    page.getByRole('button', { name: 'Publish' }).click(),
  ])
  console.log(`${publishRes.ok() ? '✅' : '❌'} Brand publish: ${publishRes.status()}`)
  expect(publishRes.ok()).toBe(true)

  // SEO tab
  await page.getByRole('tab', { name: 'SEO', exact: true }).click()
  await page.waitForTimeout(400)
  await page.getByPlaceholder('Hummer Service & Repair in UAE | CarWorkshop.ae').fill('Hummer Service & Repair in UAE | CarWorkshop.ae')
  await page.getByPlaceholder(/Expert Audi A4 oil change/).fill('Expert Hummer service and repair in UAE. Specialist technicians for H1, H2, H3 and Hummer EV. Free pickup and delivery, 12-month warranty. Book online now.')
  const [seoRes] = await Promise.all([
    page.waitForResponse(r => /\/api\/admin\/brands\/[^/]+\/seo$/.test(r.url()) && r.request().method() === 'PUT'),
    page.getByRole('button', { name: 'Save SEO' }).click(),
  ])
  console.log(`${seoRes.ok() ? '✅' : '❌'} Brand SEO save: ${seoRes.status()}`)
  expect(seoRes.ok()).toBe(true)
  await page.screenshot({ path: `${SHOT}/brand-saved.png`, fullPage: true })

  await page.waitForTimeout(3000)
  console.log('\n=== AFTER ===')
  const after = await checkPublicPage(page, '/brands/hummer', 'brand-hub')
  expect(after.status).toBe(200)
})

test('Page 2 — Hummer + Oil Change (/brands/hummer/oil-change)', async ({ page }) => {
  await adminLogin(page)
  console.log('\n=== BEFORE ===')
  await checkPublicPage(page, '/brands/hummer/oil-change', 'brand-service')

  await editGeneratedPage(page, 'Hummer Oil Change', '/brands/hummer/oil-change')
  await page.screenshot({ path: `${SHOT}/brand-service-edit.png`, fullPage: true })

  await page.getByLabel('H1 Text', { exact: true }).fill('Hummer Oil Change in UAE — Expert Service from AED 199')
  await page.getByLabel('Meta Title', { exact: true }).fill('Hummer Oil Change in UAE | From AED 199 | CarWorkshop.ae')
  await page.getByLabel('Meta Description', { exact: true }).fill('Professional Hummer oil change service in UAE from AED 199. Full synthetic oil, free pickup and delivery, 12-month warranty. All Hummer models serviced.')
  await page.locator('.ProseMirror').nth(1).click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type("CarWorkshop.ae provides expert oil change services for all Hummer models across the UAE. Our certified technicians use only the highest quality fully synthetic oil recommended for your Hummer, ensuring peak engine performance in UAE's extreme heat conditions. Our Hummer oil change service includes a new oil filter, all fluids top-up, and a complimentary 30-point vehicle health check.")
  console.log('✅ Fields updated')

  await saveGeneratedPage(page)
  await page.waitForTimeout(3000)
  console.log('\n=== AFTER ===')
  const after = await checkPublicPage(page, '/brands/hummer/oil-change', 'brand-service')
  expect(after.status).toBe(200)
})

test('Page 3 — Hummer + Oil Change + Dubai (/brands/hummer/oil-change/dubai)', async ({ page }) => {
  await adminLogin(page)
  console.log('\n=== BEFORE ===')
  await checkPublicPage(page, '/brands/hummer/oil-change/dubai', '3d-page')

  await editGeneratedPage(page, 'Hummer Oil Change', '/brands/hummer/oil-change/dubai')
  await page.screenshot({ path: `${SHOT}/3d-page-edit.png`, fullPage: true })

  await page.getByLabel('H1 Text', { exact: true }).fill('Hummer Oil Change in Dubai UAE — Free Pickup | CarWorkshop.ae')
  await page.getByLabel('Meta Title', { exact: true }).fill('Hummer Oil Change Dubai | Free Pickup | CarWorkshop.ae')
  await page.getByLabel('Meta Description', { exact: true }).fill('Hummer oil change service in Dubai from AED 199. Free pickup and delivery across all Dubai areas. Certified technicians, 12-month warranty. Book now.')
  await page.locator('.ProseMirror').nth(1).click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Get professional Hummer oil change service in Dubai from CarWorkshop.ae. We cover all Dubai areas including Dubai Marina, Business Bay, Al Quoz, Jumeirah, and Downtown Dubai with free collection and delivery. Our certified Hummer technicians complete oil changes same day or next day.')
  console.log('✅ Fields updated')

  await saveGeneratedPage(page)
  await page.waitForTimeout(3000)
  console.log('\n=== AFTER ===')
  const after = await checkPublicPage(page, '/brands/hummer/oil-change/dubai', '3d-page')
  expect(after.status).toBe(200)
})

test('Page 4 — Hummer EV Model Hub (/brands/hummer/ev)', async ({ page }) => {
  await adminLogin(page)
  console.log('\n=== BEFORE ===')
  await checkPublicPage(page, '/brands/hummer/ev', 'ev-hub')

  await editGeneratedPage(page, 'Hummer EV Service', '/brands/hummer/ev')
  await page.screenshot({ path: `${SHOT}/ev-model-edit.png`, fullPage: true })

  await page.getByLabel('H1 Text', { exact: true }).fill('Hummer EV Service & Repair in UAE — Electric Vehicle Specialists')
  await page.getByLabel('Meta Title', { exact: true }).fill('Hummer EV Service in UAE | EV Specialists | CarWorkshop.ae')
  await page.getByLabel('Meta Description', { exact: true }).fill('Expert Hummer EV service and repair in UAE. Certified electric vehicle technicians, battery diagnostics, software updates. Free pickup and delivery across UAE.')
  await page.locator('.ProseMirror').nth(1).click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('CarWorkshop.ae provides specialist service and repair for the Hummer EV across Dubai, Abu Dhabi, and Sharjah. Our certified electric vehicle technicians are fully trained on the Hummer EV platform, covering battery health diagnostics, software updates, air suspension calibration, and all routine maintenance. The Hummer EV requires specialist knowledge due to its unique 800-volt Ultium battery system and CrabWalk technology.')
  console.log('✅ Fields updated')

  await saveGeneratedPage(page)
  await page.waitForTimeout(3000)
  console.log('\n=== AFTER ===')
  const after = await checkPublicPage(page, '/brands/hummer/ev', 'ev-hub')
  expect(after.status).toBe(200)
})

test('Page 5 — Hummer EV + Oil Change (/brands/hummer/ev/oil-change)', async ({ page }) => {
  await adminLogin(page)
  console.log('\n=== BEFORE ===')
  await checkPublicPage(page, '/brands/hummer/ev/oil-change', 'ev-service')

  await editGeneratedPage(page, 'Hummer EV Oil Change', '/brands/hummer/ev/oil-change')
  await page.screenshot({ path: `${SHOT}/ev-oil-change-edit.png`, fullPage: true })

  await page.getByLabel('H1 Text', { exact: true }).fill('Hummer EV Oil Change & Fluid Service in UAE')
  await page.getByLabel('Meta Title', { exact: true }).fill('Hummer EV Oil Change UAE | EV Fluid Service | CarWorkshop.ae')
  await page.getByLabel('Meta Description', { exact: true }).fill('Hummer EV fluid service in UAE. While the EV needs no engine oil, we service all EV fluids including coolant, brake fluid and drivetrain. Free pickup and delivery.')
  await page.locator('.ProseMirror').nth(1).click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('Unlike conventional Hummer models, the Hummer EV does not require traditional engine oil changes. However, it still needs regular fluid maintenance: battery coolant system flush, brake fluid replacement (critical for EV regenerative braking), front and rear drive unit fluid service, power steering fluid check, and windshield washer fluid top-up. Book your Hummer EV fluid service with CarWorkshop.ae today.')
  console.log('✅ Fields updated')

  await saveGeneratedPage(page)
  await page.waitForTimeout(3000)
  console.log('\n=== AFTER ===')
  const after = await checkPublicPage(page, '/brands/hummer/ev/oil-change', 'ev-service')
  expect(after.status).toBe(200)
})

test('Page 6 — Hummer EV + Oil Change + Dubai (4D)', async ({ page }) => {
  await adminLogin(page)
  console.log('\n=== BEFORE ===')
  await checkPublicPage(page, '/brands/hummer/ev/oil-change/dubai', 'ev-4d')

  await editGeneratedPage(page, 'Hummer EV Oil Change', '/brands/hummer/ev/oil-change/dubai')
  await page.screenshot({ path: `${SHOT}/ev-4d-edit.png`, fullPage: true })

  await page.getByLabel('H1 Text', { exact: true }).fill('Hummer EV Fluid Service in Dubai UAE | Free Pickup')
  await page.getByLabel('Meta Title', { exact: true }).fill('Hummer EV Fluid Service Dubai | Free Pickup | CarWorkshop.ae')
  await page.getByLabel('Meta Description', { exact: true }).fill('Hummer EV fluid service in Dubai. Battery coolant, brake fluid and drivetrain service. Free pickup across Dubai, certified EV technicians, 12-month warranty.')
  await page.locator('.ProseMirror').nth(1).click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type('CarWorkshop.ae offers specialist Hummer EV fluid service across all Dubai areas. Whether you are in Dubai Marina, Business Bay, Jumeirah, Downtown Dubai, or Al Quoz — our certified EV technicians will collect your Hummer EV and return it fully serviced. Book your Hummer EV fluid service in Dubai today.')
  console.log('✅ Fields updated')

  await saveGeneratedPage(page)
  await page.waitForTimeout(3000)
  console.log('\n=== AFTER ===')
  const after = await checkPublicPage(page, '/brands/hummer/ev/oil-change/dubai', 'ev-4d')
  expect(after.status).toBe(200)
})

test('Final — verify all 6 Hummer pages', async ({ page }) => {
  const pages = [
    { path: '/brands/hummer', name: 'Hummer Brand Hub' },
    { path: '/brands/hummer/oil-change', name: 'Hummer + Oil Change' },
    { path: '/brands/hummer/oil-change/dubai', name: 'Hummer + Oil Change + Dubai' },
    { path: '/brands/hummer/ev', name: 'Hummer EV Hub' },
    { path: '/brands/hummer/ev/oil-change', name: 'Hummer EV + Oil Change' },
    { path: '/brands/hummer/ev/oil-change/dubai', name: 'Hummer EV 4D' },
  ]
  const results = []
  for (const pg of pages) {
    const r = await checkPublicPage(page, pg.path, `final-${pg.name.replace(/[+\s]+/g, '-').toLowerCase()}`)
    results.push({ ...r, name: pg.name })
  }
  console.log('\n════ HUMMER PAGES FINAL REPORT ════')
  for (const r of results) {
    const ok = r.status === 200 && r.h1Count === 1 && !!r.desc && r.jsonLd > 0 && !r.robots?.includes('noindex')
    console.log(`${ok ? '✅' : '❌'} ${r.name} | status ${r.status} | h1:${r.h1Count} | desc:${!!r.desc} | jsonLd:${r.jsonLd}`)
  }
  const failed = results.filter(r => r.status !== 200 || r.h1Count !== 1 || !r.desc || r.jsonLd === 0)
  console.log(`\nPassed: ${results.length - failed.length}/6`)
  expect(failed.length).toBe(0)
})
