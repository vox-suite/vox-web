# Vox design system

Raycast-inspired midnight command center on a near-black canvas (`#040506`), with Mist neutral actions and Coral Pulse reserved for the brand mark, hero atmosphere, and sparse AI badges. The system is dark-only.

## Foundations

`src/app/globals.css` is the source of truth. Tailwind v4 `@theme` exposes Raycast tokens (`void-black`, `ink`, `obsidian`, `graphite`, `smoke`, `ash`, `mist`, `iron`, `coral-pulse`, …), type scale, spacing, radii, and the keyboard-key shadow stack (`shadow-subtle-3`). shadcn semantic aliases (`background`, `foreground`, `primary`, `card`, `border`, …) map onto the same palette: primary actions use Mist fill with Iron text, never coral CTAs.

Inter is the interface typeface; Geist Mono is used for version strings and technical metadata. Fonts load via `next/font` in the root layout.

## Composition

```tsx
import { Page, Card, Stack, Field, Button } from "@/components/ui";
import { requireSuperuser } from "@/lib/auth";

export default async function SettingsPage() {
  await requireSuperuser();
  return (
    <Page title="Settings" description="Manage your workspace preferences.">
      <Card title="Workspace">
        <Stack>
          <Field id="workspace-name" name="name" label="Workspace name" />
          <Button type="submit">Save changes</Button>
        </Stack>
      </Card>
    </Page>
  );
}
```

Route pages compose shared components without `className` or inline `style`; lint enforces this. Put reusable styles in `src/components/ui` or feature components. Server components remain the default. Only interactive feature components require `use client`.

## Components

Primitives live under `src/components/ui` (shadcn + Raycast variants). Composition helpers preserve the page API:

| Component | Responsibility |
| --------- | -------------- |
| `Page` | Management title, description, actions and content spacing |
| `Section` | Public content width, vertical rhythm and section heading |
| `Stack`, `Row`, `Grid` | Vertical, wrapping horizontal, and responsive column layouts |
| `Card` | Related content with optional heading and surface tone |
| `Text`, `Badge` | Body hierarchy and small state labels |
| `Button`, `LinkButton` | Actions and navigation (`primary` Mist, `secondary` ghost border, `ghost`, `danger`) |
| `Field`, `Select`, `TextArea` | Visible labels, inset controls, helper text |
| `DataTable` | Caption, headers and keyboard-accessible overflow |
| `Notice` | Informational, success or error feedback |
| `EmptyState`, `LoadingState` | Recovery and loading patterns |
| `CodeBlock` | Bounded, scrollable plain-text data |
| `Stat`, `ModuleCard` | Overview data and links to management modules |
| `Brand`, `AuthFrame` | Wordmark and auth shell |

## Extension rules

1. Generate pages with `npm run generate:page -- slug "Title"`.
2. Compose existing components without class names or inline styles in route pages.
3. If a visual pattern is missing, add a reusable component with semantic props. Prefer Tailwind token classes over one-off hex.
4. Every interactive control needs a real action, an accessible name, pending/error handling and keyboard support.
5. Every new data boundary must check authorization independently.
6. Do not invent operational counts or product capabilities; show actual data, explicit examples or an honest empty state.
7. Reserve Coral Pulse for the logo diamond, hero artwork, and warm-tinted accent surfaces — not for body links, icons, or primary buttons.

## References

- [Tailwind theme variables](https://tailwindcss.com/docs/theme)
- [shadcn/ui](https://ui.shadcn.com/docs)
- [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication)
