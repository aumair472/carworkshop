import { test, expect, type Page } from '@playwright/test'

const BASE = 'https://carworkshop-ten.vercel.app'
const SHOT = 'e2e/screenshots/qa-4pages'

test.use({ baseURL: BASE })
test.describe.configure({ mode: 'serial' })

interface AuditResult {
  url: string; name: string; status: number; title: string; desc: string | null
  canonical: string | null; ogImage: string | null; robots: string | null
  h1Count: number; h1Text: string; h2Count: number; jsonLd: number; jsonLdTypes: string[]
  noIndex: boolean; waBtn: boolean; callBtn: boolean; hasNav: boolean; hasFooter: boolean
  imgAlt: number; imgNoAlt: number; contentLength: number; issues: string[]
}

async function fullPageAudit(page: Page, path: string, name: string): Promise<AuditResult> {
  const slug = name.toLowerCase().replace(/ /g, '-')
  const resp = await page.goto(path, { waitUntil: 'domcontentloaded' })
  await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
  // Scroll-reveal sections (.reveal) stay opacity:0 until their IntersectionObserver
  // fires — a fullPage screenshot without scrolling first would otherwise capture
  // real, correctly-sized sections mid-animation (looking "missing"). Simulate a
  // real user scrolling through before measuring/screenshotting.
  for (let i = 0; i < 10; i++) { await page.mouse.wheel(0, 600); await page.waitForTimeout(150) }
  await page.waitForTimeout(400)
  await page.screenshot({ path: `${SHOT}/${slug}-desktop.png`, fullPage: true })

  const attr = (sel: string, name: string) => page.locator(sel).first().getAttribute(name, { timeout: 3000 }).catch(() => null)
  const title = await page.title()
  const desc = await attr('meta[name="description"]', 'content')
  const canonical = await attr('link[rel="canonical"]', 'href')
  const ogImage = await attr('meta[property="og:image"]', 'content')
  const robots = await attr('meta[name="robots"]', 'content')
  const h1Count = await page.locator('h1').count()
  const h1Text = (await page.locator('h1').first().textContent().catch(() => '')) ?? ''
  const h2Count = await page.locator('h2').count()
  const jsonLd = await page.locator('script[type="application/ld+json"]').count()
  const noIndex = (robots ?? '').includes('noindex')
  const waBtn = (await page.locator('a[href*="wa.me"]').count()) > 0
  const callBtn = (await page.locator('a[href^="tel:"]').count()) > 0
  const hasNav = await page.locator('header').isVisible().catch(() => false)
  const hasFooter = await page.locator('footer').isVisible().catch(() => false)
  const contentLength = (await page.locator('main').first().innerText().catch(() => '')).length

  const jsonLdTypes: string[] = []
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
  for (const s of schemas) {
    try {
      const parsed = JSON.parse(s) as { '@type'?: string | string[]; '@graph'?: Array<{ '@type'?: string }> }
      const type = parsed['@type'] ?? parsed['@graph']?.map(g => g['@type']).filter(Boolean).join(', ')
      if (type) jsonLdTypes.push(Array.isArray(type) ? type.join(',') : type)
    } catch { /* skip invalid */ }
  }

  let imgAlt = 0, imgNoAlt = 0
  const imgs = await page.locator('img').all()
  for (const img of imgs) {
    const alt = await img.getAttribute('alt')
    if (alt) imgAlt++; else imgNoAlt++
  }

  await page.setViewportSize({ width: 375, height: 812 })
  await page.screenshot({ path: `${SHOT}/${slug}-mobile.png` })
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.screenshot({ path: `${SHOT}/${slug}-tablet.png` })
  await page.setViewportSize({ width: 1280, height: 800 })

  const status = resp?.status() ?? 0
  const issues: string[] = []
  if (status !== 200) issues.push(`STATUS ${status}`)
  if (!title || title.length < 10) issues.push('NO TITLE')
  if (title.length > 60) issues.push(`TITLE TOO LONG (${title.length})`)
  if (!desc) issues.push('NO META DESC')
  if (desc && desc.length > 160) issues.push('META DESC TOO LONG')
  if (!canonical) issues.push('NO CANONICAL')
  if (!ogImage) issues.push('NO OG IMAGE')
  if (noIndex) issues.push('NOINDEX')
  if (h1Count === 0) issues.push('NO H1')
  if (h1Count > 1) issues.push(`DUPLICATE H1 (${h1Count})`)
  if (jsonLd === 0) issues.push('NO JSON-LD')
  if (!hasNav) issues.push('NO HEADER')
  if (!hasFooter) issues.push('NO FOOTER')
  if (imgNoAlt > 0) issues.push(`${imgNoAlt} IMAGES MISSING ALT`)
  if (contentLength < 200) issues.push(`THIN CONTENT (${contentLength} chars)`)
  // WhatsApp button intentionally omitted from issues: whatsapp_enabled=false is a
  // deliberate site-settings choice (confirmed in a prior audit), not a defect.

  console.log(`\n════ ${name.toUpperCase()} AUDIT ════`)
  console.log(`Status: ${status} | Title: ${title} (${title.length} chars)`)
  console.log(`Desc: ${desc?.slice(0, 90)} (${desc?.length ?? 0} chars)`)
  console.log(`Canonical: ${canonical} | OG image: ${!!ogImage} | Robots: ${robots ?? 'not set'}`)
  console.log(`H1 count: ${h1Count} | Text: ${h1Text.slice(0, 50)} | H2 count: ${h2Count}`)
  console.log(`JSON-LD: ${jsonLd} — types: ${jsonLdTypes.join(' | ')}`)
  console.log(`WhatsApp: ${waBtn} (ℹ️ disabled via settings, expected) | Call: ${callBtn}`)
  console.log(`Header: ${hasNav} | Footer: ${hasFooter}`)
  console.log(`Images: ${imgAlt} with alt, ${imgNoAlt} missing alt`)
  console.log(`Content length: ${contentLength} chars`)
  console.log(issues.length === 0 ? '✅ NO ISSUES FOUND' : `❌ ISSUES: ${issues.join(' | ')}`)

  return { url: path, name, status, title, desc, canonical, ogImage, robots, h1Count, h1Text, h2Count, jsonLd, jsonLdTypes, noIndex, waBtn, callBtn, hasNav, hasFooter, imgAlt, imgNoAlt, contentLength, issues }
}

