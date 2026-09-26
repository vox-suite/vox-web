import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { playwrightCookies } from "../fixtures/consumer-app/supabase-auth.mjs";

const AREAS = [
  "",
  "/journeys",
  "/tasks",
  "/reminders",
  "/approvals",
  "/apps",
  "/privacy",
  "/account",
];

/** A fresh synthetic user per test keeps mock Core state isolated between runs. */
async function signIn(page: Page) {
  const email = `user${Date.now()}${Math.floor(Math.random() * 1e6)}@example.test`;
  const cookies = playwrightCookies({
    email,
    fullName: "Asha Raman",
  }) as Parameters<BrowserContext["addCookies"]>[0];
  await page.context().addCookies(cookies);
  return email;
}

test("signed-out visitors are sent to sign-in", async ({ page }) => {
  await page.goto("/app/reminders");
  await expect(page).toHaveURL(/\/app\/sign-in/);
});

test("every area loads for a signed-in user", async ({ page }) => {
  const email = await signIn(page);
  await page.goto("/app");
  await expect(page.getByRole("main").getByText(email)).toBeVisible();
  for (const area of AREAS) {
    await page.goto(`/app${area}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("create a reminder", async ({ page }) => {
  await signIn(page);
  await page.goto("/app/reminders");
  await page.getByLabel("Reminder title").fill("Stand-up");
  await page
    .getByLabel("Notification message")
    .fill("Daily stand-up in 5 minutes");
  await page.getByLabel(/^Destination/).fill("+15551234567");
  await page.getByLabel("Schedule kind").selectOption("interval");
  await page.getByRole("button", { name: "Schedule reminder" }).click();
  await expect(page.getByText("Reminder successfully created")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Stand-up" })).toBeVisible();
});

test("start a durable task", async ({ page }) => {
  await signIn(page);
  await page.goto("/app/tasks");
  await page.getByLabel("Task title").fill("Plan the week");
  await page
    .getByLabel("Instruction")
    .fill("Summarise my calendar for the week");
  await page.getByRole("button", { name: "Submit durable task" }).click();
  await expect(
    page.getByRole("article", { name: "Plan the week" }),
  ).toBeVisible();
});

test("plugin library keeps registration and skills reachable", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/app/apps");
  await expect(
    page.getByRole("heading", { name: "Plugins", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Public" }).click();
  await expect(
    page.getByRole("heading", { name: "Public plugin catalog" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Personal" }).click();
  await page.getByRole("button", { name: "Add server" }).click();
  await expect(
    page.getByRole("form", { name: "Add MCP server" }),
  ).toBeVisible();
  await page.getByLabel("Name (optional)").fill("Team notes");
  await page.getByLabel("MCP server URL").fill("https://notes.example.com/mcp");
  await page.getByRole("button", { name: "Save server" }).click();
  await expect(page.getByText(/Team notes.*saved/)).toBeVisible();
  await page.getByRole("button", { name: /Team notes MCP/ }).click();
  await expect(page.getByText("Server details not verified")).toBeVisible();
  await page.getByRole("button", { name: "Skills", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Skills", level: 1 }),
  ).toBeVisible();
});

test("consumer plugin marketplace enables 1-click install with brand assets and top dock", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/app/apps");

  // Verify Plugins marketplace headings & categories
  await expect(
    page.getByRole("heading", { name: "Plugins", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Popular" })).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Food & Groceries" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "DoorDash", level: 3 }).first(),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Uber", level: 3 }).first(),
  ).toBeVisible();

  // Perform 1-click install on DoorDash
  await page.getByRole("button", { name: "Install DoorDash" }).first().click();

  // Verify DoorDash installed in top dock
  await expect(
    page.getByRole("button", { name: /DoorDash active/i }),
  ).toBeVisible();
});
