# Consumer Plugin Marketplace Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a consumer-focused plugin marketplace in `vox-web` with authentic company brand assets, a top installed-plugins dock, categorized catalog sections (Popular, Food & Groceries, Rides & Travel, Lifestyle & Essentials), and one-click atomic installation that immediately grants capabilities to the active agent.

**Architecture:** A static vector brand asset directory in `public/plugins/logos/` coupled with a typed catalog registry in `src/features/plugins/catalog.ts`. A compound backend route `POST /api/account/plugins/install` registers the plugin as a Core `RemoteExtension` and creates `CapabilityGrant` records for the user's active agent in one atomic step. The frontend mirrors the reference screenshot with a top installed-dock, `Public`/`Personal` switcher, and instant `[+]` install buttons with optimistic TanStack Query cache updates.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, TanStack Query v5, Playwright, Node.js test runner (`tsx --test`).

**Spec:** `vox-web/docs/superpowers/specs/2026-09-26-consumer-plugin-marketplace-design.md`

## Global Constraints

- Use official SVG vector brand assets in `public/plugins/logos/` with authentic colors and geometries.
- Maintain strict capability grant invariants: installing an extension explicitly grants declared capabilities in Core to the active agent.
- Atomic install: failure during grant creation must rollback/remove the extension so partial state is never left behind.
- Zero extra confirmation dialogs on the public catalog `[+]` button; true 1-click execution.
- Maintain complete linting (`eslint .`), TypeScript (`tsc --noEmit`), and test suite (`tsx --test`) green status at every task commit.

---

### Task 1: Official Brand Vector SVG Assets

**Files:**
- Create: `public/plugins/logos/uber.svg`
- Create: `public/plugins/logos/doordash.svg`
- Create: `public/plugins/logos/zomato.svg`
- Create: `public/plugins/logos/amazon.svg`
- Create: `public/plugins/logos/instacart.svg`
- Create: `public/plugins/logos/spotify.svg`
- Create: `public/plugins/logos/airbnb.svg`
- Create: `public/plugins/logos/expedia.svg`
- Create: `public/plugins/logos/google-calendar.svg`
- Test: `tests/brand-assets.test.ts`

**Interfaces:**
- Produces: Static SVG asset files accessible via `/plugins/logos/{id}.svg`.

- [ ] **Step 1: Write the failing test for brand assets**

Create `tests/brand-assets.test.ts`:
```typescript
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

const REQUIRED_LOGOS = [
  "uber.svg",
  "doordash.svg",
  "zomato.svg",
  "amazon.svg",
  "instacart.svg",
  "spotify.svg",
  "airbnb.svg",
  "expedia.svg",
  "google-calendar.svg",
];

test("all required brand logos exist as valid non-empty SVG vectors", () => {
  const logosDir = path.resolve(process.cwd(), "public/plugins/logos");
  assert.ok(fs.existsSync(logosDir), "public/plugins/logos directory must exist");

  for (const file of REQUIRED_LOGOS) {
    const filePath = path.join(logosDir, file);
    assert.ok(fs.existsSync(filePath), `Logo file missing: ${file}`);
    const content = fs.readFileSync(filePath, "utf-8").trim();
    assert.ok(content.startsWith("<svg"), `${file} must start with <svg`);
    assert.ok(content.endsWith("</svg>"), `${file} must end with </svg>`);
    assert.ok(content.length > 100, `${file} content is too small to be a valid logo`);
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/tsx --test tests/brand-assets.test.ts`
Expected: FAIL (directory or logo files missing).

- [ ] **Step 3: Add authentic company SVG assets**

