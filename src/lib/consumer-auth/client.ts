"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

export const consumerAuthClient = createAuthClient({
  basePath: "/api/account/auth",
  plugins: [emailOTPClient()],
});
