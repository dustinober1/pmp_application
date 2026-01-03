# TypeScript Configuration Notes

This repo uses a root `tsconfig.json` for shared defaults, with per-package overrides:

- `tsconfig.json` (root): shared strict defaults and modern language target.
- `packages/api/tsconfig.json`: uses `CommonJS`/`Node` to match the current Jest + Node runtime.
- `packages/web/tsconfig.json`: uses settings appropriate for Next.js/App Router and bundler tooling.

If changing module settings, ensure:

- API tests (`npm run test:api`) still run under Jest.
- Web builds (`npm run build:web`) still work under Next.js.
