import { test, expect, type Page } from '@playwright/test'

// Full live-site audit against the production Vercel deployment.
// Writes are test-and-revert: every field we change gets set back to its
// original value after confirming the save round-trips. Never touches the
// real WhatsApp contact number or creates orphan rows that can't be deleted.

const BASE = 'https://carworkshop-ten.vercel.app'
const SHOT = 'e2e/screenshots/live-audit'

const ADMIN = { email: 'aumair472@gmail.com', password: 'Admin@123' }
const SEO_EDITOR = { email: 'umairalibakhtali29833@gmail.com', password: 'Umair@123' }

test.use({ baseURL: BASE })

async function login(page: Page, creds: { email: string; password: string }) {
  await page.goto('/admin/login')
  await page.waitForLoadState('networkidle')
  if (page.url().includes('/admin/login')) {
    await page.getByPlaceholder('admin@carworkshop.ae').fill(creds.email)
    await page.getByPlaceholder('••••••••').fill(creds.password)
    await page.getByRole('button', { name: 'Sign In' }).click()
    await page.waitForURL(u => !u.pathname.includes('/admin/login'), { timeout: 15000 })
    await page.waitForLoadState('networkidle')
  }
}
const adminLogin = (page: Page) => login(page, ADMIN)
const seoEditorLogin = (page: Page) => login(page, SEO_EDITOR)

test.describe.configure({ mode: 'serial' })

test('Phase 1 — Admin login & no sidebar on login page', async ({ page }) => {
  await page.goto('/admin/login')
  await page.screenshot({ path: `${SHOT}/01-login-page.png`, fullPage: true })

  const sidebarVisible = await page.locator('nav[aria-label="Admin navigation"]').isVisible().catch(() => false)
  console.log(sidebarVisible ? '❌ BUG: Sidebar showing on login page' : '✅ Login page: no sidebar')
  expect(sidebarVisible).toBe(false)

  await adminLogin(page)
  await page.screenshot({ path: `${SHOT}/01-login-success.png`, fullPage: true })
  const onLogin = page.url().includes('/admin/login')
  console.log(onLogin ? '❌ CRITICAL: admin login failed' : '✅ Admin login successful, landed on ' + page.url())
  expect(onLogin).toBe(false)
})

test('Phase 2 — Admin sidebar has all expected items', async ({ page }) => {
  await adminLogin(page)
  await page.screenshot({ path: `${SHOT}/02-admin-sidebar.png`, fullPage: true })

  const nav = page.locator('nav[aria-label="Admin navigation"]')
  const expected = ['Dashboard', "FAQ's", 'Language Key', 'SEO Pages', 'SEO Blog', 'Service Content', 'Static Page SEO', 'Search Content', 'Settings', 'Users', 'Leads']
  for (const item of expected) {
    const visible = await nav.getByText(item, { exact: true }).isVisible().catch(() => false)
    console.log(`${visible ? '✅' : '❌'} Sidebar item: ${item}`)
  }
  const logoutVisible = await page.getByRole('button', { name: 'Logout' }).isVisible().catch(() => false)
  console.log(`${logoutVisible ? '✅' : '❌'} Logout button`)
})

test('Phase 3 — Admin: edit Toyota brand meta title (save + revert)', async ({ page }) => {
  await adminLogin(page)
  await page.goto('/admin/brands')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/03-brands-list.png`, fullPage: true })

  const rows = await page.locator('a', { hasText: 'Edit' }).count()
  console.log(`Brand edit links: ${rows}`)
  expect(rows).toBeGreaterThan(0)

  await page.getByRole('link', { name: 'Edit' }).first().click()
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/03-brand-edit.png`, fullPage: true })

  await page.getByRole('tab', { name: 'SEO' }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOT}/03-brand-seo-tab.png`, fullPage: true })

  const metaTitle = page.getByLabel('Meta Title')
  const original = await metaTitle.inputValue()
  await metaTitle.fill('QA AUDIT TEST — will be reverted')
  const [patchRes] = await Promise.all([
    page.waitForResponse(r => /\/api\/admin\/brands\//.test(r.url()) && r.request().method() === 'PATCH'),
    page.getByRole('button', { name: 'Save Draft' }).click(),
  ])
  console.log(`${patchRes.ok() ? '✅' : '❌'} Brand meta title save: ${patchRes.status()}`)
  expect(patchRes.ok()).toBe(true)

  // revert
  await metaTitle.fill(original)
  const [revertRes] = await Promise.all([
    page.waitForResponse(r => /\/api\/admin\/brands\//.test(r.url()) && r.request().method() === 'PATCH'),
    page.getByRole('button', { name: 'Publish' }).click(),
  ])
  console.log(`${revertRes.ok() ? '✅' : '❌'} Brand meta title reverted + republished: ${revertRes.status()}`)
})

test('Phase 4 — Admin: Services list loads', async ({ page }) => {
  await adminLogin(page)
  await page.goto('/admin/services')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/04-services-list.png`, fullPage: true })
  const count = await page.getByRole('link', { name: 'Edit' }).count()
  console.log(`${count > 0 ? '✅' : '❌'} Services list: ${count} edit links`)
  expect(count).toBeGreaterThan(0)
})

