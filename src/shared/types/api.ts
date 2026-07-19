// Benefits endpoint
export interface Benefits {
  title: string
  description: string
  benefits: string[]
}

// Tasks endpoint
export interface Tile {
  title: string
  text: string
}

export interface Tasks {
  description: string
  tiles: Tile[]
}

// Multiply endpoint
export interface MultiplyItem {
  title: string
  steps: {
    step_1: string
    step_2: string
  }
}

export type Multiply = MultiplyItem[]

// Contact form request & response
export type ContactMethod = 'telegram' | 'whatsapp' | 'email'

export interface ContactFormRequest {
  name?: string
  method: ContactMethod
  contact: string
}

export interface ContactFormResponse {
  message: string
  data: ContactFormRequest
}
