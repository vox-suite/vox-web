# Vox design system

The latest supplied Selecta reference informs the monochrome canvas, fine structural borders, square controls, bold typography, dot grids and original halftone artwork. Vox keeps its own content and identity. Public sections form a continuous bordered frame; management screens use the same neutral surfaces and sharp controls. This replaces the earlier Sarvam-inspired palette.

## Foundations

`src/app/globals.css` is the source of truth. Tailwind v4 `@theme` exposes `paper`, `ink`, `muted`, `line`, `soft`, `subtle`, `contrast`, and `accent`, plus the font, card/control radii and panel shadow. Layout variables control the page width, section space, card padding and control height. Change these foundations to redesign all pages together.

Manrope is bundled locally, including a Latin subset. Headings use a shared scale and strong weights. Body text, inputs, labels, native tables, focus rings and form validation states have global defaults. All input text is at least 16px. Layouts adapt at 1000px and 720px. Motion respects reduced-motion preferences.

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

The example shows visual composition; put editable controls in a real form connected to an authorized server action when adding persistence. Server components remain the default. Only interactive feature components require `use client`.

## Components

| Component                    | Responsibility                                                         |
| ---------------------------- | ---------------------------------------------------------------------- |
| `Page`                       | Management title, description, actions and content spacing             |
| `Section`                    | Public content width, vertical rhythm and left-aligned section heading |
| `Stack`, `Row`, `Grid`       | Vertical, wrapping horizontal, and responsive column layouts           |
| `Card`                       | Related content with optional heading and semantic surface tone        |
| `Text`, `Badge`              | Body hierarchy and small explicit state labels                         |
| `Button`, `LinkButton`       | Actions and navigation, with primary/secondary/ghost variants          |
| `Field`, `Select`            | Visible labels, controls, helper text and accessible associations      |
| `DataTable`                  | Caption, headers and a keyboard-accessible horizontal overflow region  |
| `Notice`                     | Informational, success or error feedback with appropriate live regions |
| `EmptyState`, `LoadingState` | Consistent recovery and loading patterns                               |
| `CodeBlock`                  | Bounded, scrollable plain-text data presentation                       |
| `Stat`, `ModuleCard`         | Overview data and links to management modules                          |

Use the authenticated `/admin/design-system` page as the live component reference. It includes a page composition example.

## Extension rules

1. Generate pages with `npm run generate:page -- slug "Title"`.
2. Compose existing components without class names or inline styles in route pages; lint enforces this.
3. If a visual pattern is missing, create a reusable component with semantic props instead of a page-specific style override. Keep its styling beside the shared component styles in `globals.css`.
4. Every interactive control needs a real action, an accessible name, pending/error handling and keyboard support.
5. Every new data boundary must check authorization independently. A navigation entry does not grant permission.
6. Do not invent operational counts, connection status or product capabilities; show actual data, explicit examples or an honest empty state.

## References

- [Tailwind theme variables](https://tailwindcss.com/docs/theme)
- [Next.js authentication guidance](https://nextjs.org/docs/app/guides/authentication)
- [Supabase Auth Google provider](https://supabase.com/docs/guides/auth/social-login/auth-google)

## Artwork

The four local SVGs in `public/artwork` are original geometric point illustrations: a large signal ring and three feature studies. They are decorative, have empty alternative text and require no external asset service. Keep these monochrome; avoid importing screenshots or third-party brand assets into the interface.
