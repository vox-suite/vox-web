import { test, expect, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { encode } from "next-auth/jwt";

async function session(
  context: BrowserContext,
  email = "admin@example.test",
  googleVerified = true,
) {
  const value = await encode({
    token: { email, name: "Test administrator", googleVerified },
    secret: "isolated-playwright-secret-not-for-production",
    maxAge: 3600,
  });
  await context.addCookies([
    {
      name: "next-auth.session-token",
      value,
      domain: "127.0.0.1",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
}
test("public design is responsive, accessible and interactive", async ({
  page,
}, testInfo) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your life, one call away." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Think it through" }).click();
  await expect(
    page.getByText("There’s a lot on my mind this week."),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({
    path: `artifacts/home-${testInfo.project.name}.png`,
    fullPage: true,
  });
});
test("unauthenticated management routes redirect and APIs deny access", async ({
  page,
  request,
}) => {
  await page.goto("/admin/redis");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  const response = await request.get("/api/admin/redis");
  expect(response.status()).toBe(401);
  expect(response.headers()["cache-control"]).toContain("no-store");
  await expect(
    page.getByRole("heading", { name: "A clearer view of your workspace." }),
  ).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze())
      .violations,
  ).toEqual([]);
});
test("signed but unapproved or unverified sessions cannot access data", async ({
  context,
  page,
}) => {
  await session(context, "other@example.test");
  expect((await page.request.get("/api/admin/redis")).status()).toBe(401);
  await context.clearCookies();
  await session(context, "admin@example.test", false);
  expect((await page.request.get("/api/admin/redis")).status()).toBe(401);
});
test("management navigation, Redis search, preview and recovery", async ({
  context,
  page,
}, testInfo) => {
  await session(context);
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: `artifacts/admin-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page
    .getByRole("navigation", { name: "Administration" })
    .getByRole("link", { name: "Redis explorer" })
    .click();
  await page
    .getByRole("button", { name: "vox:user-context:fixture-001", exact: true })
    .click();
  await expect(
    page.getByText("Planning a quiet morning.", { exact: false }),
  ).toBeVisible();
  await page.screenshot({
    path: `artifacts/redis-${testInfo.project.name}.png`,
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Next batch" }).click();
  await expect(page.getByRole("button", { name: "Next batch" })).toBeDisabled();
  await page.getByRole("button", { name: "Previous", exact: true }).click();
  await expect(page.getByRole("button", { name: "Next batch" })).toBeEnabled();
  await page.getByLabel("Search keys").fill("empty:*");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "No entries on this page" }),
  ).toBeVisible();
  await page.getByLabel("Search keys").fill("fail:*");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "Could not load entries" }),
  ).toContainText("Redis is unavailable");
  await page.getByLabel("Search keys").fill("vox:*");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByRole("button", {
      name: "vox:user-context:fixture-001",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("navigation", { name: "Administration" })
    .getByRole("link", { name: "Design system" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Design system", exact: true }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.screenshot({
    path: `artifacts/design-system-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  expect((await page.request.get("/api/admin/redis")).status()).toBe(401);
});

test("Google sign-in starts an OAuth flow with CSRF and state protection", async ({
  request,
}) => {
  const csrf = await request.get("/api/auth/csrf");
  const { csrfToken } = await csrf.json();
  expect(csrfToken).toBeTruthy();
  const response = await request.post("/api/auth/signin/google", {
    form: { csrfToken, callbackUrl: "/admin", json: "true" },
  });
  const { url } = await response.json();
  const authorization = new URL(url);
  expect(authorization.hostname).toBe("accounts.google.com");
  expect(authorization.searchParams.get("redirect_uri")).toBe(
    "http://127.0.0.1:3100/api/auth/callback/google",
  );
  expect(authorization.searchParams.get("state")).toBeTruthy();
  expect(authorization.searchParams.get("scope")).toBe("openid email profile");
});
