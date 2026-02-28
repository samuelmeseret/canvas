# Contributing to CollabBoard

Thanks for contributing.

## Development setup

1. Fork and clone the repository.
2. Install dependencies.

```bash
pnpm install
```

3. Configure environment variables.

```bash
cp .env.example .env.local
```

4. Initialize Convex metadata/functions.

```bash
pnpm convex:once
```

5. Start local development.

```bash
pnpm dev
```

## Branching and commits

- Create feature branches from `main`.
- Keep commits focused and atomic.
- Use clear commit messages (`feat:`, `fix:`, `docs:`, `chore:`).

## Pull requests

Before opening a PR:

1. Run `pnpm check`.
2. If your change affects browser behavior, run `pnpm test:e2e`.
3. Update docs and/or tests for your change.
4. Confirm no secrets were committed.

PRs should include:

- What changed
- Why it changed
- How it was tested
- Screenshots or recordings for visible UI changes

## Code style

- TypeScript only
- Keep modules small and single-purpose
- Prefer explicit validation at API boundaries (Zod)
- Avoid introducing new dependencies unless justified

## Good first contributions

- Fix bugs labeled `good first issue`
- Improve tests and docs
- Small UX polish items
