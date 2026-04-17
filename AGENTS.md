# AGENTS

## Core Rules

- Runtime is **Bun-must** for this repo.
- Use `snake_case` for internal functions and variables.
- In SvelteKit route files, rely on inferred export types; do not manually annotate with `import('./types')...`.
  - Prefer: `export async function load() {}`

## Daily Commands

- `bun install`
- `bun run dev`
- `bun run build`
- `bun run check`
- `bun run lint`
- `bun run format`
- No test runner is configured; use `check` + `lint` for verification.

## UI Workflow

- Use **shadcn-svelte** for UI components.
- Use `bun shadcn -- <command>` as the CLI shorthand.
  - Example: `bun shadcn -- add <components...>`

## Formatting

- Prettier is source of truth (`.prettierrc`): tabs, single quotes, print width 100, Svelte + Tailwind plugins.
