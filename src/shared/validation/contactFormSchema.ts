import { z } from 'zod'

export const contactMethods = [
  { label: 'Telegram', value: 'telegram' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Email', value: 'email' },
] as const

export const contactMethodValues = ['telegram', 'whatsapp', 'email'] as const

export const contactFormSchema = z.object({
  name: z.string().trim().optional(),
  method: z.union([z.literal(''), z.enum(contactMethodValues)]).refine((value) => value !== '', {
    message: 'Please choose a contact method',
  }),
  contact: z.string().trim().min(1, 'Please enter your contact details'),
})

export type ContactFormValues = z.input<typeof contactFormSchema>
