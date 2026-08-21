# API Contracts

The API client uses these environment variables:

```env
VITE_API_URL
VITE_API_KEY
```

Axios attaches `x-api-key` to every request and uses a 45-second timeout. Localized paths follow the `/{locale}/{resource}` format. The API locale codes used by the application are `en`, `ru`, and `ua`.

Axios does not retry requests. Retry behavior is configured centrally in TanStack Query for safe query requests; see [Error handling and retries](#error-handling-and-retries).

### Endpoints

| Method | Path                 | Purpose                                 |
| ------ | -------------------- | --------------------------------------- |
| GET    | `/{locale}/tasks`    | Task description and cards              |
| GET    | `/{locale}/benefits` | Benefits heading, description, and list |
| GET    | `/{locale}/multiply` | Collaboration options and steps         |
| POST   | `/form`              | Contact form submission                 |

### Runtime validation

API contracts are defined as Zod schemas in `src/shared/types/api.ts`. TypeScript types are inferred from the schemas with `z.infer`, so the runtime validation rules and compile-time types have a single source of truth.

GET endpoints request `unknown` data and pass each response through `parseApiResponse`. An invalid response is logged for diagnostics and converted to `ApiError('Invalid server response')` before it reaches the UI.

#### Tasks

```ts
type Tile = {
  title: string
  text: string
}

type Tasks = {
  description?: string
  tiles: Tile[]
}
```

`description` and `tiles` may be returned independently. Missing `tiles` are normalized to an empty array. A response without both a non-empty description and valid tiles is rejected as empty.

#### Benefits

```ts
type Benefits = {
  title?: string
  description?: string
  benefits: string[]
}
```

The heading, description, and benefits list may be returned independently. Missing benefits are normalized to an empty array. A response in which all three parts are missing or empty is rejected.

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

`Multiply` remains strict because an item without its title or steps cannot be rendered meaningfully. The response must contain at least one valid item.

The `title` field has inconsistent formats across locales. The current frontend workaround is documented in [decisions.md](./decisions.md).

#### Contact form

```ts
type ContactFormRequest = {
  name?: string
  method: 'telegram' | 'whatsapp' | 'email'
  contact: string
}

type ContactFormResponse = {
  message: string
  data: ContactFormRequest
}
```

Leading and trailing whitespace is removed before submission. If the optional `name` field is empty, it is omitted. The normalized payload is validated with `contactFormRequestSchema` before the POST request, and the server response is validated with `contactFormResponseSchema`.

### Error handling and retries

Axios failures are converted to `ApiError`, which stores the HTTP status and timeout/network flags. The UI receives a safe user-facing message through `getApiErrorMessage`.

TanStack Query automatically retries query requests only for:

- network failures;
- timeouts;
- server responses with a `5xx` status.

At most three retries are performed, with increasing delays of 1, 2, and 4 seconds. Client errors (`4xx`) are not retried. The contact form POST request is never repeated automatically, preventing a submission from being duplicated when the server response is lost.

Sections expose a manual retry action only for retryable network, timeout, and `5xx` failures. React rendering and lifecycle errors are handled separately by the global Error Boundary.