test('Homepage full QA', async ({ page }) => {
  const result = await fullPageAudit(page, '/', 'Homepage')

  console.log('\n── Homepage Sections ──')
  const sections: Array<[string, string]> = [
    ['Hero H1', 'h1'],
    ['Services section', 'text=Popular Services, text=Our Most Popular'],
    ['Brands section', 'text=Trusted Car Brands, text=Top Brands'],
    ['How it works', 'text=How It Works, text=Car Maintenance, Made Easy'],
    ['Why choose us', 'text=Why Choose'],
    ['Reviews section', 'text=Customers Say, text=Reviews'],
    ['Locations section', 'text=Areas We Serve, text=Locations Served'],
    ['FAQ section', 'details, text=Common Questions'],
    ['CTA banner', 'text=Book Now, text=Book Your'],
    ['Footer', 'footer'],
  ]
  for (const [label, sel] of sections) {
    const visible = await page.locator(sel).first().isVisible().catch(() => false)
    console.log(`${visible ? '✅' : '❌'} ${label}`)
  }

  console.log('\n── Nav Links ──')
  const navLinks = ['Services', 'Brands', 'Locations', 'Blog']
  for (const link of navLinks) {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const el = page.locator('header').getByRole('link', { name: link, exact: true }).first()
    const visible = await el.isVisible().catch(() => false)
    console.log(`${visible ? '✅' : '❌'} Nav link: ${link}`)
    if (visible) {
      await el.click()
      await page.waitForLoadState('networkidle')
      console.log(`   → ${page.url()} (status via title: "${await page.title()}")`)
    }
  }

  console.log('\n── JSON-LD Schema ──')
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
  for (const req of ['LocalBusiness', 'Organization', 'WebSite']) {
    console.log(`${schemas.some(s => s.includes(req)) ? '✅' : 'ℹ️ not present'} Schema type: ${req}`)
  }

  const perf = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return { loadTime: Math.round(nav.loadEventEnd - nav.startTime) }
  })
  console.log(`\nLoad time: ${perf.loadTime}ms`)

  expect(result.status).toBe(200)
  expect(result.h1Count).toBe(1)
})

test('About page full QA', async ({ page }) => {
  const result = await fullPageAudit(page, '/about', 'About')

  console.log('\n── About Page Sections ──')
  const sections: Array<[string, string]> = [
    ['Hero H1', 'h1'],
    ['Mission section', 'text=Mission, text=Our Mission'],
    ['Why choose us', 'text=Why Choose'],
    ['Stats section', 'text=Cars Serviced, text=Warranty'],
    ['CTA banner', 'text=Book Now, text=Book Your'],
  ]
  for (const [label, sel] of sections) {
    const visible = await page.locator(sel).first().isVisible().catch(() => false)
    console.log(`${visible ? '✅' : '❌'} ${label}`)
  }

  const bodyText = await page.locator('main').first().innerText().catch(() => '')
  for (const word of ['CarWorkshop', 'UAE', 'service', 'pickup', 'warranty']) {
    console.log(`${bodyText.toLowerCase().includes(word.toLowerCase()) ? '✅' : '❌'} Mentions: ${word}`)
  }

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
  console.log(`${schemas.some(s => s.includes('Organization') || s.includes('LocalBusiness')) ? '✅' : '❌'} Organization schema`)

  expect(result.status).toBe(200)
  expect(result.h1Count).toBe(1)
  expect(result.contentLength).toBeGreaterThan(200)
})

