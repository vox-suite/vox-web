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
    .getByRole("link", { name: "Overview" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Overview", exact: true }),
  ).toBeVisible();
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

test("consumer email sign-in, recovery, and revocation use the real database boundary", async ({
  page,
  request,
}, testInfo) => {
  test.skip(
    !process.env.VOX_WEB_TEST_DATABASE_URL,
    "requires isolated PostgreSQL",
  );
  const email = `consumer-${testInfo.project.name}@example.test`;
  const clientIp =
    testInfo.project.name === "mobile" ? "192.0.2.22" : "192.0.2.21";
  await page.context().setExtraHTTPHeaders({ "x-forwarded-for": clientIp });
  const oauth = await request.post(
    "http://localhost:3100/api/account/auth/sign-in/social",
    {
      headers: {
        Origin: "http://localhost:3100",
        "x-forwarded-for": clientIp,
      },
      data: {
        provider: "google",
        callbackURL: "/app",
        disableRedirect: true,
      },
    },
  );
  expect(oauth.status()).toBe(200);
  const oauthBody = (await oauth.json()) as { url: string };
  const authorization = new URL(oauthBody.url);
  expect(authorization.hostname).toBe("accounts.google.com");
  expect(authorization.searchParams.get("state")).toBeTruthy();
  expect(authorization.searchParams.get("code_challenge")).toBeTruthy();
  expect(authorization.searchParams.get("scope")).toContain("openid");
  expect(authorization.searchParams.get("redirect_uri")).toBe(
    "http://localhost:3100/api/account/auth/callback/google",
  );
  await page.goto("http://localhost:3100/app/sign-in");
  await expect(
    page.getByRole("heading", { name: "Pick up where you left off." }),
  ).toBeVisible();
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Continue with email" }).click();
  await expect(page.getByText("If this address can sign in")).toBeVisible();
  const delivered = await expect
    .poll(async () => {
      const response = await request.get(
        `http://127.0.0.1:3103/latest?email=${encodeURIComponent(email)}`,
      );
      return (await response.json()).code as string | null;
    })
    .not.toBeNull();
  void delivered;
  const codeResponse = await request.get(
    `http://127.0.0.1:3103/latest?email=${encodeURIComponent(email)}`,
  );
  const { code } = (await codeResponse.json()) as { code: string };
  await page.getByLabel("Eight-digit code").fill(code);
  await page.getByRole("button", { name: "Verify and sign in" }).click();
  await expect(page.getByRole("heading", { name: /Welcome/ })).toBeVisible();
  await expect(page.getByText(email)).toBeVisible();
  const publicSessionResponse = await page.request.get(
    "http://localhost:3100/api/account/auth/get-session",
  );
  expect(publicSessionResponse.status()).toBe(200);
  const publicSession = (await publicSessionResponse.json()) as Record<
    string,
    unknown
  >;
  expect(Object.keys(publicSession).sort()).toEqual([
    "accountId",
    "authenticationMethod",
    "coreUserContextId",
    "email",
    "expiresAt",
    "image",
    "name",
    "recoveryEnabled",
  ]);
  expect(publicSession.email).toBe(email);
  expect(publicSession.authenticationMethod).toBe("email-otp");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Enable email recovery" }).click();
  const recoveryCode = await expect
    .poll(async () => {
      const response = await request.get(
        `http://127.0.0.1:3103/latest?email=${encodeURIComponent(email)}`,
      );
      const body = (await response.json()) as { code: string | null };
      return body.code === code ? null : body.code;
    })
    .not.toBeNull();
  void recoveryCode;
  const recoveryResponse = await request.get(
    `http://127.0.0.1:3103/latest?email=${encodeURIComponent(email)}`,
  );
  const recovery = (await recoveryResponse.json()) as { code: string };
  await page.getByLabel("Eight-digit recovery code").fill(recovery.code);
  await page.getByRole("button", { name: "Verify recovery code" }).click();
  await expect(page.getByText("Email recovery is enabled")).toBeVisible();
  await page.getByRole("button", { name: "Sign out everywhere" }).click();
  await expect(page).toHaveURL(/\/app\/sign-in$/);
});

test("consumer and administrator sessions grant no authority to one another", async ({
  context,
  page,
}) => {
  test.skip(
    !process.env.VOX_WEB_TEST_DATABASE_URL,
    "requires isolated PostgreSQL",
  );
  await session(context);
  await page.goto("http://localhost:3100/app");
  await expect(page).toHaveURL(/\/app\/sign-in/);
  expect((await page.request.get("/api/admin/redis")).status()).toBe(200);
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
