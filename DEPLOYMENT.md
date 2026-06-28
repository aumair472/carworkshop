# CarWorkshop.ae — Production Deployment Guide

This guide takes a fresh machine to a running production site at `https://carworkshop.ae`.
Follow the steps in order. Every command is copy-pasteable. The Next.js app lives in this
directory (`carworkshop/`); set this as the **Root Directory** in Vercel.

---

## Prerequisites

- **Node.js 18+** — `node -v`
- **pnpm** — `npm i -g pnpm` (project uses pnpm; `pnpm-lock.yaml` is committed)
- **Git** access to the repository
- **Accounts:** [Supabase](https://supabase.com), [Vercel](https://vercel.com),
  [Resend](https://resend.com), [Upstash](https://upstash.com) (optional),
  [Sentry](https://sentry.io) (recommended), Google Analytics (optional)
- **Domain:** `carworkshop.ae` with DNS you control

---

## Architecture Overview

```
Public visitors ──► Vercel Edge ──► Next.js (ISR / SSG) ──► Supabase (anon, RLS-enforced)
Admin users     ──► Vercel       ──► Next.js /admin     ──► Supabase (cookie session + service role)
Admin publish   ──► revalidatePage() ──────────────────► ISR cache purge (<2s)
Supabase webhook ─► POST /api/revalidate (secret-gated) ─► ISR cache purge
```

- **Public pages** use a cookieless anon Supabase client (`createPublicSupabase`) → stay
  static/ISR. RLS `public_read_*` policies only expose `status='published'` rows.
- **Admin/API** use the cookie session client (`createServerSupabase`) and service-role client
  (`createServiceClient`) — server-only, never bundled to the client.
- **Route protection** is enforced by `src/proxy.ts` (Next.js middleware) + per-route
  `getUser()` checks + Postgres RLS.

---

## Step 1 — Supabase Setup

### 1.1 Create Project
- supabase.com → **New Project**
- Name: `carworkshop-ae-production`
- Database password: generate a strong one, save it in your password manager
- Region: closest to UAE (e.g. `ap-southeast-1` Singapore)
- Create → wait ~2 minutes

### 1.2 Get Credentials — Settings → API
| Copy | → Env var |
|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| `anon` / `public` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` (**secret — server only**) |

### 1.3 Run Database Migrations
```bash
npm install -g supabase
npx supabase login
# Project ref is the subdomain in your Supabase dashboard URL
npx supabase link --project-ref <your-project-ref>
npx supabase db push          # applies supabase/migrations/001..008
npx supabase db diff          # should print no diff
ls supabase/migrations/       # 001_initial_schema … 008_seo_editor_role
```
Migrations applied (8): initial schema, RLS policies, service_location_map,
users RLS recursion fix, website_settings seed, content_json columns,
seo_json columns, seo_editor role + triggers.

### 1.4 Verify RLS is ON
Dashboard → **Table Editor** → confirm the lock icon on every table:
`brands, brand_models, services, locations, brand_service_map,
brand_model_service_map, brand_location_map, service_location_map,
generated_pages, page_templates, static_pages, blog_posts, blog_categories,
media, form_submissions, users, website_settings, audit_logs`

SQL verification (run in SQL Editor — every row must show `t`):
```sql
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' ORDER BY tablename;
```

### 1.5 Storage Bucket
Storage → **Create bucket**
- Name: `media` · Public: **YES** · File size limit: `5242880` (5 MB)
- Allowed MIME: `image/jpeg, image/png, image/webp, image/svg+xml`

Policies:
| Name | Op | Role | Using |
|---|---|---|---|
| Public read | SELECT | public | `true` |
| Auth upload | INSERT | authenticated | `true` |
| Auth delete | DELETE | authenticated | `auth.uid() IS NOT NULL` |

### 1.6 First Admin User
Authentication → Users → **Add user → Create new user**
- Email: `aumair472@gmail.com` · Password: strong · Auto-confirm: **YES**

Then SQL Editor (replace UUID from the Users table):
```sql
INSERT INTO users (id, email, full_name, role)
VALUES ('<user-uuid-from-auth-users>', 'aumair472@gmail.com', 'Umar', 'super_admin');
```

### 1.7 Website Settings
Migration `005_website_settings_data.sql` seeds the 46 base keys automatically.
Tune the rest later via **Admin → Settings** (phone, WhatsApp, footer, nav, SEO defaults).

---

## Step 2 — External Services

### 2.1 Resend (email — required for lead notifications)
- resend.com → API Keys → **Create** (`carworkshop-production`) → `RESEND_API_KEY`
- Domains → Add `carworkshop.ae` → add the SPF/DKIM/DMARC DNS records → verify (≤24 h)
- From address used by code: `noreply@carworkshop.ae` (overridable in Admin → Settings → Email)

### 2.2 Upstash Redis (rate limiting — optional)
- console.upstash.com → Create Database (`carworkshop-rate-limit`, region near UAE)
- REST API → `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- **If unset, the lead form falls back to no rate limiting** (still protected by honeypot + CSRF).

### 2.3 Sentry (error monitoring — recommended)
- sentry.io → New Project → Next.js → `carworkshop-ae`
- DSN → both `SENTRY_DSN` and `NEXT_PUBLIC_SENTRY_DSN`
- Alert: email on first occurrence of a new issue

### 2.4 Google Analytics (optional)
- analytics.google.com → property for `carworkshop.ae` → Measurement ID `G-XXXXXXXXXX`
  → `NEXT_PUBLIC_GA_MEASUREMENT_ID` (or set in Admin → Settings → SEO & Analytics)

---

## Step 3 — Generate Secrets
```bash
# REVALIDATION_SECRET (min 32 chars) — gates POST /api/revalidate
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Save the value. (No `CRON_SECRET` is required — no cron jobs are wired in this build.)

---

## Step 4 — Vercel Deployment

### 4.1 Connect Repository
- vercel.com → **Add New Project** → import the repo
- Framework: **Next.js** (auto)
- **Root Directory: `carworkshop`** ← important, the app is not at repo root
- Build Command: `pnpm build` · Output: `.next` (defaults)

### 4.2 Environment Variables (Settings → Environment Variables)
Set for **Production + Preview + Development** unless noted:

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | from 1.2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | from 1.2 |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | from 1.2 — **secret** |
| `NEXT_PUBLIC_SITE_URL` | ✅ | `https://carworkshop.ae` (per-env: use the preview URL on Preview) |
| `REVALIDATION_SECRET` | ✅ | from Step 3 |
| `RESEND_API_KEY` | ✅ | from 2.1 |
| `ADMIN_EMAIL` | ✅ | lead notification recipient |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | ⚠️ | e.g. `971XXXXXXXXX` (or set in Admin) |
| `UPSTASH_REDIS_REST_URL` | ⚠️ | rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | ⚠️ | rate limiting |
| `SENTRY_DSN` | ⚠️ rec. | server errors |
| `NEXT_PUBLIC_SENTRY_DSN` | ⚠️ rec. | client errors |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | ⛔ opt. | analytics |

`src/lib/startup-check.ts` throws on boot in production if a **required** var is missing.

### 4.3 Deploy
Click **Deploy** (~3–5 min). Expected route types in the build log:
```
○ /                 (Static / ISR)      ● /brands/[brand]       (SSG, revalidate 1d)
○ /services         (ISR 1h)            ● /services/[slug]      (SSG, 1d)
ƒ /admin/*          (Dynamic)           ƒ /api/*                (Dynamic)
```
Public pages must be `○`/`●`; only `/admin/*` and `/api/*` may be `ƒ`.

### 4.4 Custom Domain (Settings → Domains)
Add `carworkshop.ae` and `www.carworkshop.ae`. At your registrar:
```
A      @     76.76.19.19
CNAME  www   cname.vercel-dns.com
```
Vercel auto-provisions SSL. Verify:
```bash
curl -I https://carworkshop.ae    # HTTP/2 200, server: Vercel
```

---

## Step 5 — Post-Deployment Verification

```bash
curl -I https://carworkshop.ae                       # 200
curl -I https://carworkshop.ae/admin                 # 302 → /admin/login
curl -s -o /dev/null -w "%{http_code}\n" \
     https://carworkshop.ae/api/admin/brands         # 401
curl -s https://carworkshop.ae/robots.txt            # Disallow: /admin/  + sitemap-index
curl -s https://carworkshop.ae/sitemap-index.xml     # valid XML <sitemapindex>
curl -I https://carworkshop.ae/brands/audi           # x-nextjs-cache: MISS, then HIT on 2nd
```
- Log in at `https://carworkshop.ae/admin/login` with the Step 1.6 credentials.
- **Seed content** in admin: Brands (+ models, assign services/locations) → Services →
  Locations → **Pages → Generate** → select all → Generate → Bulk Publish.

### 5.1 Google Search Console
search.google.com/search-console → add property `https://carworkshop.ae` → verify via DNS TXT
→ Sitemaps → submit `https://carworkshop.ae/sitemap-index.xml`.

### 5.2 Monitoring
Sentry alert > 5 errors/hr · Vercel deployment notifications · Supabase DB-size alert at 80 %.

---

## Step 6 — Supabase Webhooks (instant ISR on publish)

Admin saves already call `revalidatePage()` directly, so webhooks are a **belt-and-suspenders**
backup for direct DB edits. Dashboard → **Database → Webhooks → Create**:

Common settings — URL `https://carworkshop.ae/api/revalidate`, method POST, headers
`x-revalidation-secret: <REVALIDATION_SECRET>` + `Content-Type: application/json`.

| Webhook | Table | Events | Payload |
|---|---|---|---|
| revalidate-brands | brands | UPDATE | `{"type":"brand","slug":"{{record.slug}}"}` |
| revalidate-services | services | UPDATE | `{"type":"service","slug":"{{record.slug}}"}` |
| revalidate-locations | locations | UPDATE | `{"type":"location","slug":"{{record.slug}}"}` |
| revalidate-generated | generated_pages | UPDATE | `{"type":"generated","slug":"{{record.slug}}"}` |
| revalidate-blog | blog_posts | UPDATE | `{"type":"blog","slug":"{{record.slug}}"}` |
| revalidate-static | static_pages | UPDATE | `{"type":"static","slug":"{{record.slug}}"}` |

Test: each webhook → **Send test** → expect Vercel function log `revalidated:true`.
Manual purge-all escape hatch:
```bash
curl -X POST https://carworkshop.ae/api/revalidate \
  -H "x-revalidation-secret: <SECRET>" -H "Content-Type: application/json" \
  -d '{"type":"all"}'
```

---

## Step 7 — Performance Verification
```bash
npx lighthouse https://carworkshop.ae --only-categories=performance,seo,accessibility --view
```
Targets: Performance ≥ 85 · SEO 100 · Accessibility ≥ 90.
Core Web Vitals (Search Console, after 28 days): LCP < 2.5s · CLS < 0.1 · FCP < 1.5s.

---

## Step 8 — Environment Variables Reference
See `.env.example` (committed). Required in production: `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`,
`REVALIDATION_SECRET`, `RESEND_API_KEY`, `ADMIN_EMAIL`. Recommended: Sentry DSNs, Upstash,
WhatsApp number. Optional: GA measurement ID.

---

## Step 9 — Rollback

- **Vercel instant rollback (preferred):** Deployments → last good → ⋯ → **Promote to
  Production** (~30 s).
- **Git revert:** `git revert HEAD && git push origin main` → auto-deploys.
- **DB migration issue:** revert the offending change in SQL Editor. Avoid
  `supabase db reset` against production — it destroys data.

---

## Step 10 — Maintenance

**Weekly:** review Sentry, Vercel analytics, new leads (`/admin/leads`).
**Monthly:** `pnpm audit`, check Supabase DB size, re-run Lighthouse, `pnpm update`.

**Content:** Blog `/admin/blog` · Service/Brand pages → edit → Page Content tab → Publish ·
new combinations → `/admin/pages/generate`.

**Adding an env var:** add to `.env.local` → `.env.example` → Vercel (Prod+Preview) →
`src/lib/startup-check.ts` required/recommended list → redeploy.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| `JWT expired` in admin | Session timed out — log out/in. Check Supabase JWT expiry. |
| ISR not updating after publish | Confirm `REVALIDATION_SECRET` matches in Vercel & webhook; `/api/revalidate` must return 200 not 401. Use the `type:"all"` curl above. |
| Generated page 404 | `generated_pages.status` must be `published`; re-run Generate → Bulk Publish. |
| RLS blocking a query | Verify the `public_read_*`/role policy exists; check user `role` in `users`. |
| Vercel build fails | Reproduce with `pnpm build` locally; confirm all env vars set; Root Directory = `carworkshop`. |
| Emails not sending | Check `RESEND_API_KEY`, verified From domain, Resend send logs. |
| Rate limiting too strict | Tune `src/lib/rate-limit.ts`; inspect Upstash request counts. |

---

_Last audited: 2026-06-29 — secrets scan clean, no secrets in client bundle, admin routes gated,
all public pages have `generateMetadata` + `revalidate`, 7 security headers present, `pnpm tsc`/
`pnpm lint`/`pnpm build` all green._