test('Blog page full QA', async ({ page }) => {
  const result = await fullPageAudit(page, '/blog', 'Blog')

  const postLinks = page.locator('a[href^="/blog/"]')
  const postCount = await postLinks.count()
  console.log(`\nBlog post links found: ${postCount}`)
  console.log(postCount > 0 ? `✅ ${postCount} posts` : '❌ NO BLOG POSTS VISIBLE')

  if (postCount > 0) {
    const firstHref = await postLinks.first().getAttribute('href')
    console.log(`Opening first post: ${firstHref}`)
    await postLinks.first().click()
    await page.waitForLoadState('networkidle')
    await page.screenshot({ path: `${SHOT}/blog-post-detail.png`, fullPage: true })

    const postH1 = await page.locator('h1').count()
    const postTitle = await page.title()
    const postDesc = await page.locator('meta[name="description"]').first().getAttribute('content', { timeout: 3000 }).catch(() => null)
    const postSchemas = await page.locator('script[type="application/ld+json"]').allTextContents()
    const hasArticle = postSchemas.some(s => s.includes('Article') || s.includes('BlogPosting'))
    console.log(`Post title: ${postTitle} | H1 count: ${postH1} | desc: ${!!postDesc}`)
    console.log(`${hasArticle ? '✅' : '❌'} Article/BlogPosting schema on post page`)
    expect(postH1).toBe(1)
  }

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
  const hasCollection = schemas.some(s => s.includes('CollectionPage') || s.includes('ItemList') || s.includes('Blog'))
  console.log(`${hasCollection ? '✅' : 'ℹ️'} Collection/Blog schema on listing`)

  expect(result.status).toBe(200)
})

test('Abu Dhabi location page full QA', async ({ page }) => {
  const result = await fullPageAudit(page, '/locations/abu-dhabi', 'Abu Dhabi Location')

  console.log('\n── Location Page Sections ──')
  const sections: Array<[string, string]> = [
    ['Hero H1', 'h1'],
    ['Services list', 'text=Services Available, text=Oil Change, text=Brake Repair'],
    ['FAQ section', 'details, text=Common Questions'],
    ['CTA banner', 'text=Book Now, text=Book Your'],
    ['Location pills', 'a[href*="/locations/dubai"]'],
  ]
  for (const [label, sel] of sections) {
    const visible = await page.locator(sel).first().isVisible().catch(() => false)
    console.log(`${visible ? '✅' : '❌'} ${label}`)
  }

  const bodyText = await page.locator('main').first().innerText().catch(() => '')
  console.log(`${bodyText.toLowerCase().includes('abu dhabi') ? '✅' : '❌'} Page mentions Abu Dhabi`)

  const schemas = await page.locator('script[type="application/ld+json"]').allTextContents()
  const hasLocalBusiness = schemas.some(s => s.includes('LocalBusiness'))
  const hasFaqPage = schemas.some(s => s.includes('FAQPage'))
  console.log(`${hasLocalBusiness ? '✅' : 'ℹ️'} LocalBusiness schema`)
  console.log(`${hasFaqPage ? '✅' : 'ℹ️'} FAQPage schema`)

  expect(result.status).toBe(200)
  expect(result.h1Count).toBe(1)
  expect(result.contentLength).toBeGreaterThan(200)
})

test('Final — complete QA report for all 4 pages', async ({ page }) => {
  const pages: Array<[string, string]> = [
    ['/', 'Home'],
    ['/about', 'About'],
    ['/blog', 'Blog'],
    ['/locations/abu-dhabi', 'Abu Dhabi'],
  ]
  const results = []
  for (const [path, name] of pages) {
    const resp = await page.goto(path, { waitUntil: 'domcontentloaded' })
    await page.waitForLoadState('networkidle', { timeout: 8000 }).catch(() => {})
    const attr = (sel: string, name: string) => page.locator(sel).first().getAttribute(name, { timeout: 3000 }).catch(() => null)
    results.push({
      name,
      status: resp?.status() ?? 0,
      title: await page.title(),
      h1Count: await page.locator('h1').count(),
      hasDesc: !!(await attr('meta[name="description"]', 'content')),
      canonical: !!(await attr('link[rel="canonical"]', 'href')),
      ogImage: !!(await attr('meta[property="og:image"]', 'content')),
      jsonLd: await page.locator('script[type="application/ld+json"]').count(),
      noIndex: (await attr('meta[name="robots"]', 'content') ?? '').includes('noindex'),
      hasNav: await page.locator('header').isVisible().catch(() => false),
      hasFooter: await page.locator('footer').isVisible().catch(() => false),
    })
  }

  console.log('\n════════════════════════════════════════')
  console.log('QA REPORT — 4 PAGES')
  console.log('════════════════════════════════════════')
  for (const r of results) {
    const ok = r.status === 200 && r.h1Count === 1 && r.hasDesc && r.canonical && r.jsonLd > 0 && !r.noIndex
    console.log(`${ok ? '✅' : '❌'} ${r.name.padEnd(12)} | status ${r.status} | h1:${r.h1Count} | desc:${r.hasDesc} | canon:${r.canonical} | og:${r.ogImage} | jsonLd:${r.jsonLd} | nav:${r.hasNav} | footer:${r.hasFooter}`)
  }
  const failed = results.filter(r => r.status !== 200 || r.h1Count !== 1 || !r.hasDesc || !r.canonical || r.jsonLd === 0 || r.noIndex)
  console.log(`\nPassed: ${results.length - failed.length}/4`)
  expect(failed.length).toBe(0)
})
