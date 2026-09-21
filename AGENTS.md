# Vox web conventions

- Use Next.js App Router and Tailwind CSS v4.
- Read `docs/design-system.md` before adding UI.
- Route pages compose shared components without `className` or inline `style`; lint enforces this.
- Generate new management pages with `npm run generate:page -- slug "Title"` and keep them in `src/app/admin/(console)`.
- Authentication in layouts is not sufficient: each data route/server action must check the current superuser independently.
- Never add an authentication bypass, infer an owner email, or expose server environment variables in client components.
- Redis administration uses bounded previews, typed replacement and explicit deletion. Use SCAN cursors, never KEYS or arbitrary command execution.
- Preserve truthful product copy and explicit illustrative examples.
- Run `npm test`, `npm run lint`, `npm run build` and relevant Playwright tests before claiming completion.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