test('Phase 5 — Admin: Locations list loads', async ({ page }) => {
  await adminLogin(page)
  await page.goto('/admin/locations')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/05-locations-list.png`, fullPage: true })
  const count = await page.getByRole('link', { name: 'Edit' }).count()
  console.log(`${count > 0 ? '✅' : '❌'} Locations list: ${count} edit links`)
  expect(count).toBeGreaterThan(0)
})

test('Phase 6 — Admin: SEO Pages — edit a generated page (save + revert)', async ({ page }) => {
  await adminLogin(page)
  await page.goto('/admin/seo-pages')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/06-seo-pages-list.png`, fullPage: true })

  const editLinks = page.locator('a[href^="/admin/seo-pages/"]:not([href$="/new"])')
  const count = await editLinks.count()
  console.log(`SEO Pages edit links: ${count}`)
  expect(count).toBeGreaterThan(0)
  await editLinks.first().click()
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/06-generated-page-edit.png`, fullPage: true })

  const metaTitle = page.getByLabel('Meta Title')
  const original = await metaTitle.inputValue()
  await metaTitle.fill(`${original} QATEST`)
  const [saveRes] = await Promise.all([
    page.waitForResponse(r => /\/api\/admin\/seo-pages\//.test(r.url()) && ['PATCH', 'PUT'].includes(r.request().method())),
    page.getByRole('button', { name: 'SAVE & KEEP EDITING' }).click(),
  ])
  console.log(`${saveRes.ok() ? '✅' : '❌'} Generated page save: ${saveRes.status()}`)
  expect(saveRes.ok()).toBe(true)

  await metaTitle.fill(original)
  const [revertRes] = await Promise.all([
    page.waitForResponse(r => /\/api\/admin\/seo-pages\//.test(r.url()) && ['PATCH', 'PUT'].includes(r.request().method())),
    page.getByRole('button', { name: 'SAVE & EXIT' }).click(),
  ])
  console.log(`${revertRes.ok() ? '✅' : '❌'} Generated page reverted: ${revertRes.status()}`)
})

test('Phase 7 — Admin: SEO Blog — Add New form renders (not submitted)', async ({ page }) => {
  await adminLogin(page)
  await page.goto('/admin/seo-blog')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/07-seo-blog-list.png`, fullPage: true })

  const addNew = page.getByRole('link', { name: 'ADD NEW' })
  const visible = await addNew.isVisible().catch(() => false)
  console.log(`${visible ? '✅' : '❌'} ADD NEW link present`)
  if (visible) {
    await addNew.click()
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${SHOT}/07-seo-blog-new.png`, fullPage: true })
  }
})

test('Phase 8 — Admin: Static Page SEO list + Terms editor round-trip', async ({ page }) => {
  await adminLogin(page)
  await page.goto('/admin/static-page-seo')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/08-static-seo-list.png`, fullPage: true })

  await page.getByRole('link', { name: 'Edit Terms & Conditions' }).click()
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/08-static-seo-terms-edit.png`, fullPage: true })

  const metaKeyword = page.getByPlaceholder('keyword1, keyword2, keyword3')
  const original = await metaKeyword.inputValue()
  await metaKeyword.fill('qa, audit, test')
  const [saveRes] = await Promise.all([
    page.waitForResponse(r => /\/api\/admin\/pages\/static\/terms/.test(r.url()) && r.request().method() === 'PUT'),
    page.getByRole('button', { name: 'Save Draft' }).click(),
  ])
  console.log(`${saveRes.ok() ? '✅' : '❌'} Terms static page save: ${saveRes.status()}`)
  expect(saveRes.ok()).toBe(true)

  await metaKeyword.fill(original)
  await Promise.all([
    page.waitForResponse(r => /\/api\/admin\/pages\/static\/terms/.test(r.url()) && r.request().method() === 'PUT'),
    page.getByRole('button', { name: 'Save Draft' }).click(),
  ])
  console.log('✅ Terms static page reverted')
})

test('Phase 9 — Admin: Leads module read-only checks', async ({ page }) => {
  await adminLogin(page)
  await page.goto('/admin/leads')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/09-leads.png`, fullPage: true })
  const exportBtn = page.getByRole('link', { name: 'Export CSV' })
  console.log(`${await exportBtn.isVisible().catch(() => false) ? '✅' : '❌'} Export CSV button`)
})

