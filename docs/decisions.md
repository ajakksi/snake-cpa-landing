# Architecture Decisions

### TanStack Query for server state

API data is stored in TanStack Query rather than a global client-state store. Query keys include the locale (`[resource, locale]`), so English, Russian, and Ukrainian responses are cached independently. The stale time is five minutes.

### Safe retries belong to TanStack Query

Axios performs a request once and is responsible only for transport concerns such as the base URL, API key, timeout, and error normalization. Query retry policy is centralized in TanStack Query, where request intent is known.

Only network failures, timeouts, and `5xx` responses are retried. The maximum is three retries with delays of 1, 2, and 4 seconds. `4xx` responses are not retried. Mutating contact-form POST requests are never repeated automatically because a response may be lost after the server has already accepted the submission.

### Zod at the API boundary

API data is treated as `unknown` until it is parsed by a Zod schema. Types are inferred from the same schemas, preventing runtime validation and TypeScript contracts from drifting apart.

The `Tasks` and `Benefits` schemas accept independently useful content. Valid fields remain renderable when another optional field is absent, while completely empty responses are rejected. `Multiply` and contact-form responses stay strict because their fields are interdependent.

### Content preloading

`usePreloaderReady` starts the `tasks`, `benefits`, and `multiply` requests in parallel. The preloader finishes after every request reaches either success or error. Sections use the same query keys and reuse cached requests.

### Normalizing `multiply.title`

The API does not provide a separate stable identifier:

- `en`: `title: "for_media_buyers"`;
- localized responses may contain a translated title instead of a stable key.

The array order may also change. Therefore, `resolveTabKey` accepts a stable key directly or matches a localized `title` against translations for `tabKeys`. The resulting key associates the API item with the correct tab label and CTA.

The index fallback is used only for an unknown or missing `title`. The preferred backend contract is:

```json
{
  "key": "for_media_buyers",
  "title": "Media buyers",
  "steps": {}
}
```

### Localization from two sources

Content data comes from localized API endpoints using the locale codes `en`, `ru`, and `ua`. System messages, navigation, form labels, tab labels, CTAs, and the 404 page live in i18next. English uses `/`; Russian and Ukrainian use `/ru` and `/ua`.

This split remains until the backend contract is unified.

### Desktop and mobile interaction modes

Desktop viewports use full-page section navigation and GSAP reveal/exit animations. Mobile devices use native document scrolling and do not run resource-intensive section animations. The background grid remains part of the mobile design, together with its lightweight CSS flashlight effect. The switching hero text and marquee also continue to animate.

The device hooks combine width with touch and hover media queries rather than relying on width alone. Components that are specifically tied to the 1024px animation breakpoint still enforce that breakpoint locally.

### Native dialog for the contact modal

The contact modal uses the native `<dialog>` element instead of a custom focus-trap implementation. This provides modal focus handling, Escape support, and focus restoration without an additional runtime dependency. Backdrop clicks are handled explicitly by the component.

### Tailwind CSS and SCSS Modules

Tailwind handles most responsive utility styling. SCSS Modules remain for visually complex components and animations. Shared design tokens are defined as CSS variables.
