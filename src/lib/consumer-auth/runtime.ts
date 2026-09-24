import "server-only";
import { betterAuth } from "better-auth";
import { Kysely, PostgresDialect } from "kysely";
import nodemailer from "vox-nodemailer";
import { Pool } from "pg";
import { after } from "next/server";
import { ConsumerAccountAuthority } from "./account-authority";
import { buildConsumerAuthOptions } from "./auth-options";
import { readConsumerAuthConfig } from "./config";
import { VoxCoreHostClient } from "./core-host-client";
import { SmtpAuthEmailSender } from "./email";

type Runtime = {
  auth: ReturnType<typeof betterAuth>;
  accounts: ConsumerAccountAuthority;
  coreClient: VoxCoreHostClient;
  pool: Pool;
  emailSender: SmtpAuthEmailSender;
  entryEnabled: boolean;
};

let runtime: Runtime | null | undefined;

export function getConsumerAuthRuntime(): Runtime | null {
  if (runtime !== undefined) return runtime;
  const config = readConsumerAuthConfig();
  if (!config.enabled) {
    runtime = null;
    return runtime;
  }

  const pool = new Pool({
    connectionString: config.databaseUrl,
    application_name: "vox-web-consumer-auth",
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  const database = new Kysely<Record<string, never>>({
    dialect: new PostgresDialect({ pool }),
  });
  const coreClient = new VoxCoreHostClient(config.core);
  const accounts = new ConsumerAccountAuthority(pool, coreClient);
  const emailSender = new SmtpAuthEmailSender(
    config.emailFrom,
    nodemailer.createTransport(config.smtpUrl),
  );
  const auth = betterAuth(
    buildConsumerAuthOptions(config, {
      database: {
        db: database,
        type: "postgres",
        casing: "snake",
        schemaName: "vox_web_auth",
        transaction: true,
      },
      accountAuthority: accounts,
      defer: (promise) => after(() => promise),
      emailSender: {
        async sendOneTimeCode(message) {
          if (await accounts.canUseEmailSignIn(message.email)) {
            await emailSender.sendOneTimeCode(message);
          }
        },
      },
    }),
  );
  runtime = {
    auth,
    accounts,
    coreClient,
    pool,
    emailSender,
    entryEnabled: config.entryEnabled,
  };
  return runtime;
}

export function getCoreHostClient(): VoxCoreHostClient | null {
  const rt = getConsumerAuthRuntime();
  if (rt) return rt.coreClient;
  const config = readConsumerAuthConfig();
  if (!config.enabled) return null;
  return new VoxCoreHostClient(config.core);
}

export function resetConsumerAuthRuntimeForTests() {
  runtime = undefined;
}
