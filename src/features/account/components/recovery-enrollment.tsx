"use client";

import { useState, type FormEvent } from "react";
import { Button, Field } from "@/components/ui";
import { Callout } from "@/components/app";
import { useConfirmRecovery, useStartRecovery } from "../queries";

export function RecoveryEnrollment({ enabled }: { enabled: boolean }) {
  const [code, setCode] = useState("");
  const start = useStartRecovery();
  const confirm = useConfirmRecovery();
  const stage =
    enabled || confirm.isSuccess
      ? "done"
      : start.isSuccess
        ? "verify"
        : "start";

  if (stage === "done") {
    return (
      <Callout
        tone="success"
        title="Email recovery is enabled"
        live={confirm.isSuccess ? "polite" : undefined}
      >
        <p>You can use a one-time email code if Google is unavailable.</p>
      </Callout>
    );
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    confirm.mutate(code);
  }

  return (
    <form onSubmit={submit} className="max-w-md space-y-4">
      {stage === "verify" ? (
        <Field
          id="recovery-code"
          label="Recovery code"
          inputMode="numeric"
          autoComplete="one-time-code"
          required
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\s/g, ""))}
        />
      ) : null}
      {stage === "start" ? (
        <Button
          type="button"
          disabled={start.isPending}
          onClick={() => start.mutate()}
        >
          {start.isPending ? "Sending code…" : "Enable email recovery"}
        </Button>
      ) : (
        <Button type="submit" disabled={confirm.isPending}>
          {confirm.isPending ? "Verifying…" : "Verify code"}
        </Button>
      )}
      {start.isError ? (
        <Callout tone="danger" title="Recovery not configured" live="assertive">
          <p>
            A recovery code could not be sent. Please sign in again and retry.
          </p>
        </Callout>
      ) : null}
      {confirm.isError ? (
        <Callout tone="danger" title="Recovery not configured" live="assertive">
          <p>
            That code is invalid or expired. Request a fresh code and retry.
          </p>
        </Callout>
      ) : null}
    </form>
  );
}
