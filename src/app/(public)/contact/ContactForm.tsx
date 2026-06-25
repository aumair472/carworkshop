'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

const SERVICE_OPTIONS = [
  { value: 'oil-change', label: 'Oil Change' },
  { value: 'brake-service', label: 'Brake Service' },
  { value: 'car-ac-repair', label: 'Car AC Repair' },
  { value: 'engine-diagnostics', label: 'Engine Diagnostics' },
  { value: 'tyre-change', label: 'Tyre Change' },
  { value: 'other', label: 'Other' },
]

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    if (data['honeypot']) {
      setStatus('success')
      return
    }

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const body = await res.json() as { error?: string }
        throw new Error(body.error ?? 'Something went wrong')
      }

      setStatus('success')
      form.reset()
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    }
  }

  return (
    <div>
      <div className="bg-[#F0F4FF] py-10 border-b border-[#C7D9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-4">Get a Free Quote</h1>
          <p className="text-[#6B7280] mt-2">Fill in the form and we&apos;ll get back to you within 30 minutes.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            {status === 'success' ? (
              <Alert variant="success" title="Quote Request Received!">
                Thank you! Our team will call you within 30 minutes.
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <input type="text" name="honeypot" className="hidden" aria-hidden="true" tabIndex={-1} autoComplete="off" />

                {status === 'error' && (
                  <Alert variant="danger">{errorMsg}</Alert>
                )}

                <Input label="Full Name" name="name" required placeholder="Ahmed Al Mansouri" autoComplete="name" />
                <Input label="Phone Number" name="phone" type="tel" required placeholder="+971 50 123 4567" autoComplete="tel" />
                <Input label="Email" name="email" type="email" placeholder="ahmed@example.com" autoComplete="email" />
                <Input label="Car Make & Model" name="car_model" required placeholder="e.g. BMW 5 Series 2021" />
                <Select label="Service Required" name="service_type" options={SERVICE_OPTIONS} placeholder="Select a service" required />
                <Textarea label="Additional Details" name="message" placeholder="Describe the issue or request..." maxLength={500} charCount />

                <Button type="submit" variant="primary" size="lg" fullWidth loading={status === 'loading'}>
                  Get My Free Quote
                </Button>

                <p className="text-xs text-[#9CA3AF] text-center">
                  By submitting you agree to our{' '}
                  <a href="/privacy" className="underline hover:text-[#4472C4]">Privacy Policy</a>.
                  We never share your data.
                </p>
              </form>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-[#1F2937] mb-4">Contact Information</h2>
              <div className="space-y-3 text-sm text-[#374151]">
                <a href="tel:+971501234567" className="flex items-center gap-3 hover:text-[#4472C4]">
                  <span className="w-8 h-8 rounded-full bg-[#EEF3FB] flex items-center justify-center text-[#4472C4]">📞</span>
                  +971 50 123 4567
                </a>
                <a href="https://wa.me/971501234567" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 hover:text-[#4472C4]">
                  <span className="w-8 h-8 rounded-full bg-[#EEF3FB] flex items-center justify-center text-[#4472C4]">💬</span>
                  WhatsApp Chat
                </a>
                <a href="mailto:info@carworkshop.ae" className="flex items-center gap-3 hover:text-[#4472C4]">
                  <span className="w-8 h-8 rounded-full bg-[#EEF3FB] flex items-center justify-center text-[#4472C4]">✉️</span>
                  info@carworkshop.ae
                </a>
              </div>
            </div>

            <div className="bg-[#F9FAFB] rounded-lg p-5 border border-[#E5E7EB]">
              <h3 className="font-bold text-[#1F2937] mb-3">Operating Hours</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Monday – Saturday</dt>
                  <dd className="font-medium text-[#1F2937]">8:00 AM – 9:00 PM</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6B7280]">Sunday</dt>
                  <dd className="font-medium text-[#1F2937]">9:00 AM – 7:00 PM</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