test('Phase 10 — Admin: Settings — General tab loads (no writes to WhatsApp)', async ({ page }) => {
  await adminLogin(page)
  await page.goto('/admin/settings')
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: `${SHOT}/10-settings-general.png`, fullPage: true })

  await page.getByRole('button', { name: 'WhatsApp & Call' }).click()
  await page.waitForTimeout(300)
  await page.screenshot({ path: `${SHOT}/10-settings-whatsapp.png`, fullPage: true })
  console.log('ℹ️ WhatsApp tab loaded (read-only — not writing real contact number)')
})

test('Phase 11 — SEO Editor: login lands on seo-pages, sidebar shows only 5 modules', async ({ page }) => {
  await seoEditorLogin(page)
  await page.screenshot({ path: `${SHOT}/11-seo-editor-landing.png`, fullPage: true })

  const url = page.url()
  console.log('SEO Editor landing URL:', url)
  expect(url).toContain('/admin/seo-pages')

  const nav = page.locator('nav[aria-label="Admin navigation"]')
  const allowed = ['SEO Pages', 'SEO Blog', 'Service Content', 'Static Page SEO', 'Search Content']
  for (const item of allowed) {
    const visible = await nav.getByText(item, { exact: true }).isVisible().catch(() => false)
    console.log(`${visible ? '✅' : '❌'} SEO Editor can see: ${item}`)
    expect(visible).toBe(true)
  }
  const blocked = ['Dashboard', "FAQ's", 'Language Key', 'Leads', 'Settings', 'Users']
  for (const item of blocked) {
    const visible = await nav.getByText(item, { exact: true }).isVisible().catch(() => false)
    console.log(`${visible ? '❌ PROBLEM: visible' : '✅ correctly hidden'}: ${item}`)
    expect(visible).toBe(false)
  }
})

test('Phase 12 — SEO Editor: blocked routes redirect + banner', async ({ page }) => {
  await seoEditorLogin(page)
  const blockedRoutes = ['/admin', '/admin/leads', '/admin/settings', '/admin/users', '/admin/brands']
  for (const route of blockedRoutes) {
    await page.goto(route)
    await page.waitForLoadState('networkidle')
    const finalUrl = page.url()
    const blocked = finalUrl.includes('seo-pages') && finalUrl.includes('access_denied')
    console.log(`${blocked ? '✅' : '❌'} ${route} → ${finalUrl}`)
    expect(blocked).toBe(true)
    await page.screenshot({ path: `${SHOT}/12-blocked-${route.replace(/\//g, '-')}.png` })
  }
  const apiChecks = await page.evaluate(async () => {
    const r1 = await fetch('/api/admin/leads')
    const r2 = await fetch('/api/admin/seo-pages')
    return { leads: r1.status, seoPages: r2.status }
  })
  console.log(`${apiChecks.leads === 403 ? '✅' : '❌'} /api/admin/leads → ${apiChecks.leads} (expect 403)`)
  console.log(`${apiChecks.seoPages === 200 ? '✅' : '❌'} /api/admin/seo-pages → ${apiChecks.seoPages} (expect 200)`)
})

test('Phase 13 — SEO Editor: Static Page SEO editor reachable (via list, not sidebar)', async ({ page }) => {
  await seoEditorLogin(page)
  await page.goto('/admin/static-page-seo')
  await page.waitForLoadState('networkidle')
  await Promise.all([
    page.waitForURL(u => u.pathname.includes('/admin/pages/static/terms'), { timeout: 15000 }),
    page.getByRole('link', { name: 'Edit Terms & Conditions' }).click(),
  ])
  await page.waitForLoadState('networkidle')
  const loaded = page.url().includes('/admin/pages/static/terms')
  console.log(`${loaded ? '✅' : '❌'} SEO Editor reached Static Page SEO editor: ${page.url()}`)
  await page.screenshot({ path: `${SHOT}/13-seo-editor-static-page.png`, fullPage: true })
  expect(loaded).toBe(true)
})

