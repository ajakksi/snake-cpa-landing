# CPA Snake Landing

A responsive CPA landing page built with React, TypeScript, and Vite. The application loads localized content from a REST API and supports English and Russian UI translations.

## Getting started

The project uses Node.js 24 LTS (`>=24 <25`). With nvm, activate it before installing
dependencies:

```bash
nvm install 24
nvm use 24
```

Install dependencies:

1. Create a `.env` file based on `.env.example` and add the API key provided by the team.
2. Install dependencies and start the development server:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run type-check` — run TypeScript checks
- `npm run lint` — run ESLint
- `npm run preview` — preview the production build

## End-to-end tests

Tests are split into three levels:

- `npm run test:unit` runs unit and isolated component tests;
- `npm run test:integration` runs files named `*.integration.test.*`;
- `npm run test:e2e` runs Playwright tests after building the production bundle.

The CI pipeline runs these levels sequentially and stops before the next, more expensive level if
an earlier level fails.

Install Chromium once after installing project dependencies:

```bash
npm run playwright:install
```

Run the end-to-end tests with `npm run test:e2e`. Use `npm run test:e2e:ui` while developing and
debugging tests in Playwright UI Mode.

Playwright builds the application in `test` mode, which loads `.env.test`, and serves the
production bundle on `http://127.0.0.1:4173`. The shared fixture in `e2e/fixtures` intercepts REST
API requests, so tests do not require the external API or a real API key. HTML reports are written
to `playwright-report`; traces, screenshots, and videos for failed tests are stored in
`test-results`.

## Documentation

- [Project requirements](docs/requirements.md)
- [Architecture](docs/architecture.md)
- [API contracts](docs/api.md)
- [Architecture decisions](docs/decisions.md)

## Tech stack

- React 19 and TypeScript
- Vite
- React Router
- TanStack Query and Axios
- i18next and react-i18next
- React Hook Form and Zod
- Tailwind CSS and SCSS Modules
- GSAP
