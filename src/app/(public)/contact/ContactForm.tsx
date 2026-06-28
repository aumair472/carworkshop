'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

interface NamedOption { id: string; name: string }

interface ContactFormProps {
  heading?: string
  subheadline?: string
  successMessage?: string
  showService?: boolean
  showBrand?: boolean
  services?: NamedOption[]
  brands?: NamedOption[]
}

export function ContactForm({
  heading = 'Get a Free Quote',
  subheadline = "Fill in the form and we'll get back to you within 30 minutes.",
  successMessage = 'Thank you! Our team will call you within 30 minutes.',
  showService = true,
  showBrand = false,
  services = [],
  brands = [],
}: ContactFormProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>

    if (data['honeypot']) {
      setStatus('success')
      return
    }

    // Strip optional UUID fields when left unselected — the API validates them
    // as UUIDs and rejects empty strings.
    for (const key of ['service_id', 'brand_id'] as const) {
      if (!data[key]) delete data[key]
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
      <div className="bg-mesh py-8 border-b border-hairline">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1F2937] mt-4">{heading}</h1>
          <p className="text-[#6B7280] mt-2">{subheadline}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {status === 'success' ? (
          <Alert variant="success" title="Quote Request Received!">
            {successMessage}
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
            {showService && services.length > 0 && (
              <Select label="Service Required" name="service_id" options={services.map(s => ({ value: s.id, label: s.name }))} placeholder="Select a service (optional)" />
            )}
            {showBrand && brands.length > 0 && (
              <Select label="Car Brand" name="brand_id" options={brands.map(b => ({ value: b.id, label: b.name }))} placeholder="Select a brand (optional)" />
            )}
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
    </div>
  )
}