Create `public/plugins/logos/` directory and populate each official SVG asset with verified brand geometries and official hex colors (`#000000` for Uber, `#FF3008` for DoorDash, `#E23744` for Zomato, `#FF9900` for Amazon, `#43B02A` for Instacart, `#1ED760` for Spotify, `#FF5A5F` for Airbnb, `#00253A` for Expedia, and Google quad-color for Google Calendar).

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/tsx --test tests/brand-assets.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add public/plugins/logos/ tests/brand-assets.test.ts
git commit -m "feat(plugins): add official company vector SVG brand assets"
```

---

### Task 2: Catalog Data Model & Registry

**Files:**
- Create: `src/features/plugins/catalog.ts`
- Create: `tests/plugins-catalog.test.ts`

**Interfaces:**
- Produces:
  ```typescript
  export type PluginCategory = "Popular" | "Food & Groceries" | "Rides & Travel" | "Lifestyle & Essentials";
  export type CatalogPlugin = { ... };
  export const PLUGIN_CATALOG: CatalogPlugin[];
  export function getCatalogPlugin(id: string): CatalogPlugin | undefined;
  export function getPluginsByCategory(): Record<PluginCategory, CatalogPlugin[]>;
  ```

- [ ] **Step 1: Write the failing test for catalog registry**

Add to `tests/plugins-catalog.test.ts`:
```typescript
import assert from "node:assert/strict";
import test from "node:test";
import { PLUGIN_CATALOG, getCatalogPlugin, getPluginsByCategory } from "../src/features/plugins/catalog";

