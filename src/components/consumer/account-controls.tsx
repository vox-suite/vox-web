"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Notice, Stack } from "@/components/ui";
import { supabase } from "@/lib/consumer-auth/client";

function signInLocation() {
  return window.location.hostname === "app.voxagent.in"
    ? "/sign-in"
    : "/app/sign-in";
}

export function SessionControls() {
  const [pending, setPending] = useState(false);
  return (
    <Stack gap="small">
      <Button
        disabled={pending}
        variant="secondary"
        onClick={async () => {
          setPending(true);
          await supabase.auth.signOut();
          window.location.assign(signInLocation());
        }}
      >
        Sign out
      </Button>
      <Button
        disabled={pending}
        variant="ghost"
        onClick={async () => {
          setPending(true);
          await supabase.auth.signOut({ scope: "global" });
          window.location.assign(signInLocation());
        }}
      >
        Sign out everywhere
      </Button>
    </Stack>
  );
}

export function IdentityControls() {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  return (
    <Stack gap="small">
      <Button
        disabled={pending}
        onClick={async () => {
          setPending(true);
          setError(false);
          const { error: linkError } = await supabase.auth.linkIdentity({
            provider: "google",
            options: {
              redirectTo:
                window.location.hostname === "app.voxagent.in"
                  ? `${window.location.origin}/auth/callback?next=/`
                  : `${window.location.origin}/auth/callback?next=/app`,
            },
          });
          if (linkError) {
            setPending(false);
            setError(true);
          }
        }}
      >
        Link a verified Google identity
      </Button>
      {error && (
        <Notice title="Google identity was not linked" tone="error">
          The identity may already belong to another Vox account, or its email
          may not match this account.
        </Notice>
      )}
    </Stack>
  );
}

export function RecoveryEnrollment({ enabled }: { enabled: boolean }) {
  const [stage, setStage] = useState<"start" | "verify" | "done">(
    enabled ? "done" : "start",
  );
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function start() {
    setPending(true);
    setError(null);
    const response = await fetch("/api/account/recovery/start", {
      method: "POST",
    });
    setPending(false);
    if (!response.ok) {
      setError(
        "A recovery code could not be sent. Please sign in again and retry.",
      );
      return;
    }
    setStage("verify");
  }

  async function confirm(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/account/recovery/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    setPending(false);
    if (!response.ok) {
      setError(
        "That code is invalid or expired. Request a fresh code and retry.",
      );
      return;
    }
    setStage("done");
  }

  if (stage === "done") {
    return (
      <Notice title="Email recovery is enabled" tone="success">
        You can use a one-time email code if Google is unavailable.
      </Notice>
    );
  }
  return (
    <form onSubmit={confirm}>
      <Stack>
        {stage === "verify" && (
          <Field
            id="recovery-code"
            label="Recovery code"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(event) => setCode(event.target.value)}
          />
        )}
        <Button
          disabled={pending}
          type={stage === "start" ? "button" : "submit"}
          onClick={stage === "start" ? start : undefined}
        >
          {stage === "start" ? "Enable email recovery" : "Verify code"}
        </Button>
        {error && (
          <Notice title="Recovery not configured" tone="error">
            {error}
          </Notice>
        )}
      </Stack>
    </form>
  );
}
