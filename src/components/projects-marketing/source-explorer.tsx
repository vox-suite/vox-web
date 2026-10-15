"use client";

import { useState } from "react";
import { ArrowUpRight, FileCode2 } from "lucide-react";

const examples = [
  {
    label: "Sign-in form",
    file: "web/login.tsx",
    lines: "18–21",
    explanation: "The form sends an email address to the sign-in endpoint.",
    code: 'await fetch("/auth/email", {\n  method: "POST",\n  body: JSON.stringify({ email }),\n});',
  },
  {
    label: "Session store",
    file: "server/session.ts",
    lines: "42–46",
    explanation: "Creates a random token and keeps it for seven days.",
    code: 'export async function createSession(user) {\n  const token = randomBytes(32).toString("hex");\n  await store.set(token, user.id, SEVEN_DAYS);\n  return token;\n}',
  },
  {
    label: "Email provider",
    file: "server/mail.ts",
    lines: "12–16",
    explanation: "The email contains the link that finishes sign-in.",
    code: 'await mail.send({\n  to: email,\n  subject: "Your sign-in link",\n  url: createSignInUrl(token),\n});',
  },
];

export function SourceExplorer() {
  const [selected, setSelected] = useState(1);
  const item = examples[selected];
  return (
    <div className="pj-source-explorer">
      <div
        className="pj-source-choices"
        role="group"
        aria-label="Explore an illustrative diagram node"
      >
        {examples.map((example, i) => (
          <button
            type="button"
            key={example.file}
            aria-pressed={selected === i}
            onClick={() => setSelected(i)}
          >
            <FileCode2 size={16} aria-hidden="true" />
            {example.label}
            <ArrowUpRight size={14} aria-hidden="true" />
          </button>
        ))}
      </div>
      <div className="pj-source-result" aria-live="polite" aria-atomic="true">
        <div className="pj-cite-head">
          <strong>{item.label}</strong>
          <em>Cited</em>
        </div>
        <p>{item.explanation}</p>
        <div className="pj-code">
          <span>
            {item.file} · lines {item.lines}
          </span>
          <pre>
            <code>{item.code}</code>
          </pre>
        </div>
        <p className="pj-explorer-note">
          Illustrative code. Choose a box to follow its source.
        </p>
      </div>
    </div>
  );
}
