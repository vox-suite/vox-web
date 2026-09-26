"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, CircleAlert, Loader2, MailCheck } from "lucide-react";
import { Button, Input, Label } from "@/components/ui";
import { getSupabase } from "@/lib/consumer-auth/client";
import { consumerBasePath } from "@/lib/consumer-routes";

const RESEND_SECONDS = 30;

function accountHome() {
  return consumerBasePath(window.location.hostname) || "/";
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" width="18" height="18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.33-1.58-5.04-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.96 10.72A5.41 5.41 0 0 1 3.68 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 9 0 9 9 0 0 0 .96 4.95l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

function Spinner() {
  return <Loader2 className="animate-spin" aria-hidden="true" />;
}

export function ConsumerSignInForm({ enabled }: { enabled: boolean }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [pending, setPending] = useState<"google" | "email" | "verify" | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);
  const busy = pending !== null;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (stage === "code") codeRef.current?.focus();
  }, [stage]);

  async function sendCode(event?: FormEvent) {
    event?.preventDefault();
    setPending("email");
    setError(null);
    const { error: otpError } = await getSupabase().auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${accountHome()}`,
      },
    });
    setPending(null);
    if (otpError) {
      setError("We could not start sign-in. Please try again shortly.");
      return;
    }
    setCode("");
    setStage("code");
    setCooldown(RESEND_SECONDS);
    setMessage(
      "If this address can sign in, a verification code or link is on its way.",
    );
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault();
    setPending("verify");
    setError(null);
    const { error: verifyError } = await getSupabase().auth.verifyOtp({
      email: email.trim(),
      token: code,
      type: "email",
    });
    if (verifyError) {
      setPending(null);
      setError(
        "That code is invalid or expired. Request a new code and try again.",
      );
      return;
    }
    window.location.assign(accountHome());
  }

  async function signInWithGoogle() {
    setPending("google");
    setError(null);
    const { error: oauthError } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${accountHome()}`,
      },
    });
    if (oauthError) {
      setPending(null);
      setError("Google sign-in could not be started. Please try again.");
    }
  }

  function useDifferentEmail() {
    setStage("email");
    setCode("");
    setMessage(null);
    setError(null);
    setCooldown(0);
  }

  return (
    <div className="flex flex-col gap-6">
      <Button
        variant="secondary"
        size="lg"
        className="h-11 w-full border-white/10 bg-white/[0.03] text-[14px] text-pure-white hover:border-white/20 hover:bg-white/[0.07]"
        disabled={!enabled || busy}
        onClick={signInWithGoogle}
      >
        {pending === "google" ? <Spinner /> : <GoogleMark />}
        Continue with Google
      </Button>

      <div className="flex items-center gap-3" aria-hidden="true">
        <div className="h-px flex-1 bg-border-edge" />
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-smoke">
          or
        </span>
        <div className="h-px flex-1 bg-border-edge" />
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={stage === "email" ? sendCode : verifyCode}
        noValidate={false}
      >
        {stage === "email" ? (
          <div className="flex flex-col gap-2">
            <Label htmlFor="consumer-email">Email address</Label>
            <Input
              id="consumer-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              className="h-11 px-3.5 text-[15px]"
              required
              autoFocus
              disabled={!enabled || busy}
              aria-invalid={error ? true : undefined}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
        ) : (
          <>
            <div
              role="status"
              className="flex items-start gap-3 rounded-xl border border-border-edge bg-white/[0.02] p-3.5"
            >
              <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-mist">
                <MailCheck className="size-4" aria-hidden="true" />
              </span>
              <div className="min-w-0 text-[13px] leading-5">
                <p className="font-medium text-pure-white">Check your email</p>
                <p className="text-ash">{message}</p>
                <p className="mt-1 truncate font-mono text-xs text-smoke">
                  {email.trim()}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="consumer-code">Verification code</Label>
              <Input
                id="consumer-code"
                ref={codeRef}
                name="one-time-code"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="••••••"
                maxLength={12}
                className="h-12 text-center font-mono text-xl tracking-[0.35em]"
                required
                disabled={pending === "verify"}
                aria-invalid={error ? true : undefined}
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\s/g, ""))
                }
              />
            </div>
          </>
        )}

        {error && (
          <p
            role="alert"
            className="flex items-start gap-2 rounded-lg bg-ember-hush px-3 py-2.5 text-[13px] leading-5 text-coral-pulse"
          >
            <CircleAlert
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            <span>{error}</span>
          </p>
        )}

        <Button
          size="lg"
          className="h-11 w-full text-[14px]"
          disabled={!enabled || busy || (stage === "code" && code.length < 4)}
          type="submit"
        >
          {busy && pending !== "google" ? (
            <>
              <Spinner /> Please wait…
            </>
          ) : stage === "email" ? (
            <>
              Continue with email <ArrowRight aria-hidden="true" />
            </>
          ) : (
            "Verify and sign in"
          )}
        </Button>

        {stage === "code" && (
          <div className="flex items-center justify-between text-[13px]">
            <button
              type="button"
              className="rounded text-ash transition-colors hover:text-pure-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist"
              onClick={useDifferentEmail}
              disabled={busy}
            >
              Use a different email
            </button>
            <button
              type="button"
              className="rounded text-ash transition-colors hover:text-pure-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mist disabled:pointer-events-none disabled:text-smoke"
              onClick={() => void sendCode()}
              disabled={busy || cooldown > 0}
            >
              {cooldown > 0
                ? `Send a new code in ${cooldown}s`
                : "Send a new code"}
            </button>
          </div>
        )}
      </form>

      <p className="text-center text-xs leading-5 text-smoke">
        Google and email identities are never merged automatically.
      </p>
    </div>
  );
}
