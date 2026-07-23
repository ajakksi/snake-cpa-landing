import { z } from 'zod'
import type { TFunction } from 'i18next'

export const contactMethods = [
  { label: 'Telegram', value: 'telegram' },
  { label: 'WhatsApp', value: 'whatsapp' },
  { label: 'Email', value: 'email' },
] as const

export const contactMethodValues = ['telegram', 'whatsapp', 'email'] as const

export const createContactFormSchema = (t: TFunction<'contactForm'>) =>
  z.object({
    name: z.string().trim().optional(),
    method: z.union([z.literal(''), z.enum(contactMethodValues)]).refine((value) => value !== '', {
      message: t('errors.contactMethodRequired'),
    }),
    contact: z.string().trim().min(1, t('errors.contactRequired')),
  })

export type ContactFormSchema = ReturnType<typeof createContactFormSchema>
export type ContactFormValues = z.input<ContactFormSchema>
