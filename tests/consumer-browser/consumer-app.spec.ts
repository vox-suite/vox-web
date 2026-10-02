import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import { playwrightCookies } from "../fixtures/consumer-app/supabase-auth.mjs";

const AREAS = [
  "",
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

test("email verification, reload and sign-out use the Supabase session boundary", async ({
  page,
}) => {
  const email = `otp${Date.now()}@example.test`;
  await page.goto("/app/sign-in");
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Continue with email" }).click();
  await page.getByLabel("Verification code").fill("000000");
  await page.getByRole("button", { name: "Verify and sign in" }).click();
  await expect(
    page.getByText(
      "That code is invalid or expired. Request a new code and try again.",
      { exact: true },
    ),
  ).toBeVisible();
  expect((await page.request.get("/api/account/agents")).status()).toBe(401);
  await page.getByLabel("Verification code").fill("123456");
  await page.getByRole("button", { name: "Verify and sign in" }).click();
  await expect(page).toHaveURL(/\/app$/);
  await page.goto("/app/account");
  await expect(
    page.getByRole("main").getByText(email, { exact: true }),
  ).toBeVisible();
  await expect(page.getByText("Email recovery is enabled")).toHaveCount(0);
  await page.reload();
  expect((await page.request.get("/api/account/agents")).status()).toBe(200);
  await page.getByRole("button", { name: "Sign out everywhere" }).click();
  await expect(page).toHaveURL(/\/app\/sign-in$/);
  expect((await page.request.get("/api/account/agents")).status()).toBe(401);
});

test("verified but unpinned sessions fail closed and identity joining stays unavailable", async ({
  page,
}) => {
  const cookies = playwrightCookies({
    email: `unpinned${Date.now()}@example.test`,
    includePin: false,
  }) as Parameters<BrowserContext["addCookies"]>[0];
  await page.context().addCookies(cookies);
  expect((await page.request.get("/api/account/agents")).status()).toBe(401);
  await page.goto("/app/account");
  await expect(page).toHaveURL(/\/app\/sign-in/);
  await page.context().clearCookies();
  await signIn(page);
  await page.goto("/app/account");
  await expect(
    page.getByText("Identity linking is not available yet", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Link a verified Google identity" }),
  ).toHaveCount(0);
});

test("ordinary chat uses Personal Assistant without agent selection and rejects foreign-origin messages", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/app");
  await expect(
    page.getByLabel("Ask Personal Assistant", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Choose an agent" }),
  ).toHaveCount(0);
  const request = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/account/conversations") &&
      request.method() === "POST",
  );
  await page
    .getByLabel("Ask Personal Assistant", { exact: true })
    .fill("Summarize my day");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  expect((await request).postDataJSON().agentKey).toBe("general");
  await expect(
    page.getByText("The summary skill is not enabled for this agent.", {
      exact: true,
    }),
  ).toBeVisible();
  const denied = await page.request.post("/api/account/conversations", {
    headers: { Origin: "https://untrusted.example" },
    data: {
      agentKey: "general",
      conversationId: "11111111-1111-4111-8111-111111111111",
      text: "Do something",
    },
  });
  expect(denied.status()).toBe(403);
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

test("saved tasks survive reload and stop rejects foreign-origin requests", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/app/tasks");
  await page.getByLabel("Task title").fill("Retain this task");
  await page
    .getByLabel("Instruction")
    .fill("Find choices, then ask me to book");
  await page.getByRole("button", { name: "Submit durable task" }).click();
  const card = page.getByRole("article", { name: "Retain this task" });
  await expect(card).toBeVisible();
  await page.reload();
  await expect(card).toBeVisible();
  const id = (await card.getAttribute("data-testid"))!.slice(5);
  const denied = await page.request.post(`/api/account/tasks/${id}/cancel`, {
    headers: { origin: "https://foreign.example" },
  });
  expect(denied.status()).toBe(403);
  await card
    .getByRole("button", { name: "Cancel task: Retain this task" })
    .click();
  await expect(
    card.getByText(
      "Future work stopped. Completed actions have not been undone.",
    ),
  ).toBeVisible();
  await page.reload();
  await expect(
    card.getByText(
      "Future work stopped. Completed actions have not been undone.",
    ),
  ).toBeVisible();
  const approvalTask = page.getByRole("article", {
    name: "Plan a Goa weekend",
  });
  await approvalTask
    .getByRole("button", { name: "Check and continue" })
    .click();
  await expect(
    approvalTask.getByText(
      "Task cannot continue yet. Resolve its current wait and refresh status.",
    ),
  ).toBeVisible();
});

test("clarification answers stay bound to the waiting task", async ({
  page,
  request,
}) => {
  await signIn(page);
  await page.goto("/app/tasks");
  await page.getByLabel("Task title").fill("Clarify trip");
  await page.getByLabel("Instruction").fill("Suggest trip options");
  await page.getByRole("button", { name: "Submit durable task" }).click();
  const card = page.getByRole("article", { name: "Clarify trip" });
  await expect(card).toBeVisible();
  const id = (await card.getAttribute("data-testid"))!.slice(5);
  await request.post(`http://127.0.0.1:3201/__fixture/tasks/${id}/state`, {
    data: { state: "waiting", wait_reason: "clarification", pinned: true },
  });
  await card
    .getByRole("button", {
      name: "Check authoritative status for task: Clarify trip",
    })
    .click();
  const answer = card.getByLabel("Answer for task: Clarify trip");
  await expect(answer).toBeVisible();
  await expect(
    card.getByRole("button", { name: "Check and continue" }),
  ).toBeDisabled();
  const tooLong = await page.request.post(`/api/account/tasks/${id}/resume`, {
    headers: { origin: "http://127.0.0.1:3200" },
    data: { reply: "😀".repeat(2049) },
  });
  expect(tooLong.status()).toBe(400);
  await answer.fill("A weekend in October");
  await card.getByRole("button", { name: "Check and continue" }).click();
  await expect(answer).toHaveCount(0);
});

test("plugin library keeps registration and skills reachable", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/app/apps");
  await expect(
    page.getByRole("heading", { name: "Library", level: 1 }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Public" }).click();
  await expect(
    page.getByRole("heading", { name: "Apps", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Personal", exact: true }).click();
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
    page.getByRole("heading", { name: "Skills", level: 2 }),
  ).toBeVisible();
});

test("reviewed connector preserves chosen assistant access through OAuth", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/app/apps");
  const card = page.getByTestId("plugin-card-team-notes");
  await expect(card.getByRole("heading", { name: "Team Notes" })).toBeVisible();
  await expect(card.getByText("Read notes")).toBeVisible();
  await card
    .getByRole("button", { name: "Connect Team Notes", exact: true })
    .click();
  const setup = page.getByRole("region", { name: "Assistant access" });
  await expect(setup.getByRole("combobox")).toHaveValue("general");
  await expect(
    setup.getByRole("checkbox", { name: "Read notes", exact: true }),
  ).toBeChecked();
  await setup
    .getByRole("button", {
      name: "Connect and enable for Personal Assistant",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("Team Notes account linked", { exact: true }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(
    page.getByText(/Setup completed with your chosen assistant access/),
  ).toBeVisible();
  await expect(page.getByTestId("connected-badge-team-notes")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Agent access" }),
  ).toBeVisible();
});

test("a default skill installs for the selected agent and is available in conversation", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/app/apps");
  await page.getByRole("button", { name: "Skills", exact: true }).click();
  const skill = page.getByRole("article", {
    name: "Summarize and extract actions",
  });
  // Wait for the version response, including a cold Next.js route compile,
  // before asserting the review UI. A failed response still fails this gate.
  const versionResponse = page.waitForResponse(
    (response) =>
      new URL(response.url()).pathname ===
      "/api/account/skills/skill_summarize_actions/versions/1",
  );
  await skill.getByRole("button", { name: "Review and install" }).click();
  expect((await versionResponse).ok()).toBeTruthy();
  await expect(
    page.getByRole("heading", {
      name: "Review Summarize and extract actions v1",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Install and enable v1" }).click();
  await expect(
    page.getByText(/Summarize and extract actions is installed and available/),
  ).toBeVisible();
  await page.getByLabel(/^Ask /).fill("Summarize my notes");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(
    page.getByText(
      "I can use Summarize and extract actions. Paste the text to summarize.",
    ),
  ).toBeVisible();
});

test("connected accounts offer only what each connection allows", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/app/apps");
  await page
    .locator("summary", { hasText: "Connected accounts and agent access" })
    .click();

  const uber = page.getByTestId(
    "connection-bbbbbbbb-2222-4222-8222-222222222222",
  );
  await uber.getByText("Trip history", { exact: true }).click();
  await uber.getByRole("button", { name: "Load trip history" }).click();
  await expect(uber.getByText(/^Trip #/).first()).toBeVisible();

  // The Expedia connection has expired, so it offers no booking actions.
  const expedia = page.getByTestId(
    "connection-cccccccc-3333-4333-8333-333333333333",
  );
  await expect(expedia).toBeVisible();
  await expect(expedia.getByText("Find a stay")).toHaveCount(0);

  // Old bookmarks land on Apps & skills.
  await page.goto("/app/journeys");
  await expect(page).toHaveURL(/\/app\/apps$/);
});

test("create, edit and archive a specialist without changing the default", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/app/apps");
  await page.getByRole("button", { name: "Manage assistants" }).first().click();
  await page.getByLabel("Assistant name").fill("Engineering");
  await page
    .getByLabel("Instructions", { exact: true })
    .fill("Review code and cite files.");
  await page
    .getByRole("button", { name: "Create assistant", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Engineering", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Engineering", exact: true }).click();
  await expect(
    page.getByLabel("Ask Engineering", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Manage assistants" }).first().click();
  await page
    .getByRole("button", { name: "Edit Engineering", exact: true })
    .click();
  await page.getByLabel("Assistant name").fill("Code Reviewer");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Code Reviewer", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Manage assistants" }).first().click();
  await page
    .getByRole("button", { name: "Edit Code Reviewer", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Archive assistant", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Code Reviewer", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: /Personal Assistant · Default/ }),
  ).toBeVisible();
});

test("inspect, clear and disable memory separately for an assistant", async ({
  page,
}) => {
  await signIn(page);
  await page.goto("/app/apps");
  await page.getByRole("button", { name: "Manage assistants" }).first().click();
  await page
    .getByRole("button", { name: "Edit Personal Assistant", exact: true })
    .click();
  const memory = page.getByRole("region", {
    name: "Personal Assistant memory",
  });
  await expect(
    memory.getByText("Private assistant note", { exact: true }),
  ).toBeVisible();
  await memory
    .getByRole("button", { name: "Clear memory", exact: true })
    .click();
  await memory
    .getByRole("button", { name: "Confirm clear memory", exact: true })
    .click();
  await expect(
    memory.getByText("No retained memory.", { exact: true }),
  ).toBeVisible();
  await memory.getByLabel("Retain memory for this assistant").uncheck();
  await expect(
    memory.getByLabel("Retain memory for this assistant"),
  ).not.toBeChecked();
  await expect(
    memory.getByLabel("Retain memory for this assistant"),
  ).toBeEnabled();
  await page.reload();
  await page.getByRole("button", { name: "Manage assistants" }).first().click();
  await page
    .getByRole("button", { name: "Edit Personal Assistant", exact: true })
    .click();
  await expect(
    memory.getByLabel("Retain memory for this assistant"),
  ).not.toBeChecked();
  await memory.getByLabel("Retain memory for this assistant").check();
  await expect(
    memory.getByLabel("Retain memory for this assistant"),
  ).toBeEnabled();
  await expect(
    memory.getByText("No retained memory.", { exact: true }),
  ).toBeVisible();
  const rejected = await page.request.post(
    "/api/account/agents/general/memory",
    {
      data: { operation: "clear" },
      headers: { Origin: "https://foreign.example" },
    },
  );
  expect(rejected.status()).toBe(403);
});

test("specialist permissions name accounts/tools and retain once vs remembered scopes with revocation", async ({
  page,
}) => {
  await signIn(page);
  const parentResponse = await page.request.post("/api/account/tasks", {
    headers: { Origin: "http://127.0.0.1:3200" },
    data: {
      title: "Arrange next week",
      instruction: "Plan my calendar",
      agent_external_key: "general",
    },
  });
  expect(parentResponse.status()).toBe(201);
  const parent = (await parentResponse.json()).task;
  await page.request.post(
    `http://127.0.0.1:3201/__fixture/tasks/${parent.id}/state`,
    { data: { state: "waiting", wait_reason: "clarification" } },
  );
  await page.goto("/app/tasks");
  await page
    .getByLabel("Specialist assistant", { exact: true })
    .selectOption("concierge");
  await expect(
    page.getByLabel(
      "Create calendar events · Google Calendar · asha.raman@example.test",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(page.getByLabel("Share allergies", { exact: true })).toHaveCount(
    0,
  );
  await page.getByLabel("Task for one-time permission").selectOption(parent.id);
  await page
    .getByLabel(
      "Create calendar events · Google Calendar · asha.raman@example.test",
      { exact: true },
    )
    .check();
  await page.getByLabel("Share seat preference", { exact: true }).check();
  const onceRequest = page.waitForRequest(
    (request) =>
      request.url().endsWith("/api/account/delegation") &&
      request.method() === "POST",
  );
  await page
    .getByRole("button", { name: "Allow specialist work", exact: true })
    .click();
  const once = (await onceRequest).postDataJSON();
  expect(once.parent_run_id).toBe(parent.run_id);
  expect(once.preference_keys).toEqual(["seat_preference"]);
  expect(once.scope.capabilities).toEqual([
    {
      connection_id: "aaaaaaaa-1111-4111-8111-111111111111",
      capability_external_key: "calendar.events.write",
    },
  ]);
  await expect(
    page.getByText("Once for this task", { exact: true }).last(),
  ).toBeVisible();
  await page.getByLabel("Remember for future tasks", { exact: true }).check();
  await page
    .getByLabel(
      "Create calendar events · Google Calendar · asha.raman@example.test",
      { exact: true },
    )
    .check();
  await page
    .getByRole("button", { name: "Allow specialist work", exact: true })
    .click();
  await expect(
    page.getByText("Remembered for future tasks", { exact: true }),
  ).toBeVisible();
  await page.reload();
  const saved = page
    .getByRole("region", { name: "Personal Assistant to Concierge permission" })
    .filter({ hasText: "Remembered for future tasks" });
  await expect(saved).toBeVisible();
  await expect(
    page.getByText("fixture-not-user-visible", { exact: false }),
  ).toHaveCount(0);
  await saved.getByRole("button", { name: "Revoke permission" }).click();
  await expect(saved.getByText("Revoked", { exact: true })).toBeVisible();
  expect(
    (
      await page.request.post("/api/account/delegation", {
        headers: { Origin: "https://foreign.example" },
        data: once,
      })
    ).status(),
  ).toBe(403);
});

test("specialist lineage is visible and Stop all stops future parent and child work", async ({
  page,
}) => {
  await signIn(page);
  const start = async (title: string) =>
    (
      await (
        await page.request.post("/api/account/tasks", {
          headers: { Origin: "http://127.0.0.1:3200" },
          data: {
            title,
            instruction: "Plan my calendar",
            agent_external_key: "general",
          },
        })
      ).json()
    ).task;
  const parent = await start("Plan my week");
  const child = await start("Check meeting availability");
  await page.request.post(
    `http://127.0.0.1:3201/__fixture/tasks/${parent.id}/state`,
    { data: { state: "waiting", wait_reason: "specialist" } },
  );
  await page.request.post(
    `http://127.0.0.1:3201/__fixture/tasks/${child.id}/state`,
    {
      data: {
        state: "running",
        parent_task_id: parent.id,
        agent_external_key: "concierge",
      },
    },
  );
  await page.goto("/app/tasks");
  await expect(page.getByTestId(`task-${child.id}`)).toContainText(
    "Specialist work for Plan my week",
  );
  await expect(page.getByTestId(`task-${child.id}`)).toContainText(
    "Assistant: Concierge",
  );
  await expect(page.getByTestId(`task-${parent.id}`)).toContainText(
    "Waiting for the specialist’s relevant result.",
  );
  expect(
    (
      await page.request.post("/api/account/tasks/stop-all", {
        headers: { Origin: "https://foreign.example" },
      })
    ).status(),
  ).toBe(403);
  await page
    .getByRole("button", { name: "Stop all tasks", exact: true })
    .click();
  await expect(
    page.getByText("Future task work stopped", { exact: true }),
  ).toBeVisible();
  await expect(page.getByTestId(`task-${parent.id}`)).toContainText(
    "cancelled",
  );
  await expect(page.getByTestId(`task-${child.id}`)).toContainText("cancelled");
  await page.reload();
  await expect(page.getByTestId(`task-${child.id}`)).toContainText(
    "Completed actions have not been undone.",
  );
});
