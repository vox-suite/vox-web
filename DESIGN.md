# Vox design

Calm, in a dark and a light theme. Tokens live in `vox-shared/theme/tokens.json` (edit, then `node vox-shared/theme/build.mjs`) and are shared by web, desktop (CSS) and Android (`VoxTheme.kt`). Theme preference is `auto` (default, follows the OS), `light` or `dark`, stored in localStorage as `vox-theme`.

- Serif headings (Newsreader, weight 400), mono body (JetBrains Mono).
- Raycast palette: Void Black canvas, Mist primary action, Coral Pulse accent, Electric Sky focus. See `vox-desktop/design.md`.
- Hairline borders, 40px cards, pill buttons. Slow motion; reduced motion respected.
