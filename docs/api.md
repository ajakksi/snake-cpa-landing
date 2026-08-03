# API Contracts

The API client uses these environment variables:

```env
VITE_API_URL
VITE_API_KEY
```

Axios attaches `x-api-key` to every request, uses a 45-second timeout, and retries network errors up to three times with a one-second delay. Localized paths follow the `/{locale}/{resource}` format.

### Endpoints

| Method | Path                 | Purpose                                 |
| ------ | -------------------- | --------------------------------------- |
| GET    | `/{locale}/tasks`    | Task description and cards              |
| GET    | `/{locale}/benefits` | Benefits heading, description, and list |
| GET    | `/{locale}/multiply` | Collaboration options and steps         |
| POST   | `/form`              | Contact form submission                 |

#### Tasks

```ts
interface Tasks {
  description: string
  tiles: Array<{ title: string; text: string }>
}
```

#### Benefits

```ts
interface Benefits {
  title: string
  description: string
  benefits: string[]
}
```

#### Multiply

```ts
type Multiply = Array<{
  title: string
  steps: {
    step_1: string
    step_2: string
  }
}>
```

The `title` field has inconsistent formats across locales. The current frontend workaround is documented in [decisions.md](./decisions.md).

#### Contact form

```ts
interface ContactFormRequest {
  name?: string
  method: 'telegram' | 'whatsapp' | 'email'
  contact: string
}

interface ContactFormResponse {
  message: string
  data: ContactFormRequest
}
```

Leading and trailing whitespace is removed before submission. If the optional `name` field is empty, it is not sent to the API.

### Errors

Axios failures are converted to `ApiError`, which stores the HTTP status and timeout/network flags. The UI receives a safe user-facing message through `getApiErrorMessage`.
