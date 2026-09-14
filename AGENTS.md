# Vox web conventions

- Use Next.js App Router and Tailwind CSS v4.
- Read `docs/design-system.md` before adding UI.
- Route pages compose shared components without `className` or inline `style`; lint enforces this.
- Generate new management pages with `npm run generate:page -- slug "Title"` and keep them in `src/app/admin/(console)`.
- Authentication in layouts is not sufficient: each data route/server action must check the current superuser independently.
- Never add an authentication bypass, infer an owner email, or expose server environment variables in client components.
- Redis administration is read-only. Use bounded previews and SCAN cursors, never KEYS or arbitrary command execution.
- Preserve truthful product copy and explicit illustrative examples.
- Run `npm test`, `npm run lint`, `npm run build` and relevant Playwright tests before claiming completion.
