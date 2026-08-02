# CPA Snake Landing

A responsive CPA landing page built with React, TypeScript, and Vite. The application loads localized content from a REST API and supports English and Russian UI translations.

## Getting started

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
