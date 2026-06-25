import { z } from 'zod'

export const CreateLeadSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  phone: z.string()
    .regex(/^\+?[0-9]{7,15}$/, 'Invalid phone number')
    .trim(),
  email: z.string().email('Invalid email').toLowerCase().trim().optional().or(z.literal('')).transform(v => v === '' ? undefined : v),
  service_id: z.string().uuid().optional(),
  brand_id: z.string().uuid().optional(),
  model_id: z.string().uuid().optional(),
  location_id: z.string().uuid().optional(),
  message: z.string().max(2000).trim().optional(),
  honeypot: z.string().max(0, 'Bot detected').default(''),
  source_page_slug: z.string().max(500).optional(),
})

export const UpdateLeadStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'in_progress', 'converted', 'closed']),
  notes: z.string().max(2000).optional(),
})

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>
export type UpdateLeadStatusInput = z.infer<typeof UpdateLeadStatusSchema>
