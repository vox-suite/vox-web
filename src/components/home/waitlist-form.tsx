"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { ArrowRight, Mail } from "lucide-react";

type Status = "idle" | "sending" | "done" | "error";

export function WaitlistForm({ source }: { source: "nav" | "hero" | "final" }) {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("");
  const [invalidEmail, setInvalidEmail] = useState(false);
  const [task, setTask] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setMessage("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
          company: form.get("company"),
          task: form.get("task"),
          source,
        }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok)
        throw new Error(
          data.error ?? "Could not join the waitlist. Please try again.",
        );
      setStatus("done");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error && !(error instanceof TypeError)
          ? error.message
          : "Could not join the waitlist. Check your connection and try again.",
      );
    }
  }

  if (status === "done") {
    return (
      <p className="h-form-done" role="status">
        <span aria-hidden="true">✓</span> You&rsquo;re on the list. We&rsquo;ll
        write once, when Vox is ready.
      </p>
    );
  }

  if (source === "final") {
    return (
      <form
        className="h-panel"
        onSubmit={submit}
        aria-busy={status === "sending"}
      >
        <label htmlFor="email-final">Email</label>
        <div className="h-input">
          <Mail size={16} aria-hidden="true" />
          <input
            id="email-final"
            aria-describedby="email-note-final email-error-final"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            pattern={String.raw`[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}`}
            aria-invalid={invalidEmail || undefined}
            onInvalid={() => {
              setInvalidEmail(true);
              setMessage(
                "Enter a valid email address, such as you@example.com.",
              );
            }}
            onChange={() => {
              setInvalidEmail(false);
              setMessage("");
            }}
            placeholder="you@example.com"
            disabled={status === "sending"}
          />
        </div>
        <input
          className="h-trap"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <label htmlFor="task-final">
          What would you hand to Vox first? <span>Optional</span>
        </label>
        <div className="h-input">
          <input
            id="task-final"
            name="task"
            type="text"
            maxLength={280}
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="One task you'd love to stop doing"
            disabled={status === "sending"}
          />
        </div>
        <div className="h-suggest" aria-label="Suggestions">
          {[
            "Track my spending",
            "Remind me about bills",
            "Plan my week",
            "Plan a trip",
          ].map((t) => (
            <button key={t} type="button" onClick={() => setTask(t)}>
              {t}
            </button>
          ))}
        </div>
        <button
          type="submit"
          className="h-btn h-btn-block"
          disabled={status === "sending"}
        >
          <span>{status === "sending" ? "Joining" : "Join the waitlist"}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <p className="h-panel-note" id="email-note-final">
          One email when Vox is ready. No spam.{" "}
          <Link href="/privacy-policy">Privacy policy</Link>
        </p>
        <p className="h-form-error" id="email-error-final" role="alert">
          {message}
        </p>
      </form>
    );
  }

  return (
    <form className="h-form" onSubmit={submit} aria-busy={status === "sending"}>
      <div className="h-field">
        <label className="h-sr" htmlFor={`email-${source}`}>
          Email address
        </label>
        <input
          id={`email-${source}`}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          pattern={String.raw`[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}`}
          aria-describedby={`email-note-${source}${message ? ` email-error-${source}` : ""}`}
          aria-invalid={invalidEmail || undefined}
          onInvalid={() => {
            setInvalidEmail(true);
            setMessage("Enter a valid email address, such as you@example.com.");
          }}
          onChange={() => {
            setInvalidEmail(false);
            setMessage("");
          }}
          placeholder="Enter your email"
          disabled={status === "sending"}
        />
        <input
          className="h-trap"
          name="company"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <button type="submit" className="h-btn" disabled={status === "sending"}>
          <span>{status === "sending" ? "Joining" : "Join the waitlist"}</span>
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
      <p className="h-note" id={`email-note-${source}`}>
        One email when Vox is ready.{" "}
        <Link href="/privacy-policy">Privacy policy</Link>.
      </p>
      <p className="h-form-error" id={`email-error-${source}`} role="alert">
        {message}
      </p>
    </form>
  );
}
