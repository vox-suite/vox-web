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
    page.getByRole("heading", { name: "Your chief of staff, on speed dial." }),
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

  await page.goto("/admin/health");
  await expect(page).toHaveURL(/\/admin\/login/);

  const response = await request.get("/api/admin/redis");
  expect(response.status()).toBe(401);
  expect(response.headers()["cache-control"]).toContain("no-store");
  expect(response.headers()["x-ratelimit-limit"]).toBeTruthy();

  const healthRes = await request.get("/api/admin/health");
  expect(healthRes.status()).toBe(401);
  expect(healthRes.headers()["cache-control"]).toContain("no-store");
  expect(healthRes.headers()["x-ratelimit-limit"]).toBeTruthy();

  expect(
    (
      await request.put("/api/admin/redis", {
        data: { key: "vox:test", type: "string", value: "blocked" },
      })
    ).status(),
  ).toBe(401);
  expect((await request.delete("/api/admin/redis?key=vox:test")).status()).toBe(
    401,
  );
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
  expect((await page.request.get("/api/admin/health")).status()).toBe(401);
  await context.clearCookies();
  await session(context, "admin@example.test", false);
  expect((await page.request.get("/api/admin/redis")).status()).toBe(401);
  expect((await page.request.get("/api/admin/health")).status()).toBe(401);
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
  await page.getByRole("button", { name: "Edit value" }).click();
  await page
    .getByLabel("Redis value")
    .fill('{"name":"Fixture user","summary":"Updated from the console."}');
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Redis entry updated.")).toBeVisible();
  await expect(
    page.getByText("Updated from the console.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close entry preview" }).click();
  await page
    .getByRole("button", { name: "vox:user-context:fixture-002", exact: true })
    .click();
  await page.getByRole("button", { name: "Delete entry" }).click();
  await page.getByRole("button", { name: "Confirm delete" }).click();
  await expect(page.getByText("Redis entry deleted.")).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "vox:user-context:fixture-002",
      exact: true,
    }),
  ).toHaveCount(0);
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

test("system health dashboard displays metrics, container resources and adheres to accessibility", async ({
  context,
  page,
}, testInfo) => {
  await session(context);
  await page.goto("/admin/health");
  await expect(
    page.getByRole("heading", { name: "System health", exact: true }),
  ).toBeVisible();

  // Verify key stats are present
  await expect(page.getByText("CPU usage")).toBeVisible();
  await expect(page.getByText("RAM in use")).toBeVisible();
  await expect(page.getByText("Containers", { exact: true })).toBeVisible();
  await expect(page.getByText("System uptime")).toBeVisible();

  // Verify memory allocation and host cards
  await expect(page.getByText("Memory allocation")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Container resources" }),
  ).toBeVisible();

  // Verify rate limit headers were sent with response
  const response = await page.request.get("/api/admin/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["x-ratelimit-limit"]).toBeTruthy();
  expect(response.headers()["x-ratelimit-remaining"]).toBeTruthy();

  // Verify horizontal scroll width
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);

  // Verify accessibility
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  expect(results.violations).toEqual([]);

  await page.screenshot({
    path: `artifacts/health-${testInfo.project.name}.png`,
    fullPage: true,
  });
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

test("changelog page displays timeline milestones and is accessible", async ({
  page,
}, testInfo) => {
  await page.goto("/changelog");
  await expect(
    page.getByRole("heading", { name: "Every milestone, measured." }),
  ).toBeVisible();
  await expect(page.getByText("Sep 21, 2026")).toBeVisible();
  await expect(page.locator(".changelog-relative-time").first()).toHaveText(
    "v0.5.0",
  );
  await expect(
    page.getByText("WeSpeaker Neural Voice Biometrics", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("Sep 19, 2026")).toBeVisible();
  await expect(page.getByText("Sep 07, 2026")).toBeVisible();

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
    path: `artifacts/changelog-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("header brand animates with canvas thinking-orb while footer brand uses static SVG", async ({
  page,
}) => {
  await page.goto("/");

  // Header brand has animated canvas orb
  const headerBrand = page.locator(".site-header .brand");
  await expect(headerBrand).toBeVisible();
  const headerCanvas = headerBrand.locator("canvas");
  await expect(headerCanvas).toBeVisible();

  // Footer brand has static SVG orb with circle dots
  const footerBrand = page.locator(".site-footer .brand");
  await expect(footerBrand).toBeVisible();
  const footerSvg = footerBrand.locator("svg");
  await expect(footerSvg).toBeVisible();
  expect(await footerSvg.locator("circle").count()).toBeGreaterThan(100);

  // Favicon svg endpoint serves valid SVG with circles
  const res = await page.request.get("/vox.svg");
  expect(res.status()).toBe(200);
  const svgText = await res.text();
  expect(svgText).toContain("<svg");
  expect(svgText).toContain("<circle");
});
