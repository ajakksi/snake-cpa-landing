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

### Application composition and routing

`main.tsx` installs global styles and i18next, then mounts the global Error Boundary,
`HelmetProvider`, TanStack Query provider, and React Router. The Error Boundary handles unexpected
React rendering and lifecycle failures and lets the user reload the application or return home.
API and event-handler errors continue through their dedicated error flows.

`App.tsx` defines these routes:

- `/` — the English home page;
- `/:locale` — a localized home page for `ru` or `ua`;
- `*` — the localized 404 page for unknown URLs and unsupported locale prefixes.

`/en` is intentionally not a localized route because English uses the base path. Links from the 404 page preserve a supported locale when returning home.

The application has two pages:

- `Home` — owns the preloader, page background, full-page navigation, section animation triggers, and contact modal;
- `NotFound` — provides a responsive and localized 404 experience for English, Russian, and Ukrainian.

### SEO and deployment

The shared `Seo` component manages localized titles and descriptions, Open Graph and Twitter
metadata, canonical URLs, and `hreflang` links for English, Russian, and Ukrainian pages. It also
adds JSON-LD structured data to supported pages. Not-found pages use `noindex, nofollow` and do not
expose canonical, alternate, or structured-data entries.

Production builds are deployed to Vercel after the CI pipeline succeeds for a push to `main`.
Vercel rewrites incoming paths to `index.html`, allowing React Router to resolve direct visits and
page refreshes for client-side routes such as `/ru` and `/ua`.

### Data and state

TanStack Query manages server state. The locale is part of each query key, so English, Russian, and Ukrainian responses are cached independently.

```text
Section → useLocale → useQuery → endpoint → Axios → REST API
                                              ↓ response
                                      Zod validation → UI
```

All API responses cross a Zod runtime-validation boundary before they are used by components. Content sections may render independently valid parts of `Tasks` and `Benefits`; completely empty or structurally invalid responses become `ApiError` instances. The stricter `Multiply` and contact-form contracts must validate as a whole.

Retry rules are configured in TanStack Query rather than Axios. Safe queries retry network errors, timeouts, and `5xx` responses up to three times. Client errors and contact-form POST requests are not retried automatically.

The app does not use a global client-state store. UI state stays close to the relevant component: modal visibility, active tab, form state, preloader state, and animation triggers.

See [api.md](./api.md) for API contracts and [decisions.md](./decisions.md) for architectural trade-offs.

### Scrolling and animations

`FullPageScroll` controls wheel, keyboard, touch, anchor, and inner-section scrolling on desktop viewports from 1024px. Below that breakpoint, it releases the page scroll lock and uses native document scrolling.

`useDeviceType` combines viewport breakpoints with touch and hover capabilities to distinguish mobile, tablet, and desktop behavior. Resource-intensive GSAP section animations and full-page transitions are disabled on mobile. The lightweight CSS background effect, the hero switching text, and the marquee remain available; `prefers-reduced-motion` disables the background animation.

`useAnimationManager` coordinates section play, reset, and exit triggers after the preloader has completed. Individual animation hooks own their GSAP timelines and respond to the shared play/reset triggers.

### UI, accessibility, and styling

Tailwind CSS handles layout, spacing, typography, and responsive behavior. SCSS Modules are used for components with more complex isolated styling. Shared colors and fonts are defined through CSS variables and the extended Tailwind theme.

Reusable elements live in `shared/components`:

- `ui` — buttons, fields, select, native `dialog` modal, preloader, and headings;
- `layout` — animated page background, full-page scroll controller, section shell, and footer;
- `common` — composite components such as the contact form.

The native modal keeps keyboard focus inside the dialog, closes with Escape or a backdrop click, and restores focus after closing. Tab panels support arrow-key navigation as well as Home and End. Repeated marquee content is hidden from screen readers while an accessible text equivalent remains available.
