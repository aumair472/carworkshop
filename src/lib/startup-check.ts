// Surfaces missing environment variables on server startup instead of letting
// features fail silently. Critical vars throw in production (fail fast); the
// rest only warn so an optional integration being unset never crashes a deploy.

const CRITICAL = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SITE_URL',
  'REVALIDATION_SECRET',
] as const

const RECOMMENDED = [
  'RESEND_API_KEY',
  'ADMIN_EMAIL',
  'SENTRY_DSN',
] as const

export function checkRequiredEnvVars(): void {
  const missingCritical = CRITICAL.filter(k => !process.env[k])
  const missingRecommended = RECOMMENDED.filter(k => !process.env[k])

  if (missingRecommended.length > 0) {
    console.warn('⚠️  Missing recommended environment variables:')
    missingRecommended.forEach(k => console.warn(`   - ${k}`))
  }

  if (missingCritical.length > 0) {
    console.error('❌ Missing required environment variables:')
    missingCritical.forEach(k => console.error(`   - ${k}`))
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing env vars: ${missingCritical.join(', ')}`)
    }
  } else {
    console.log('✅ All required environment variables are set')
  }
}
