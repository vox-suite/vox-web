# vox-web

The Vox landing page. Next.js App Router, Tailwind CSS v4, dark theme only.

```sh
npm install
npm run dev
```

Colors, radii and fonts come from `vox-theme` (`../vox-theme/tokens.json`). After changing tokens run `node ../vox-theme/build.mjs` and copy `dist/vox-theme.css` to `src/app/theme.css`.

Set the access link in `src/lib/site.ts`.
