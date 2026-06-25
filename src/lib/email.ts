import { Resend } from 'resend'

const FROM = 'CarWorkshop.ae <noreply@carworkshop.ae>'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'info@carworkshop.ae'

function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

interface LeadNotificationParams {
  name: string
  phone: string
  email?: string | null
  message?: string | null
  sourcePageSlug?: string | null
}

export async function sendLeadNotification(lead: LeadNotificationParams): Promise<void> {
  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to: ADMIN_EMAIL,
    subject: `New Lead: ${lead.name} — ${lead.phone}`,
    html: `
      <h2>New Quote Request</h2>
      <table>
        <tr><td><strong>Name</strong></td><td>${lead.name}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${lead.phone}</td></tr>
        ${lead.email ? `<tr><td><strong>Email</strong></td><td>${lead.email}</td></tr>` : ''}
        ${lead.message ? `<tr><td><strong>Message</strong></td><td>${lead.message}</td></tr>` : ''}
        ${lead.sourcePageSlug ? `<tr><td><strong>Source page</strong></td><td>${lead.sourcePageSlug}</td></tr>` : ''}
      </table>
    `,
  })
}

export async function sendLeadConfirmation(to: string, name: string): Promise<void> {
  const resend = getResend()
  if (!resend) return

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'We received your request — CarWorkshop.ae',
    html: `
      <h2>Hi ${name},</h2>
      <p>Thank you for your request. Our team will call you within <strong>30 minutes</strong> during business hours.</p>
      <p>If you need urgent assistance, call us at <a href="tel:+971501234567">+971 50 123 4567</a> or WhatsApp.</p>
      <p>— The CarWorkshop.ae Team</p>
    `,
  })
}
