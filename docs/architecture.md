# Architecture

`snake-cpa-landing` is a responsive single-page landing application built with React and TypeScript. Localized content is loaded from an external REST API, while UI text is stored in local i18next resources.

The main stack is React 19, TypeScript, Vite, React Router, TanStack Query, Axios, i18next, React Hook Form, Zod, Tailwind CSS, SCSS Modules, and GSAP.

### Project structure

```text
src/
├── app/        # application configuration and routes
├── pages/      # Home and NotFound pages
├── sections/   # major landing-page sections
├── shared/     # API, components, hooks, i18n, types, and utilities
├── assets/     # images, icons, and fonts
├── styles/     # global styles and CSS variables
└── main.tsx    # entry point and global providers
```

Section-specific data and utilities remain within their section. Reusable components and infrastructure belong to `shared`. Path aliases (`@pages`, `@sections`, `@components`, `@api`, and others) are configured for the main directories.

### Application composition

`main.tsx` installs global styles, i18next, TanStack Query, and React Router. `App.tsx` defines the home route `/` and a 404 fallback route.

The application has two pages:

- `Home` — the main landing page; owns the contact modal and the loading of primary content;
- `NotFound` — the fallback page for unknown routes; displays a 404 message and a link back to the home page.

### Data and state

TanStack Query manages server state. The locale is part of each query key, so English and Russian responses are cached independently.

```text
Section → useLocale → useQuery → endpoint → Axios client → REST API
```

The app does not use a global client-state store. Simple UI state stays in the relevant components: modal visibility, active tab, form state, and preloader state.

See [api.md](./api.md) for API contracts and [decisions.md](./decisions.md) for architectural trade-offs.

### UI and styling

Tailwind CSS handles layout, spacing, typography, and responsive behavior. SCSS Modules are used for components with more complex isolated styling. Shared colors and fonts are defined through CSS variables and the extended Tailwind theme.

Reusable elements live in `shared/components`:

- `ui` — buttons, fields, select, modal, preloader, and headings;
- `layout` — background, section shell, and footer;
- `common` — composite components such as the contact form.
