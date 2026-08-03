# Architecture Decisions

### TanStack Query for server state

API data is stored in TanStack Query rather than a global client-state store. Query keys include the locale (`[resource, locale]`), so responses for different languages are cached independently. The stale time is five minutes.

### Content preloading

`usePreloaderReady` starts the `tasks`, `benefits`, and `multiply` requests in parallel. The preloader finishes after every request reaches either success or error. Sections use the same query keys and reuse cached requests.

### Normalizing `multiply.title`

The API does not provide a separate stable identifier:

- `en`: `title: "for_media_buyers"`;
- `ru`: `title: "Медиабайерам"`.

The array order may also change. Therefore, `resolveTabKey` accepts a stable key directly or matches a localized `title` against translations for `tabKeys`. The resulting key associates the API item with the correct tab label and CTA.

The index fallback is used only for an unknown or missing `title`. The preferred backend contract is:

```json
{
  "key": "for_media_buyers",
  "title": "Медиабайерам",
  "steps": {}
}
```

### Localization from two sources

Content data comes from localized API endpoints. System messages, navigation, form labels, tab labels, and CTAs live in i18next. This split remains until the backend contract is unified.

### Tailwind CSS and SCSS Modules

Tailwind handles most responsive utility styling. SCSS Modules remain for visually complex components and animations. Shared design tokens are defined as CSS variables.