test("plugin catalog defines required consumer apps with unique IDs and valid capabilities", () => {
  assert.ok(PLUGIN_CATALOG.length >= 9, "Must include at least 9 consumer plugins");
  const ids = new Set<string>();

  for (const plugin of PLUGIN_CATALOG) {
    assert.ok(!ids.has(plugin.id), `Duplicate plugin ID: ${plugin.id}`);
    ids.add(plugin.id);
    assert.ok(plugin.displayName.length > 0, `Display name missing for ${plugin.id}`);
    assert.ok(plugin.tagline.length > 0, `Tagline missing for ${plugin.id}`);
    assert.ok(plugin.logoFile.endsWith(".svg"), `Logo must be an svg file: ${plugin.id}`);
    assert.ok(plugin.capabilities.length > 0, `Capabilities missing for ${plugin.id}`);
    assert.ok(plugin.endpointUrl.startsWith("https://"), `Endpoint must be HTTPS: ${plugin.id}`);
  }

  assert.ok(getCatalogPlugin("doordash"), "DoorDash must be in catalog");
  assert.ok(getCatalogPlugin("uber"), "Uber must be in catalog");
  assert.ok(getCatalogPlugin("zomato"), "Zomato must be in catalog");

  const categories = getPluginsByCategory();
  assert.ok(categories["Popular"].length > 0, "Popular category must not be empty");
  assert.ok(categories["Food & Groceries"].length > 0, "Food & Groceries must not be empty");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `./node_modules/.bin/tsx --test tests/plugins-catalog.test.ts`
Expected: FAIL (module `../src/features/plugins/catalog` not found).

- [ ] **Step 3: Implement catalog schema and entries in `src/features/plugins/catalog.ts`**

Define `CatalogPlugin`, `PluginCategory`, and `PLUGIN_CATALOG` with entries for:
- Uber, DoorDash, Zomato, Instacart, Amazon, Expedia, Airbnb, Spotify, Google Calendar.
Implement `getCatalogPlugin(id)` and `getPluginsByCategory()`.

- [ ] **Step 4: Run test to verify it passes**

Run: `./node_modules/.bin/tsx --test tests/plugins-catalog.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/features/plugins/catalog.ts tests/plugins-catalog.test.ts
git commit -m "feat(plugins): implement consumer plugin catalog schema and registry"
```

---

### Task 3: Backend One-Click Install & Catalog API

**Files:**
- Create: `src/app/api/account/plugins/catalog/route.ts`
- Create: `src/app/api/account/plugins/install/route.ts`
- Create: `src/app/api/account/plugins/[id]/route.ts`
- Create: `src/features/plugins/api.ts`
- Create: `src/features/plugins/queries.ts`
- Test: `tests/plugins-api.test.ts`

**Interfaces:**
- Produces:
  - `GET /api/account/plugins/catalog`: returns list of catalog plugins.
  - `POST /api/account/plugins/install`: installs extension and grants all capabilities to the active agent.
  - `DELETE /api/account/plugins/[id]`: uninstalls extension and revokes grants.
  - `useInstallPlugin()` and `useUninstallPlugin()` mutation hooks.

- [ ] **Step 1: Write test for plugin install and agent capability granting**

Create `tests/plugins-api.test.ts` verifying compound install logic:
```typescript
import assert from "node:assert/strict";
import test from "node:test";
import { getCatalogPlugin } from "../src/features/plugins/catalog";

test("installPlugin compound request maps catalog plugin to Core extension and grants", async () => {
  const plugin = getCatalogPlugin("doordash");
  assert.ok(plugin);
  assert.equal(plugin.id, "doordash");
  assert.ok(plugin.capabilities.length >= 3);
  // Verify capabilities have valid structure
  for (const cap of plugin.capabilities) {
    assert.ok(cap.name.length > 0);
    assert.ok(["read", "write", "search"].includes(cap.category));
  }
});
```

- [ ] **Step 2: Run test to verify it fails/passes**

Run: `./node_modules/.bin/tsx --test tests/plugins-api.test.ts`

- [ ] **Step 3: Implement API routes and client queries**

1. Create `src/app/api/account/plugins/catalog/route.ts` returning `PLUGIN_CATALOG`.
2. Create `src/app/api/account/plugins/install/route.ts`:
   - Authenticate `currentConsumer(request.headers)`.
   - Validate `pluginId` against `PLUGIN_CATALOG`.
   - Call `core.installExtension(account.accountId, { external_key, display_name, endpoint_url, operator, capabilities })`.
   - Resolve active agent key (`default-assistant` or via `core.getEffectiveGrants` / agent lookup).
   - Create capability grants via `core.createGrant` for each declared capability.
   - Return `{ success: true, extension, grants }`.
3. Create `src/app/api/account/plugins/[id]/route.ts` handling `DELETE` to remove extension.
4. Create `src/features/plugins/api.ts` with `installPlugin(pluginId)` and `uninstallPlugin(extensionId)`.
5. Create `src/features/plugins/queries.ts` with TanStack Query hooks and cache invalidation (`extensionKeys.all`, `grantKeys.all`).

- [ ] **Step 4: Verify with tsc, lint, and tests**

Run: `./node_modules/.bin/eslint src/app/api/account/plugins/ src/features/plugins/ && ./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/tsx --test tests/*.test.ts`
Expected: 0 errors, all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/api/account/plugins/ src/features/plugins/api.ts src/features/plugins/queries.ts tests/plugins-api.test.ts
git commit -m "feat(plugins): implement one-click install API and query hooks with agent auto-grant"
```

---

### Task 4: UI Components (Brand Logo, Installed Dock, Plugin Card, Catalog Grid)

**Files:**
- Create: `src/features/plugins/components/plugin-logo.tsx`
- Create: `src/features/plugins/components/plugin-card.tsx`
- Create: `src/features/plugins/components/installed-plugins-dock.tsx`
- Create: `src/features/plugins/components/plugin-catalog-grid.tsx`
- Create: `src/features/plugins/components/plugin-inspector-modal.tsx`

**Interfaces:**
- Produces:
  - `<PluginLogo logoFile={...} alt={...} size={...} />`: renders crisp official company asset inside dark themed squircle.
  - `<InstalledPluginsDock />`: horizontal dock of installed plugin icons at top of page with quick inspect/uninstall.
  - `<PluginCard plugin={...} installedExtension={...} />`: single item row/card with logo, title, description, and instant `[+]` button.
  - `<PluginCatalogGrid />`: categorized sections with search filter matching reference screenshot.

- [ ] **Step 1: Implement `<PluginLogo>` component**

In `src/features/plugins/components/plugin-logo.tsx`:
Render image from `/plugins/logos/${logoFile}` with squircle border, subtle dark background, alt text, and fallback.

- [ ] **Step 2: Implement `<InstalledPluginsDock>` component**

In `src/features/plugins/components/installed-plugins-dock.tsx`:
Query installed extensions using `useExtensions()`. Filter out removed ones. Render top horizontal flex strip of installed icons with tooltips. Clicking an icon opens the inspector modal to view active capabilities and uninstall.

- [ ] **Step 3: Implement `<PluginCard>` component**

In `src/features/plugins/components/plugin-card.tsx`:
Render provider logo on the left, display name and tagline in center, and action on right:
- If not installed: `+` button triggering `useInstallPlugin()` mutation.
- While mutating: micro-spinner.
- If installed: subtle `✓` badge / `...` options button.

- [ ] **Step 4: Implement `<PluginCatalogGrid>` component**

In `src/features/plugins/components/plugin-catalog-grid.tsx`:
Render search input and map over `getPluginsByCategory()`. Render each section header (`Popular >`, `Food & Groceries >`, `Rides & Travel >`, `Lifestyle & Essentials >`) followed by the 2-column grid of `<PluginCard>` components.

- [ ] **Step 5: Verify with tsc, lint, and tests**

Run: `./node_modules/.bin/eslint src/features/plugins/components/ && ./node_modules/.bin/tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/plugins/components/
git commit -m "feat(plugins): implement marketplace UI components with authentic brand assets"
```

---

### Task 5: Integrate Marketplace into Apps Screen

**Files:**
- Modify: `src/features/apps/components/apps-screen.tsx`
- Modify: `src/features/extensions/components/extensions-panel.tsx`

**Interfaces:**
- Consumes: `<InstalledPluginsDock>`, `<PluginCatalogGrid>`, `<QuickAddMcpForm>`.
- Produces: Unified Apps screen hosting the Public Consumer Marketplace, Top Installed Dock, Personal custom server tab, and Skills hub.

- [ ] **Step 1: Update `apps-screen.tsx` and `extensions-panel.tsx`**

Integrate the top dock and catalog grid into the `Public` view:
- Top: `<InstalledPluginsDock />` shows installed company icons.
- Segmented Control: `Public` (active by default) vs `Personal`.
- When `source === "public"`: renders `<PluginCatalogGrid />`.
- When `source === "personal"`: renders custom MCP server registration form and saved personal servers.
- Underneath: `<details>` drawer for connected account OAuth and detailed agent access controls.

- [ ] **Step 2: Verify with tsc, lint, and test suite**

Run: `./node_modules/.bin/eslint src/features/apps/ src/features/extensions/ && ./node_modules/.bin/tsc --noEmit && ./node_modules/.bin/tsx --test tests/*.test.ts`
Expected: 0 errors, all tests pass.

- [ ] **Step 3: Commit**

```bash
git add src/features/apps/components/apps-screen.tsx src/features/extensions/components/extensions-panel.tsx
git commit -m "feat(apps): integrate consumer plugin marketplace and top dock into apps screen"
```

---

### Task 6: Browser E2E & Full Verification

**Files:**
- Modify: `tests/consumer-browser/consumer-app.spec.ts`

- [ ] **Step 1: Add Playwright E2E test for the plugin marketplace**

Add test in `tests/consumer-browser/consumer-app.spec.ts`:
```typescript
test("consumer plugin marketplace enables 1-click install with brand assets and top dock", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/app/apps");

  // Verify Plugins marketplace headings & categories
  await expect(page.getByRole("heading", { name: "Plugins", level: 1 })).toBeVisible();
  await expect(page.getByText("Popular")).toBeVisible();
  await expect(page.getByText("Food & Groceries")).toBeVisible();
  await expect(page.getByText("DoorDash")).toBeVisible();
  await expect(page.getByText("Uber")).toBeVisible();

  // Perform 1-click install on DoorDash
  const doordashCard = page.locator("article, div").filter({ hasText: "DoorDash" }).first();
  await doordashCard.getByRole("button", { name: /install|add/i }).click();

  // Verify DoorDash installed in top dock
  await expect(page.getByRole("button", { name: /DoorDash active/i })).toBeVisible();
});
```

- [ ] **Step 2: Run all verification commands**

1. Prettier check: `./node_modules/.bin/prettier --check src/ tests/ public/`
2. ESLint: `./node_modules/.bin/eslint .`
3. TypeScript: `./node_modules/.bin/tsc --noEmit`
4. Node Unit Tests: `./node_modules/.bin/tsx --test tests/*.test.ts`
Expected: ALL PASS with 0 warnings or errors.

- [ ] **Step 3: Commit**

```bash
git add tests/consumer-browser/consumer-app.spec.ts
git commit -m "test(plugins): verify consumer marketplace 1-click install and dock in browser e2e"
```
