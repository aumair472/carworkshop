import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServerSupabase } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

// Sends a test email to the configured admin address using stored email settings.
export async function POST() {
  try {
    const supabase = await createServerSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const service = createServiceClient()
    const { data } = await service.from('website_settings').select('key, value')
    const map = Object.fromEntries((data ?? []).map(s => [s.key, typeof s.value === 'string' ? s.value : '']))

    const provider = map.email_provider || 'resend'
    const adminEmail = map.admin_email || process.env.ADMIN_EMAIL || ''
    if (!adminEmail) return NextResponse.json({ error: 'No admin email configured' }, { status: 400 })

    if (provider !== 'resend') {
      return NextResponse.json({ error: 'Test email currently supports the Resend provider only.' }, { status: 400 })
    }

    const apiKey = map.resend_api_key || process.env.RESEND_API_KEY || ''
    if (!apiKey) return NextResponse.json({ error: 'Resend API key not set' }, { status: 400 })

    const fromEmail = map.resend_from_email || 'noreply@carworkshop.ae'
    const fromName = map.resend_from_name || 'CarWorkshop.ae'

    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      from: `${fromName} <${fromEmail}>`,
      to: adminEmail,
      subject: 'CarWorkshop.ae — Test Email',
      html: '<h2>Test email</h2><p>Your email settings are working correctly. ✅</p>',
    })
    if (error) return NextResponse.json({ error: error.message ?? 'Send failed' }, { status: 502 })

    return NextResponse.json({ success: true, sentTo: adminEmail })
  } catch (err) {
    console.error('POST /api/admin/settings/test-email:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