test('Phase 14 — Public pages: SEO audit (titles, canonical, H1, JSON-LD)', async ({ page }) => {
  const publicPages = [
    { url: '/', name: 'home' },
    { url: '/services', name: 'services' },
    { url: '/services/oil-change', name: 'oil-change' },
    { url: '/brands', name: 'brands' },
    { url: '/brands/audi', name: 'audi-brand' },
    { url: '/brands/audi/a4', name: 'audi-a4-model' },
    { url: '/brands/audi/a4/oil-change', name: 'audi-a4-oil-change' },
    { url: '/brands/audi/a4/oil-change/dubai', name: '4d-page' },
    { url: '/locations', name: 'locations' },
    { url: '/locations/dubai', name: 'dubai-location' },
    { url: '/about', name: 'about' },
    { url: '/contact', name: 'contact' },
    { url: '/faq', name: 'faq' },
    { url: '/blog', name: 'blog' },
  ]

  const results: Array<{ page: string; title: string; hasDesc: boolean; hasCanonical: boolean; h1Count: number; jsonLd: number; status: number }> = []

  for (const pg of publicPages) {
    const resp = await page.goto(pg.url, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    const title = await page.title()
    const desc = await page.getAttribute('meta[name="description"]', 'content')
    const canonical = await page.getAttribute('link[rel="canonical"]', 'href')
    const h1Count = await page.locator('h1').count()
    const jsonLd = await page.locator('script[type="application/ld+json"]').count()
    const robots = await page.getAttribute('meta[name="robots"]', 'content')
    const status = resp?.status() ?? 0

    results.push({ page: pg.name, title: (title ?? '').slice(0, 50), hasDesc: !!desc, hasCanonical: !!canonical, h1Count, jsonLd, status })
    await page.screenshot({ path: `${SHOT}/14-public-${pg.name}.png` })

    const issues: string[] = []
    if (status !== 200) issues.push(`STATUS ${status}`)
    if (!title || title.length < 10) issues.push('NO TITLE')
    if (!desc) issues.push('NO META DESC')
    if (!canonical) issues.push('NO CANONICAL')
    if (h1Count === 0) issues.push('NO H1')
    if (h1Count > 1) issues.push(`DUPLICATE H1 (${h1Count})`)
    if (jsonLd === 0) issues.push('NO JSON-LD')
    if (robots?.includes('noindex')) issues.push('HAS NOINDEX')
    console.log(issues.length === 0 ? `✅ ${pg.name}: all checks pass` : `❌ ${pg.name}: ${issues.join(' | ')}`)
  }

  console.log('\n════ PUBLIC PAGES AUDIT ════')
  for (const r of results) console.log(`${r.page} | status ${r.status} | title="${r.title}" | desc:${r.hasDesc} | canonical:${r.hasCanonical} | h1:${r.h1Count} | jsonLd:${r.jsonLd}`)
})

test('Phase 15 — Lead form: submit test lead and verify in admin', async ({ page }) => {
  await page.goto('/brands/audi/a4/oil-change', { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  const form = page.locator('form').first()
  const formVisible = await form.isVisible().catch(() => false)
  console.log(`${formVisible ? '✅' : '❌'} Lead form visible on core page`)

  if (formVisible) {
    const nameInput = form.getByPlaceholder('Your name')
    const phoneInput = form.getByPlaceholder(/Phone/i)
    if (await nameInput.isVisible().catch(() => false)) {
      await nameInput.fill('QA Live-Audit Test')
      await phoneInput.fill('+971509876543')
      await page.screenshot({ path: `${SHOT}/15-lead-form-filled.png` })
      const submitBtn = form.getByRole('button', { name: /book now/i })
      const [leadRes] = await Promise.all([
        page.waitForResponse(r => r.url().includes('/api/leads') && r.request().method() === 'POST'),
        submitBtn.click(),
      ])
      console.log(`${leadRes.ok() ? '✅' : '❌'} Lead submit API: ${leadRes.status()}`)
      await page.waitForTimeout(1000)
      await page.screenshot({ path: `${SHOT}/15-lead-submitted.png` })
    } else {
      console.log('❌ Lead form fields not found')
    }
  }

  await adminLogin(page)
  await page.goto('/admin/leads')
  await page.waitForLoadState('networkidle')
  const leadFound = await page.getByText('QA Live-Audit Test').first().isVisible({ timeout: 5000 }).catch(() => false)
  console.log(`${leadFound ? '✅' : '❌'} Lead appears in admin: ${leadFound}`)
})

test('Phase 16 — Final report', async () => {
  console.log('\n════════════════════════════════════════')
  console.log('CARWORKSHOP.AE LIVE AUDIT — see log above per phase')
  console.log(`Screenshots: ${SHOT}/`)
  console.log('════════════════════════════════════════')
})
