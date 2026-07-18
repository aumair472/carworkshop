import { test, expect } from '@playwright/test'

// Full content authoring pass on the live Brake Repair service page —
// this is a real publish (not test-and-revert), scoped to one page.

const BASE = 'https://carworkshop-ten.vercel.app'
const SHOT = 'e2e/screenshots'

test.use({ baseURL: BASE })

test('Brake Repair — full admin content update + public verification', async ({ page }) => {
  // STEP 1 — login
  await page.goto('/admin/login')
  await page.getByPlaceholder('admin@carworkshop.ae').fill('aumair472@gmail.com')
  await page.getByPlaceholder('••••••••').fill('Admin@123')
  await page.getByRole('button', { name: 'Sign In' }).click()
  await page.waitForURL(u => !u.pathname.includes('/admin/login'), { timeout: 15000 })
  console.log('✅ Logged in')

  // STEP 2 — find brake-repair in Services list
  await page.goto('/admin/services')
  await page.waitForLoadState('networkidle')
  const row = page.locator('tr', { hasText: 'Brake Repair' })
  await expect(row).toBeVisible()
  await Promise.all([
    page.waitForURL(u => /\/admin\/services\/[^/]+$/.test(u.pathname), { timeout: 15000 }),
    row.getByRole('link', { name: 'Edit' }).click(),
  ])
  await page.waitForLoadState('networkidle')
  console.log('Edit form URL:', page.url())
  await page.screenshot({ path: `${SHOT}/brake-repair-edit-found.png`, fullPage: true })

  // STEP 3 — Service Info tab: name, slug (verify only), short desc, full content
  const nameField = page.getByLabel('Service Name', { exact: true })
  await nameField.fill('Brake Repair')
  console.log('✅ Name confirmed: Brake Repair')

  const slugField = page.getByLabel('Slug', { exact: true })
  const slugVal = await slugField.inputValue()
  console.log(slugVal.includes('brake') ? `✅ Slug correct: ${slugVal}` : `❌ Wrong slug: ${slugVal}`)
  expect(slugVal).toContain('brake')

  const shortDesc = page.getByLabel('Short Description', { exact: true })
  await shortDesc.fill('Professional brake repair and replacement service in UAE. Certified technicians, genuine parts, free pickup and delivery.')
  console.log('✅ Short description updated')

  const editor = page.locator('.ProseMirror').first()
  await editor.click()
  await page.keyboard.press('Control+A')
  await page.keyboard.type(
    'Expert Brake Repair Service in UAE. At CarWorkshop.ae, we provide professional brake repair and maintenance services across Dubai, Abu Dhabi, and Sharjah. Our certified technicians use only genuine OEM parts to ensure your safety on UAE roads. '
    + 'Our brake repair service includes a comprehensive inspection of your entire braking system — from brake pads and discs to calipers and fluid. We identify any issues and provide a transparent quote before any work begins. '
    + 'All brake repair work comes with our 12-month or 10,000km warranty. Book online today and enjoy free pickup and delivery from your home or office.'
  )
  console.log('✅ Rich text content updated')

  // STEP 3b — Pricing & Includes tab
  await page.getByRole('tab', { name: 'Pricing & Includes' }).click()
  await page.waitForTimeout(300)

  const priceField = page.getByLabel('Starting Price (AED)', { exact: true })
  await priceField.fill('199')
  console.log('✅ Price set to 199')

  const includeItems = [
    'Brake pad inspection and replacement',
    'Brake disc check and resurfacing',
    'Brake fluid top-up',
    'Brake caliper inspection',
    'Free 30-point safety check',
    'Free pickup and delivery',
  ]
  const addIncludeBtn = page.getByRole('button', { name: '+ Add include item' })
  for (const item of includeItems) {
    await addIncludeBtn.click()
    await page.getByPlaceholder('Full synthetic oil (5L)').last().fill(item)
  }
  console.log(`✅ ${includeItems.length} include items added`)

  // STEP 4 — FAQs (same tab)
  const faqs = [
    { q: 'How do I know if my brakes need repair?', a: 'Common signs include squeaking or grinding noises, vibration when braking, car pulling to one side, or a soft/spongy brake pedal. If you notice any of these, book a brake inspection immediately.' },
    { q: 'How much does brake repair cost in UAE?', a: 'Brake repair in UAE starts from AED 199 depending on your car make, model, and the extent of damage. We provide a full quote before starting any work.' },
    { q: 'How long does brake repair take?', a: 'Most brake repairs take 2-3 hours. Our free pickup and delivery service means you can carry on with your day while we fix your car.' },
    { q: 'Do you use genuine brake parts?', a: 'Yes. We use genuine OEM, quality aftermarket, or brand-specific parts depending on your preference and budget. All parts are covered by our 12-month warranty.' },
    { q: 'Can you repair brakes for all car brands?', a: 'Yes. We service all car brands including Audi, BMW, Mercedes-Benz, Toyota, Nissan, and all other makes across the UAE.' },
  ]
  const addFaqBtn = page.getByRole('button', { name: '+ Add FAQ' })
  for (const faq of faqs) {
    await addFaqBtn.click()
    await page.getByLabel('Question', { exact: true }).last().fill(faq.q)
    await page.getByLabel('Answer', { exact: true }).last().fill(faq.a)
  }
  console.log(`✅ ${faqs.length} FAQs added`)

  // STEP 5 — SEO tab
  await page.getByRole('tab', { name: 'SEO', exact: true }).click()
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOT}/brake-repair-seo-fields.png`, fullPage: true })

  const metaTitle = page.getByPlaceholder('Brake Repair in UAE | CarWorkshop.ae')
  await metaTitle.fill('Brake Repair Service in UAE | From AED 199 | CarWorkshop.ae')
  console.log('✅ Meta title updated')

  const metaDesc = page.getByPlaceholder(/Expert Audi A4 oil change/)
  await metaDesc.fill('Professional brake repair in UAE from AED 199. Certified technicians, genuine parts, free pickup and delivery, 12-month warranty. Book online now.')
  console.log('✅ Meta description updated')

  // STEP 6 — image fields present (no real file to upload)
  const selectImageCount = await page.getByRole('button', { name: 'Select Image' }).count()
  console.log(`Image upload fields found: ${selectImageCount}`)

  // STEP 7 — publish (info/pricing tab fields must be saved via the top Publish button, which persists whole `svc` state regardless of active tab)
  const [publishRes] = await Promise.all([
    page.waitForResponse(r => /\/api\/admin\/services\/[^/]+$/.test(r.url()) && r.request().method() === 'PATCH'),
    page.getByRole('button', { name: 'Publish' }).click(),
  ])
  console.log(`${publishRes.ok() ? '✅' : '❌'} Publish saved: ${publishRes.status()}`)
  if (!publishRes.ok()) console.log('Publish error body:', await publishRes.text().catch(() => '<unreadable>'))
  expect(publishRes.ok()).toBe(true)
  await page.waitForTimeout(1500)
  await page.screenshot({ path: `${SHOT}/brake-repair-after-save.png`, fullPage: true })

  // Also save the SEO tab (separate endpoint)
  await page.getByRole('tab', { name: 'SEO', exact: true }).click()
  await page.waitForTimeout(300)
  const [seoRes] = await Promise.all([
    page.waitForResponse(r => /\/api\/admin\/services\/[^/]+\/seo$/.test(r.url()) && r.request().method() === 'PUT'),
    page.getByRole('button', { name: 'Save SEO' }).click(),
  ])
  console.log(`${seoRes.ok() ? '✅' : '❌'} SEO saved: ${seoRes.status()}`)
  expect(seoRes.ok()).toBe(true)

  // STEP 8 — verify on public page
  await page.waitForTimeout(3000)
  await page.goto('/services/brake-repair', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  await page.screenshot({ path: `${SHOT}/brake-repair-public-after-update.png`, fullPage: true })

  const title = await page.title()
  console.log('Page title:', title)
  console.log(title.includes('Brake Repair') && title.length <= 70 ? '✅ Title correct' : `❌ Title issue: ${title}`)

  const desc = await page.getAttribute('meta[name="description"]', 'content')
  console.log('Meta desc:', desc?.slice(0, 90))
  console.log(desc?.includes('AED 199') ? '✅ Meta desc updated' : '❌ Meta desc not updated')

  const h1Count = await page.locator('h1').count()
  const h1Text = await page.locator('h1').first().textContent()
  console.log(`H1 count: ${h1Count}, text: ${h1Text}`)
  console.log(h1Count === 1 ? '✅ Exactly 1 H1' : `❌ H1 count wrong: ${h1Count}`)
  expect(h1Count).toBe(1)

  const bodyText = await page.locator('body').innerText()
  const priceShowing = /AED\s*199/.test(bodyText)
  console.log(priceShowing ? '✅ Price AED 199 showing' : '❌ Price AED 199 not found on page')

  const hasContent = /brake/i.test(bodyText)
  console.log(hasContent ? '✅ Brake content showing on page' : '❌ Brake content missing')

  const faqVisible = bodyText.includes('How do I know if my brakes need repair')
  console.log(faqVisible ? '✅ FAQs visible on public page' : '❌ FAQs not visible on public page')

  const jsonLdCount = await page.locator('script[type="application/ld+json"]').count()
  console.log(`JSON-LD scripts: ${jsonLdCount}`)
  if (jsonLdCount > 0) {
    const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
    const hasFAQ = schemas.some(s => s.includes('FAQPage'))
    const hasService = schemas.some(s => s.includes('"@type":"Service"') || s.includes('Service'))
    console.log(hasFAQ ? '✅ FAQPage schema' : '❌ FAQPage schema missing')
    console.log(hasService ? '✅ Service schema' : '❌ Service schema missing')
  } else {
    console.log('❌ No JSON-LD schema on page')
  }

  const canonical = await page.getAttribute('link[rel="canonical"]', 'href')
  console.log('Canonical:', canonical)
  console.log(canonical?.includes('brake-repair') ? '✅ Canonical correct' : '❌ Canonical wrong or missing')

  const robots = await page.getAttribute('meta[name="robots"]', 'content')
  console.log(robots?.includes('noindex') ? '❌ CRITICAL: noindex on service page' : '✅ No noindex on service page')
  expect(robots?.includes('noindex')).toBeFalsy()

  const waBtnVisible = await page.locator('a[href*="wa.me"]').first().isVisible().catch(() => false)
  console.log(waBtnVisible ? '✅ WhatsApp button visible' : '❌ WhatsApp button not visible')

  await page.setViewportSize({ width: 375, height: 812 })
  await page.screenshot({ path: `${SHOT}/brake-repair-mobile.png` })
  await page.setViewportSize({ width: 1280, height: 800 })

  console.log('\n════ BRAKE REPAIR PAGE UPDATE — DONE ════')
  console.log('Screenshots: e2e/screenshots/brake-repair-*.png')
})
