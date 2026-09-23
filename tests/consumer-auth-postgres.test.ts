import assert from "node:assert/strict";
import test from "node:test";
import { betterAuth } from "better-auth";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";
import { ConsumerAccountAuthority } from "../src/lib/consumer-auth/account-authority";
import { buildConsumerAuthOptions } from "../src/lib/consumer-auth/auth-options";
import type { ConsumerAuthEnabledConfig } from "../src/lib/consumer-auth/config";
import { VoxCoreHostClient } from "../src/lib/consumer-auth/core-host-client";
import { RecordingAuthEmailSender } from "../src/lib/consumer-auth/email";

const databaseUrl = process.env.VOX_WEB_TEST_DATABASE_URL;
const pgTest = databaseUrl ? test : test.skip;

function request(path: string, body?: unknown, cookie?: string) {
  const email =
    body && typeof body === "object" && "email" in body
      ? String((body as { email: unknown }).email)
      : "session";
  const ipSuffix =
    (Array.from(email).reduce(
      (total, character) => total + character.charCodeAt(0),
      0,
    ) %
      200) +
    1;
  return new Request(`https://app.voxagent.in/api/account/auth${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Origin: "https://app.voxagent.in",
      "x-forwarded-for": `192.0.2.${ipSuffix}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

function responseCookie(response: Response) {
  return response.headers
    .getSetCookie()
    .map((value) => value.split(";", 1)[0])
    .join("; ");
}

pgTest(
  "email OTP creates one stable account and is single-use under concurrency",
  async () => {
    const pool = new Pool({ connectionString: databaseUrl, max: 5 });
    await pool.query(
      `TRUNCATE vox_web_auth."rateLimit", vox_web_auth.verification,
              vox_web_auth.session, vox_web_auth.account, vox_web_auth."user"
       RESTART IDENTITY CASCADE`,
    );
    const database = new Kysely<Record<string, never>>({
      dialect: new PostgresDialect({ pool }),
    });
    const messages = new RecordingAuthEmailSender();
    const coreCalls: string[] = [];
    const core = new VoxCoreHostClient(
      {
        baseUrl: "https://core.example.test",
        hostCredential: {
          credentialId: "host",
          audience: "aud",
          secret: "secret",
        },
        identityAdapterKey: "vox-web-test",
        identityCredential: {
          issuer: "https://app.voxagent.in",
          audience: "core",
          privateKeyPkcs8Base64:
            "MC4CAQAwBQYDK2VwBCIEIBERERERERERERERERERERERERERERERERERERERERER",
        },
      },
      {
        now: () => 2_000_000_000,
        nonce: () => crypto.randomUUID(),
        fetch: async (_url, init) => {
          const body = JSON.parse(String(init?.body)) as {
            host_context: { host_user_id: string };
          };
          coreCalls.push(body.host_context.host_user_id);
          return Response.json({
            user_context_id: `ctx:${body.host_context.host_user_id}`,
            authentication_token: "must-not-be-retained",
          });
        },
      },
    );
    const accounts = new ConsumerAccountAuthority(pool, core);
    const config: ConsumerAuthEnabledConfig = {
      enabled: true,
      entryEnabled: true,
      appUrl: "https://app.voxagent.in",
      databaseUrl: databaseUrl!,
      authSecret: "s".repeat(48),
      googleClientId: "fixture-google",
      googleClientSecret: "fixture-secret",
      otpPepper: "p".repeat(48),
      smtpUrl: "smtp://unused",
      emailFrom: "Vox <hello@voxagent.in>",
      sessionMaxAgeSeconds: 28_800,
      otpExpiresInSeconds: 600,
      otpAllowedAttempts: 5,
      core: {} as ConsumerAuthEnabledConfig["core"],
    };
    const auth = betterAuth(
      buildConsumerAuthOptions(config, {
        database: {
          db: database,
          type: "postgres",
          schemaName: "vox_web_auth",
          transaction: true,
        },
        accountAuthority: accounts,
        emailSender: messages,
      }),
    );

    const email = "person@example.test";
    const send = await auth.handler(
      request("/email-otp/send-verification-otp", { email, type: "sign-in" }),
    );
    assert.equal(send.status, 200);
    const code = messages.latestFor(email)?.code;
    assert.match(code ?? "", /^\d{8}$/);

    const attempts = await Promise.all([
      auth.handler(
        request("/sign-in/email-otp", { email, otp: code, name: "Person" }),
      ),
      auth.handler(
        request("/sign-in/email-otp", { email, otp: code, name: "Person" }),
      ),
    ]);
    assert.deepEqual(
      attempts.map((response) => response.status).sort(),
      [200, 400],
    );
    const successful = attempts.find((response) => response.status === 200);
    assert.ok(successful);
    const cookie = responseCookie(successful);
    assert.match(cookie, /vox_account\.session_token=/);

    const session = await auth.handler(
      request("/get-session", undefined, cookie),
    );
    assert.equal(session.status, 200);
    const sessionBody = (await session.json()) as { user: { id: string } };
    const stored = await pool.query<{
      core_context: string;
      account_state: string;
      token_leaked: boolean;
    }>(
      `SELECT "coreUserContextId" AS core_context,
            "accountState" AS account_state,
            ("coreUserContextId" LIKE '%must-not-be-retained%') AS token_leaked
       FROM vox_web_auth."user" WHERE id = $1`,
      [sessionBody.user.id],
    );
    assert.equal(
      stored.rows[0].core_context,
      `ctx:vox-account:${sessionBody.user.id}`,
    );
    assert.equal(stored.rows[0].account_state, "active");
    assert.equal(stored.rows[0].token_leaked, false);
    assert.deepEqual(coreCalls, [
      `vox-account:${sessionBody.user.id}`,
      `vox-account:${sessionBody.user.id}`,
    ]);

    const lifetime = await pool.query<{
      seconds: string;
      authentication_method: string;
    }>(
      `SELECT EXTRACT(EPOCH FROM ("expiresAt" - "createdAt"))::text AS seconds,
            "authenticationMethod" AS authentication_method
       FROM vox_web_auth.session WHERE "userId" = $1`,
      [sessionBody.user.id],
    );
    assert.equal(Number(lifetime.rows[0].seconds), 28_800);
    assert.equal(lifetime.rows[0].authentication_method, "email-otp");

    const replay = await auth.handler(
      request("/sign-in/email-otp", { email, otp: code, name: "Person" }),
    );
    assert.equal(replay.status, 400);

    const rotatedEmail = "rotation@example.test";
    await auth.handler(
      request("/email-otp/send-verification-otp", {
        email: rotatedEmail,
        type: "sign-in",
      }),
    );
    const oldCode = messages.latestFor(rotatedEmail)?.code;
    await auth.handler(
      request("/email-otp/send-verification-otp", {
        email: rotatedEmail,
        type: "sign-in",
      }),
    );
    const rotatedCode = messages.latestFor(rotatedEmail)?.code;
    assert.notEqual(oldCode, rotatedCode);
    assert.equal(
      (
        await auth.handler(
          request("/sign-in/email-otp", {
            email: rotatedEmail,
            otp: oldCode,
            name: "Rotation",
          }),
        )
      ).status,
      400,
    );
    assert.equal(
      (
        await auth.handler(
          request("/sign-in/email-otp", {
            email: rotatedEmail,
            otp: rotatedCode,
            name: "Rotation",
          }),
        )
      ).status,
      200,
    );

    const exhaustedEmail = "exhausted@example.test";
    await auth.handler(
      request("/email-otp/send-verification-otp", {
        email: exhaustedEmail,
        type: "sign-in",
      }),
    );
    const exhaustedCode = messages.latestFor(exhaustedEmail)?.code;
    const wrongCode = exhaustedCode === "00000000" ? "11111111" : "00000000";
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const response = await auth.handler(
        request("/sign-in/email-otp", {
          email: exhaustedEmail,
          otp: wrongCode,
          name: "Exhausted",
        }),
      );
      assert.equal(response.status, 400);
    }
    assert.equal(
      (
        await auth.handler(
          request("/sign-in/email-otp", {
            email: exhaustedEmail,
            otp: exhaustedCode,
            name: "Exhausted",
          }),
        )
      ).status,
      403,
    );

    const expiredEmail = "expired@example.test";
    await auth.handler(
      request("/email-otp/send-verification-otp", {
        email: expiredEmail,
        type: "sign-in",
      }),
    );
    const expiredCode = messages.latestFor(expiredEmail)?.code;
    await pool.query(
      `UPDATE vox_web_auth.verification
        SET "expiresAt" = NOW() - INTERVAL '1 second'
      WHERE identifier = $1`,
      [`sign-in-otp-${expiredEmail}`],
    );
    assert.equal(
      (
        await auth.handler(
          request("/sign-in/email-otp", {
            email: expiredEmail,
            otp: expiredCode,
            name: "Expired",
          }),
        )
      ).status,
      400,
    );

    await pool.query(
      `INSERT INTO vox_web_auth.account
       ("accountId", "providerId", "userId", "updatedAt")
     VALUES ($1, 'google', $2, NOW())`,
      ["google-fixture", sessionBody.user.id],
    );
    assert.equal(await accounts.canUseEmailSignIn(email), false);
    await accounts.enableRecovery(sessionBody.user.id, email);
    assert.equal(await accounts.canUseEmailSignIn(email), true);

    await pool.query(
      `UPDATE vox_web_auth."user" SET "accountState" = 'disabled' WHERE id = $1`,
      [sessionBody.user.id],
    );
    await assert.rejects(
      () => accounts.establish(sessionBody.user.id),
      /unavailable/,
    );
    assert.equal(await accounts.canUseEmailSignIn(email), false);

    await database.destroy();
  },
);
