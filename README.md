# vox-web

The Vox landing page. Next.js App Router, Tailwind CSS v4, dark theme only.

```sh
npm install
npm run dev
```

Colors, radii and fonts come from `vox-shared/theme` (`../vox-shared/theme/tokens.json`). After changing tokens run `node ../vox-shared/theme/build.mjs` and copy `theme/dist/vox-theme.css` to `src/app/theme.css`.

Set the access link in `src/lib/site.ts`.
