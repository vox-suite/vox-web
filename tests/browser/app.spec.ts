import { test, expect, type BrowserContext } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { encodeAdminE2ESession } from "../../src/lib/access";

async function session(
  context: BrowserContext,
  email = "admin@example.test",
  googleVerified = true,
) {
  const secret = "isolated-playwright-secret-not-for-production";
  const value = encodeAdminE2ESession(email, secret, googleVerified);
  await context.addCookies([
    {
      name: "vox-admin-session",
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
  await page.getByRole("button", { name: "Delegate a commitment" }).click();
  await expect(
    page.getByText("There’s a lot on my mind this week."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "A call becomes follow-through." }),
  ).toBeVisible();
  await expect(page.getByText("Recognizes who is speaking")).toBeVisible();
  await expect(page.getByText("Calls back when it matters")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What Vox can do today." }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Read the latest releases" }),
  ).toHaveAttribute("href", "/changelog");
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
  await page.goto("/admin/health");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();

  await page.goto("/admin/health");
  await expect(page).toHaveURL(/\/admin\/login/);

  const healthRes = await request.get("/api/admin/health");
  expect(healthRes.status()).toBe(401);
  expect(healthRes.headers()["cache-control"]).toContain("no-store");
  expect(healthRes.headers()["x-ratelimit-limit"]).toBeTruthy();

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
  expect((await page.request.get("/api/admin/health")).status()).toBe(401);
  await context.clearCookies();
  await session(context, "admin@example.test", false);
  expect((await page.request.get("/api/admin/health")).status()).toBe(401);
});
test("management navigation and sign out", async ({
  context,
  page,
}, testInfo) => {
  await session(context);
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
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
  await page.screenshot({
    path: `artifacts/overview-${testInfo.project.name}.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  expect((await page.request.get("/api/admin/health")).status()).toBe(401);
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

  await expect(page.getByText("CPU usage")).toBeVisible();
  await expect(page.getByText("RAM in use")).toBeVisible();
  await expect(page.getByText("Docker engine", { exact: true })).toBeVisible();
  await expect(
    page.getByText("Host uptime", { exact: true }).first(),
  ).toBeVisible();

  await expect(
    page.getByRole("heading", { name: "Memory utilization" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Container resources" }),
  ).toBeVisible();

  const response = await page.request.get("/api/admin/health");
  expect(response.status()).toBe(200);
  expect(response.headers()["x-ratelimit-limit"]).toBeTruthy();
  expect(response.headers()["x-ratelimit-remaining"]).toBeTruthy();

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
    path: `artifacts/health-${testInfo.project.name}.png`,
    fullPage: true,
  });
});

test("admin login is configured for Supabase Google sign-in", async ({
  page,
}) => {
  await page.goto("/admin/login");
  await expect(
    page.getByRole("button", { name: "Continue with Google" }),
  ).toBeVisible();
  await expect(
    page.getByText("Access is limited to approved superusers."),
  ).toBeVisible();
  await expect(page.getByText("Sign-in is not available yet")).toHaveCount(0);
});

test("consumer and administrator sessions grant no authority to one another", async ({
  context,
  page,
}) => {
  await session(context);
  await page.goto("http://localhost:3100/app");
  await expect(page).toHaveURL(/\/app\/sign-in/);
  expect((await page.request.get("/api/admin/health")).status()).toBe(200);
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

  const headerBrand = page.locator(".site-header .brand");
  await expect(headerBrand).toBeVisible();
  const headerCanvas = headerBrand.locator("canvas");
  await expect(headerCanvas).toBeVisible();

  const footerBrand = page.locator(".site-footer .brand");
  await expect(footerBrand).toBeVisible();
  const footerSvg = footerBrand.locator("svg");
  await expect(footerSvg).toBeVisible();
  expect(await footerSvg.locator("circle").count()).toBeGreaterThan(100);

  const res = await page.request.get("/vox.svg");
  expect(res.status()).toBe(200);
  const svgText = await res.text();
  expect(svgText).toContain("<svg");
  expect(svgText).toContain("<circle");
});
