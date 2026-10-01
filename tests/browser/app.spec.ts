import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

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
