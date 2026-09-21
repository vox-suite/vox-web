"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";
import { Field, Select, TextArea, Button, LinkButton } from "@/components/ui";

type FormState = "idle" | "submitting" | "success" | "error";

export function RequestAccessForm() {
  const [state, setState] = useState<FormState>("idle");
  const confirmHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (state === "success") {
      confirmHeadingRef.current?.focus();
    }
  }, [state]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("submitting");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          role: fd.get("role"),
          use_case: fd.get("use_case"),
        }),
      });
      setState(res.ok ? "success" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "success") {
    return (
      <div className="request-access-confirmation">
        <div className="request-access-confirmation-icon" aria-hidden="true">
          <Check size={20} strokeWidth={2.5} />
        </div>
        <div className="request-access-confirmation-copy">
          <h2 ref={confirmHeadingRef} tabIndex={-1}>
            You&rsquo;re on the list.
          </h2>
          <p>We&rsquo;ll review your request and be in touch soon.</p>
        </div>
        <LinkButton href="/changelog" variant="secondary">
          Follow the build in the meantime
        </LinkButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} aria-label="Request access">
      <Field
        id="name"
        name="name"
        label="Your name"
        type="text"
        required
        autoComplete="name"
        placeholder="Full name"
        maxLength={100}
        disabled={state === "submitting"}
      />
      <Field
        id="email"
        name="email"
        label="Work email"
        type="email"
        required
        autoComplete="email"
        placeholder="you@company.com"
        maxLength={254}
        disabled={state === "submitting"}
      />
      <Select
        id="role"
        name="role"
        label="Your role"
        required
        disabled={state === "submitting"}
        defaultValue=""
      >
        <option value="" disabled>
          Select a role…
        </option>
        <option value="founder">Founder</option>
        <option value="executive">Executive</option>
        <option value="consultant">Consultant</option>
        <option value="other">Other</option>
      </Select>
      <TextArea
        id="use_case"
        name="use_case"
        label="What would you use Vox for first?"
        required
        rows={3}
        placeholder="Describe the most time-consuming part of your day…"
        hint="Two or three sentences is plenty."
        maxLength={1000}
        disabled={state === "submitting"}
      />
      <div className="request-access-actions">
        <Button type="submit" variant="primary" disabled={state === "submitting"}>
          {state === "submitting" ? "Sending…" : "Request access"}
        </Button>
        {state === "error" && (
          <p className="request-access-error" role="alert">
            Something went wrong — please try again.
          </p>
        )}
        <p className="request-access-terms">
          We read every request personally. Vox is in limited access.
        </p>
      </div>
    </form>
  );
}
