# MD Docs

A Bun + SvelteKit documentation server that renders Markdown as a docs website.

## What this project does

- Serves documentation files through `/docs/*`.
- Renders Markdown with heading-based table of contents, Shiki syntax highlighting, and Mermaid diagrams.
- Supports template substitution in Markdown, JSON, YAML, and HTML content.
- Exposes structured endpoints for parsed content (`?type=mdast`, `?type=data`, `?type=dimension`).
- Optimizes images on demand through query params (`w`, `h`, `f`).

## Tech stack

- Runtime: Bun
- Framework: SvelteKit (Svelte 5)
- UI: Tailwind CSS + shadcn-svelte

## Getting started

1. Install dependencies:

```sh
bun install
```

2. Configure environment variables (see [Environment variables](#environment-variables)).
3. Start dev server:

```sh
bun run dev
```

4. Build production bundle:

```sh
bun run build
```

## Common commands

```sh
bun run dev
bun run build
bun run check
bun run lint
bun run format
```

## Docs path resolution

For a request path, docs are resolved in this order:

1. exact path
2. `path.md`
3. `path/index.md`

Examples:

- `/` -> `index.md`
- `/guide` -> `guide.md` or `guide/index.md`

## Markdown frontmatter

You can define document metadata and markdown behavior:

```yaml
---
title: Integration Guide
description: API integration steps
markdown:
  render:
    highlight: true
    mermaid: true
cacheControl:
  maxAge: 300
substitute: true
vars:
  product_name: Example
---
```

## Template substitution

When substitution is enabled, templates can reference:

- `env.*` from public environment variables only (`$env/dynamic/public`, a.k.a. `PUBLIC_*`)
- `vars.*` from frontmatter

Private environment variables are not exposed to template substitution.

Example:

```md
Welcome to {{coalesce env.PUBLIC_APP_NAME 'MD Docs'}}.
```

## HTTP behavior (`/docs/*`)

- `GET /docs/<path>`: serves the resolved raw file.
- `GET /docs/<path>?type=mdast`: msgpack payload with parser revision, location, metadata, and compressed markdown AST.
- `GET /docs/<path>?type=data`: parsed JSON/YAML as msgpack.
- `GET /docs/<path>?type=dimension`: image dimensions for raster images.
- `GET /docs/<path>?w=<n>&h=<n>&f=<format>`: transformed image response.

## Docker

This project is published as `eslym/md-docs`.

### Build image

```sh
bun run build
docker build -t eslym/md-docs:local .
```

### Run container

```sh
docker run --rm -p 3000:3000 \
  -e HTTP_HOST=0.0.0.0 \
  -e HTTP_PORT=3000 \
  -e DOCS_DIR=/app/docs \
  -v "$(pwd)/docs:/app/docs:ro" \
  eslym/md-docs:local
```

### Available image tags

CI publishes multi-arch images (`linux/amd64`, `linux/arm64`) with these tags:

- `edge` from `main`
- `next` from `release`
- semver tags from git tags prefixed with `v`:
  - `v<major>`
  - `v<major>.<minor>`
  - `v<major>.<minor>.<patch>`

Examples:

- `eslym/md-docs:edge`
- `eslym/md-docs:next`
- `eslym/md-docs:v1`
- `eslym/md-docs:v1.2`
- `eslym/md-docs:v1.2.3`

### Adapter runtime environment

Production uses `@eslym/sveltekit-adapter-bun`, which supports:

- `HTTP_HOST`: host/interface to bind the HTTP server.
- `HTTP_PORT`: port to bind the HTTP server.
- `HTTP_SOCKET`: unix socket path (disables HTTP host/port binding when set).
- `HTTP_PROTOCOL_HEADER`: header used to infer request protocol behind proxy.
- `HTTP_HOST_HEADER`: header used to infer request host behind proxy.
- `HTTP_IP_HEADER`: header used to infer client IP (for example `X-Forwarded-For`).
- `HTTP_XFF_DEPTH`: depth index when reading client IP from forwarded chain.
- `HTTP_TRUSTED_PROXIES`: comma-separated trusted proxy IP/CIDR list.
- `HTTP_OVERRIDE_ORIGIN`: forced origin when origin cannot be inferred safely.
- `HTTP_IDLE_TIMEOUT`: request idle timeout.
- `HTTP_MAX_BODY`: maximum accepted HTTP request body size.
- `WS_IDLE_TIMEOUT`: websocket idle timeout.
- `WS_MAX_PAYLOAD`: maximum websocket payload size.
- `WS_NO_PING`: disables automatic websocket ping response.
- `CACHE_ASSET_AGE`: cache max-age for regular static assets.
- `CACHE_IMMUTABLE_AGE`: cache max-age for immutable static assets.

## Environment variables

- `DOCS_DIR` (type: `string`, default: `.svelte-kit/docs` in dev, current working directory in prod): docs directory root used by resolver.
- `TEMP_DIR` (type: `string`, default: OS temp dir + package name): temp/cache directory root.
- `CACHE_CONTROL` (type: `string`, default: `public, max-age=${CACHE_CONTROL_MAXAGE || 0}`): explicit cache-control header.
- `CACHE_CONTROL_MAXAGE` (type: `number` as env string, default: `0`): fallback max-age if `CACHE_CONTROL` is unset.
- `NO_SUBSTITUTE` (type: `boolean`, default: `false`): disables all substitutions.
- `SUBSTITUTE_MARKDOWN` (type: `boolean`, default: `true`): enables markdown substitution.
- `SUBSTITUTE_JSON` (type: `boolean`, default: `true`): enables JSON substitution.
- `SUBSTITUTE_YAML` (type: `boolean`, default: `true`): enables YAML substitution.
- `SUBSTITUTE_HTML` (type: `boolean`, default: `true`): enables HTML substitution.
- `KEEP_CACHE` (type: `boolean`, default: `false`): keeps cache files across restarts.
- `PUBLIC_APP_NAME` (type: `string`, default: `MD Docs`): app name shown in UI.
- `PUBLIC_APP_SUBTITLE` (type: `string`, default: unset): app subtitle shown in UI.
- `PUBLIC_APP_TITLE_SUFFIX` (type: `string`, default: empty string): suffix appended to page titles.
- `PUBLIC_APP_FAVICON` (type: `string` URL/path, default: built-in `$lib/assets/favicon.svg`): favicon source used for both `/favicon.ico` generation and inline favicon link.

## Verification

No dedicated test runner is configured. Use:

- `bun run check`
- `bun run lint`
