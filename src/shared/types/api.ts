import { z } from 'zod'

const contentStringSchema = z.string().trim().min(1)

export const benefitsSchema = z
  .object({
    title: contentStringSchema.optional(),
    description: contentStringSchema.optional(),
    benefits: z.array(contentStringSchema).default([]),
  })
  .refine(({ title, description, benefits }) => title || description || benefits.length > 0, {
    message: 'Benefits response is empty',
  })

export const tileSchema = z.object({
  title: z.string().trim().min(1),
  text: z.string().trim().min(1),
})

export const tasksSchema = z
  .object({
    description: contentStringSchema.optional(),
    tiles: z.array(tileSchema).default([]),
  })
  .refine(({ description, tiles }) => description || tiles.length > 0, {
    message: 'Tasks response is empty',
  })

export const multiplyItemSchema = z.object({
  title: z.string().trim().min(1),
  steps: z.object({
    step_1: z.string().trim().min(1),
    step_2: z.string().trim().min(1),
  }),
})

export const multiplySchema = z.array(multiplyItemSchema).min(1)

export const contactMethodSchema = z.enum(['telegram', 'whatsapp', 'email'])

export const contactFormRequestSchema = z.object({
  name: z.string().trim().min(1).optional(),
  method: contactMethodSchema,
  contact: z.string().trim().min(1),
})

export const contactFormResponseSchema = z.object({
  message: z.string(),
  data: contactFormRequestSchema,
})

export type Benefits = z.infer<typeof benefitsSchema>
export type Tile = z.infer<typeof tileSchema>
export type Tasks = z.infer<typeof tasksSchema>
export type MultiplyItem = z.infer<typeof multiplyItemSchema>
export type Multiply = z.infer<typeof multiplySchema>
export type ContactMethod = z.infer<typeof contactMethodSchema>
export type ContactFormRequest = z.infer<typeof contactFormRequestSchema>
export type ContactFormResponse = z.infer<typeof contactFormResponseSchema>
