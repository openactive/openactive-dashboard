# Testing

Unit tests use [Vitest](https://vitest.dev/). Config is in `vitest.config.ts`.

## Commands


```bash
npm test          # run once
npm run test:watch  # watch mode
```

The `@/` import alias works in tests the same way as in the app.

## Where tests live

Tests sit next to the code they cover, in `__tests__/` folders, for example:

- `app/lib/__tests__/`
- `app/services/__tests__/`
- `app/hooks/__tests__/`
- `app/components/area-hierarchy/__tests__/`

File names look like `opportunity-reduce.test.ts` or `useSocioContext.test.ts`.

## Fixtures

A shared simple data is in `app/lib/__fixtures__/`.

Import from the barrel:

```ts
import { testHierarchy, HARTLEPOOL } from "@/app/lib/__fixtures__";
```

There are fixtures for areas / hierarchy, opportunities, feed quality, and socio rows. Do not put test files inside `__fixtures__`.

Most tests use these fixtures instead of calling the real Monitor API.

## What we tend to test

- Pure logic in `app/lib/` (reduce, filters, socio rules, feed quality grouping)
- Service helpers (for exaample `buildFilterParams`, `apiFetch` behaviour with mocks)
- Hooks with mocked services

UI components are not heavily covered yet. Prefer testing with the logic that drives the UI.

## CI

`.github/workflows/test.yml` runs on pull requests and on pushes to `main`.

It installs with `npm ci` and runs `npm test` on Node 22.

Locally this repo often uses Node 24.11.0 for development. if a test fails only in CI, check the Node version first.