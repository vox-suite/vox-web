"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Notice, Stack, Text } from "@/components/ui";
import { consumerAuthClient } from "@/lib/consumer-auth/client";

function accountHome() {
  return window.location.hostname === "app.voxagent.in" ? "/" : "/app";
}

export function ConsumerSignInForm({ enabled }: { enabled: boolean }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    setPending(true);
    setError(null);
    const result = await consumerAuthClient.emailOtp.sendVerificationOtp({
      email,
      type: "sign-in",
    });
    setPending(false);
    if (result.error) {
      setError("We could not start sign-in. Please try again shortly.");
      return;
    }
    setStage("code");
    setMessage(
      "If this address can sign in, an eight-digit code is on its way.",
    );
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await consumerAuthClient.signIn.emailOtp({
      email,
      otp: code,
      name: email.split("@")[0] || "Vox user",
    });
    if (result.error) {
      setPending(false);
      setError(
        "That code is invalid or expired. Request a new code and try again.",
      );
      return;
    }
    window.location.assign(accountHome());
  }

  return (
    <Stack gap="large">
      <Button
        disabled={!enabled || pending}
        onClick={async () => {
          setPending(true);
          setError(null);
          const result = await consumerAuthClient.signIn.social({
            provider: "google",
            callbackURL: accountHome(),
          });
          if (result?.error) {
            setPending(false);
            setError("Google sign-in could not be started. Please try again.");
          }
        }}
      >
        Continue with Google
      </Button>
      <div className="auth-divider" aria-hidden="true">
        <span>or</span>
      </div>
      <form onSubmit={stage === "email" ? sendCode : verifyCode}>
        <Stack>
          <Field
            id="consumer-email"
            name="email"
            label="Email address"
            type="email"
            autoComplete="email"
            required
            disabled={!enabled || pending || stage === "code"}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {stage === "code" && (
            <Field
              id="consumer-code"
              name="one-time-code"
              label="Eight-digit code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{8}"
              minLength={8}
              maxLength={8}
              required
              disabled={pending}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 8))
              }
            />
          )}
          <Button disabled={!enabled || pending} type="submit">
            {pending
              ? "Please wait…"
              : stage === "email"
                ? "Continue with email"
                : "Verify and sign in"}
          </Button>
          {stage === "code" && (
            <Button
              disabled={pending}
              variant="ghost"
              onClick={() => void sendCode()}
            >
              Send a new code
            </Button>
          )}
        </Stack>
      </form>
      {message && <Notice title="Check your email">{message}</Notice>}
      {error && (
        <Notice title="Sign-in was not completed" tone="error">
          {error}
        </Notice>
      )}
      <Text muted small>
        Google and email identities are never merged automatically.
      </Text>
    </Stack>
  );
}
