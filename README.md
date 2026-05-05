# MD Docs

MD Docs is a Bun-first SvelteKit app that serves a documentation folder and renders Markdown as a full docs website.

It includes a typed Markdown pipeline, TOC/sidebar navigation, configurable sidebar menus, syntax highlighting, Mermaid, KaTeX, responsive image optimization, and runtime templating for dynamic docs content.

## Highlights

- Bun runtime with `@eslym/sveltekit-adapter-bun`.
- File-backed docs server at `/docs/*` with deterministic path resolution.
- Markdown reader UI at `/<path>` with generated heading IDs and table of contents.
- Configurable app menu via docs root `.menu.json`/`.menu.yml` and per-page `menu` frontmatter.
- Mermaid diagrams, Shiki syntax highlighting, and KaTeX math rendering.
- On-demand image transforms (`?w=<width>&f=<format>`) and automatic `<picture>`/`srcset` generation.
- Runtime customization via `docs/.setup` and per-file headers via `.<filename>.headers.json`.

## Tech stack

- Runtime: Bun
- Framework: SvelteKit (Svelte 5, runes mode)
- UI: Tailwind CSS + shadcn-svelte
- Markdown parser: [`@eslym/markdown`](https://github.com/eslym/markdown)

## Quick start

1. Install dependencies:

```sh
bun install
```

2. Start the dev server:

```sh
bun run dev
```

3. Build for production:

```sh
bun run build
```

## Daily commands

```sh
bun run dev
bun run build
bun run check
bun run lint
bun run format
```

No dedicated test runner is configured in this repo. Use `check` + `lint` for verification.

## How routing works

There are two request surfaces:

- `GET /docs/<path>`: raw file endpoint (with optional `.hbs` rendering and image optimization).
- `GET /<path>`: docs reader UI page that fetches `/docs/<path>` and renders Markdown.

### Docs file resolution order

For a request path, docs are resolved in this order:

1. exact path
2. `path.md`
3. `path/index.md`

For text-like files, Handlebars variants are also considered (`.hbs`), for example:

- `guide.md.hbs`
- `guide/index.md.hbs`

Examples:

- `/` -> `index.md`
- `/guide` -> `guide.md` or `guide/index.md`

## Markdown behavior

MD Docs transforms parsed markdown before rendering:

- Auto title from first `# heading` when frontmatter `title` is missing.
- Auto description from `:::description ...` directive when `description` is missing.
- Stable heading IDs (GitHub-like slugs), with `:setId{id=custom-id}` or `:setId{#custom-id}` override support.
- Optional table of contents from headings (`toc: true` or `toc.startDepth`).
- Optional per-page sidebar menu via frontmatter `menu` (merged with global menu config when present).
- Footnote links/back-links wiring.
- Figure shorthand: paragraph containing only an image followed by a blockquote becomes `<figure><img/><figcaption/></figure>`.

### Frontmatter

Supported frontmatter keys:

```yaml
---
title: Integration Guide
description: API integration steps
toc: true
# optional page-specific menu section
# menu:
#   title: Quick Links
#   items:
#     - title: API Reference
#       href: /api
#     - title: Community
#       href: https://example.com/community
# or:
# toc:
#   startDepth: 2
---
```

`menu` supports either a single group or a list of groups. Each group has:

- `title`
- `items` (single item or list)
  - link item: `title`, `href`, optional `target` (`_self`, `_blank`, `_parent`, `_top`)
  - nested item: `title`, `items` (single sub-item or list)

## Directives

Built-in directives include:

- `:::tabs` container with `:::tab` children (`title` required, optional `id` used as tab value identity, not DOM element `id`).
- `:checkbox{checked=true}` text directive.
- `:::section{id=print-section}` container (print/page-break friendly section wrapper).
- `::pageBreak` leaf directive.
- `:::description` container for deriving document description.

Unknown directives still render with `data-directive="..."` wrappers for graceful fallback.

Example:

````md
:::tabs{store=session key=platform}
:::tab{title="Bun" id=bun}

```sh
bun run dev
```
````

:::

:::tab{title="Node.js" id=node}

```sh
npm run dev
```

:::
:::

````

## `/docs/*` endpoint behavior

`GET /docs/<path>`:

- Returns resolved file content.
- Requests targeting dot/hidden paths (for example segments containing `/.`) return `404`.
- Sets `Content-Location` to the resolved docs path.
- Applies `Cache-Control` (global env or per-file override).
- Emits ETag and supports `If-None-Match` -> `304` responses.

Optional image optimization query params:

- `w=<number|auto>` width resize.
- `f=<avif|jpeg|png|webp|auto>` output format.

Notes:

- SVG is not rasterized when `f=auto`.
- `?w`/`?f` are ignored unless at least one is valid.

### Per-file headers sidecar

Add a sidecar JSON file named `.<base>.headers.json` next to any docs file to inject/override response headers.

Example for `guide.md`:

```text
docs/guide.md
docs/.guide.md.headers.json
````

Example sidecar:

```json
{
	"Cache-Control": "public, max-age=300"
}
```

## Sidebar menu configuration

You can define a global menu for the docs reader sidebar using one of these files in the docs root:

- `docs/.menu.json`
- `docs/.menu.yml`
- `docs/.menu.yaml`

File content uses the same schema as frontmatter `menu` (single group or array of groups).

Merge behavior:

- If both frontmatter `menu` and root `.menu.*` are present, both are rendered.
- Per-page frontmatter `menu` groups are rendered first, then global `.menu.*` groups.

Link behavior:

- Internal URLs default to `target="_self"`.
- External URLs default to `target="_blank"`.
- You can override with explicit `target` on any menu link item.

## Handlebars templating (`.hbs`)

Text files can be authored as Handlebars templates by using `.hbs` suffix (for example `page.md.hbs`).

Template context includes:

- `env`: values from `$env/dynamic/public` (`PUBLIC_*` variables).
- `locals`: values returned by `docs/.setup` (merged into the template context).

Built-in helpers:

- `stringify`
- `partialString`
- `asbool`
- `iif`
- `coalesce`

Example:

```hbs
# {{coalesce app.name env.PUBLIC_APP_NAME 'MD Docs'}}
```

Disable Handlebars resolution globally with `NO_HBS=true`.

## Runtime customization with `docs/.setup*`

You can provide a setup module at `docs/.setup.js` or `docs/.setup.ts` that exports `default` or `setup` function.

It receives the request `URL` and returns a locals object. `locals.app` drives branding in the UI and templating context.

Shape of `locals.app`:

- `name: string`
- `subtitle?: string`
- `favicon: string`
- `themeCss: string`

`favicon` sources supported by the app:

- data URL
- same-origin `/docs/...` URL
- `file:` URL
- remote `http(s)` URL

The app exposes generated icons at `/favicon.ico` and `/favicon.png?size=<n>`.

## Automatic responsive images in rendered docs

In Markdown, images under `/docs/...` can opt into generated `srcset` with `auto-srcset` query param.

Supported query params interpreted by the UI renderer:

- `auto-srcset` (flag)
- `format=avif,webp,png` (allowed: `avif`, `webp`, `jpeg`, `png`)
- `width=320w,640w` or range form `width=320..1280;320`

How `auto-srcset` expands:

- When `auto-srcset` is present but both `format` and `width` are empty/invalid, the image falls back to plain `<img src="original-url">`.
- With `width` only, UI renders one `<source>` using `srcset` entries like `/docs/image.png?w=320 320w, /docs/image.png?w=640 640w`, and `<img src="/docs/image.png">`.
- With `format` only, UI renders one `<source>` per format with `type="image/<format>"` and `srcset="/docs/image.png?f=<format> 1x"`.
- With both `format` and `width`, UI renders one `<source>` per format; each source gets width descriptors, for example `/docs/image.png?f=avif&w=320 320w, /docs/image.png?f=avif&w=640 640w`.

Concrete example:

```md
![Architecture](/docs/assets/arch.png?auto-srcset&format=avif,webp&width=480..1440;480)
```

This expands to a `<picture>` with AVIF and WebP sources at 480w, 960w, and 1440w, and a fallback `<img src="/docs/assets/arch.png">`.

## Environment variables

### App/runtime variables

- `DOCS_DIR` (string): docs directory root.
  - Default: dev -> `./.svelte-kit/docs`, prod -> `./docs`
- `TEMP_DIR` (string): cache/temp directory root.
  - Default: OS temp dir + package name
- `CACHE_CONTROL` (string): explicit `Cache-Control` header for docs responses.
  - Default: `public, max-age=${CACHE_CONTROL_MAXAGE || 0}`
- `CACHE_CONTROL_MAXAGE` (number string): fallback max-age when `CACHE_CONTROL` is unset.
  - Default: `0`
- `NO_HBS` (boolean): disables `.hbs` template resolution.
  - Default: `false`
- `KEEP_CACHE` (boolean): keeps temp cache files across restarts.
  - Default: `false`

### Public app branding variables

- `PUBLIC_APP_NAME` (string): app name shown in sidebar/title defaults.
  - Default: `md-docs`
- `PUBLIC_APP_SUBTITLE` (string): optional subtitle.
- `PUBLIC_APP_TITLE_SUFFIX` (string): suffix appended to `<title>` on error page.
  - Default: empty
- `PUBLIC_APP_FAVICON` (string): favicon source URL/path/data URL.
  - Default: built-in `src/lib/assets/favicon.svg`
- `PUBLIC_APP_THEME` (string): stylesheet URL/path for theme variables.
  - Default: built-in `src/lib/assets/theme.css`

### Adapter runtime environment

Production uses `@eslym/sveltekit-adapter-bun`, which supports:

- `HTTP_HOST`, `HTTP_PORT`, `HTTP_SOCKET`
- `HTTP_PROTOCOL_HEADER`, `HTTP_HOST_HEADER`, `HTTP_IP_HEADER`, `HTTP_XFF_DEPTH`, `HTTP_TRUSTED_PROXIES`, `HTTP_OVERRIDE_ORIGIN`
- `HTTP_IDLE_TIMEOUT`, `HTTP_MAX_BODY`
- `WS_IDLE_TIMEOUT`, `WS_MAX_PAYLOAD`, `WS_NO_PING`
- `CACHE_ASSET_AGE`, `CACHE_IMMUTABLE_AGE`

## Docker

This project is published as `eslym/md-docs`.

Build image:

```sh
bun run build
docker build -t eslym/md-docs:local .
```

Run container:

```sh
docker run --rm -p 3000:3000 \
  -e HTTP_HOST=0.0.0.0 \
  -e HTTP_PORT=3000 \
  -e DOCS_DIR=/app/docs \
  -v "$(pwd)/docs:/app/docs:ro" \
  eslym/md-docs:local
```

## Breaking changes from older versions

- Old structured endpoints like `?type=mdast`, `?type=data`, and `?type=dimension` are no longer available on `/docs/*`.
- Legacy substitution env flags (`NO_SUBSTITUTE`, `SUBSTITUTE_*`) are no longer part of runtime behavior.
- Templating now relies on `.hbs` files and Handlebars helpers/context.
- Branding and request-scoped locals are now driven by `docs/.setup` + `PUBLIC_APP_*` defaults.
