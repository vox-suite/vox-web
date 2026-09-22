import { createHmac, randomUUID } from "node:crypto";
import type { BetterAuthOptions } from "better-auth";
import { emailOTP } from "better-auth/plugins";
import type { AuthEmailSender } from "./email";
import type { ConsumerAuthEnabledConfig } from "./config";

type AccountAuthority = {
  initialize(accountId: string): Promise<{ userContextId: string }>;
  establish(accountId: string): Promise<unknown>;
};

type AuthDependencies = {
  database: NonNullable<BetterAuthOptions["database"]>;
  accountAuthority: AccountAuthority;
  emailSender: AuthEmailSender;
  defer?: (promise: Promise<unknown>) => void;
};

export function buildConsumerAuthOptions(
  config: ConsumerAuthEnabledConfig,
  dependencies: AuthDependencies,
): BetterAuthOptions {
  const otpPlugin = emailOTP({
    otpLength: 8,
    expiresIn: config.otpExpiresInSeconds,
    allowedAttempts: config.otpAllowedAttempts,
    resendStrategy: "rotate",
    // Verification must reach the five-attempt OTP ceiling before the route
    // limiter intervenes. Sending remains separately limited to three below.
    rateLimit: { window: 60, max: 6 },
    storeOTP: {
      hash: async (otp) =>
        createHmac("sha256", config.otpPepper)
          .update(otp, "utf8")
          .digest("hex"),
    },
    sendVerificationOTP: async ({ email, otp }) => {
      await dependencies.emailSender.sendOneTimeCode({
        email,
        code: otp,
        expiresInMinutes: config.otpExpiresInSeconds / 60,
      });
    },
  });

  return {
    appName: "Vox",
    baseURL: config.appUrl,
    basePath: "/api/account/auth",
    secret: config.authSecret,
    database: dependencies.database,
    trustedOrigins: [config.appUrl],
    socialProviders: {
      google: {
        clientId: config.googleClientId,
        clientSecret: config.googleClientSecret,
        scope: ["openid", "email", "profile"],
        prompt: "select_account",
        includeGrantedScopes: false,
        requireEmailVerification: true,
      },
    },
    user: {
      additionalFields: {
        accountState: {
          type: "string",
          required: true,
          defaultValue: "active",
          input: false,
          returned: false,
        },
        coreUserContextId: {
          type: "string",
          required: false,
          input: false,
        },
        recoveryEnabledAt: {
          type: "date",
          required: false,
          input: false,
          returned: false,
        },
      },
    },
    session: {
      expiresIn: config.sessionMaxAgeSeconds,
      updateAge: 30 * 60,
      freshAge: 15 * 60,
      cookieCache: { enabled: false },
      additionalFields: {
        authenticationMethod: {
          type: "string",
          required: true,
          defaultValue: "unknown",
          input: false,
          returned: false,
        },
      },
    },
    account: {
      encryptOAuthTokens: true,
      storeStateStrategy: "database",
      accountLinking: {
        enabled: true,
        disableImplicitLinking: true,
        trustedProviders: ["google"],
        allowDifferentEmails: false,
        allowUnlinkingAll: false,
        updateUserInfoOnLink: false,
      },
    },
    rateLimit: {
      enabled: true,
      storage: "database",
      window: 60,
      max: 30,
      customRules: {
        "/email-otp/send-verification-otp": { window: 60, max: 3 },
        "/email-otp/verify-email": { window: 60, max: 6 },
        "/sign-in/email-otp": { window: 60, max: 6 },
      },
    },
    databaseHooks: {
      user: {
        create: {
          before: async (user) => {
            const accountId = user.id || randomUUID();
            const authentication =
              await dependencies.accountAuthority.initialize(accountId);
            return {
              data: {
                ...user,
                id: accountId,
                accountState: "active",
                coreUserContextId: authentication.userContextId,
              },
            };
          },
        },
      },
      session: {
        create: {
          before: async (session, context) => {
            await dependencies.accountAuthority.establish(session.userId);
            const path = context?.path ?? "";
            const authenticationMethod = path.includes("email-otp")
              ? "email-otp"
              : path.includes("google")
                ? "google"
                : "unknown";
            return { data: { ...session, authenticationMethod } };
          },
        },
      },
    },
    plugins: [otpPlugin],
    advanced: {
      ...(dependencies.defer
        ? { backgroundTasks: { handler: dependencies.defer } }
        : {}),
      ipAddress: { ipAddressHeaders: ["x-forwarded-for"] },
      useSecureCookies: true,
      crossSubDomainCookies: { enabled: false },
      cookiePrefix: "vox_account",
      database: { generateId: "uuid" },
    },
  };
}
