"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, TextArea } from "@/components/ui";
import { Callout } from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import { usePublishSkill } from "../queries";

const EMPTY = {
  key: "",
  title: "",
  summary: "",
  instructions: "",
  capabilities: "",
};

export function CreateSkillForm({ onSaved }: { onSaved: () => void }) {
  const [form, setForm] = useState(EMPTY);
  const publish = usePublishSkill();
  const set = (field: keyof typeof EMPTY) => (value: string) =>
    setForm((current) => ({ ...current, [field]: value }));

  function submit(event: FormEvent) {
    event.preventDefault();
    publish.mutate(
      {
        external_key: form.key.trim(),
        title: form.title.trim(),
        summary: form.summary.trim(),
        instructions: form.instructions.trim(),
        requested_capabilities: form.capabilities
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean),
        resources: {},
      },
      {
        onSuccess: () => {
          setForm(EMPTY);
          onSaved();
        },
      },
    );
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Create private skill"
      className="space-y-4 rounded-lg border border-border-edge bg-obsidian/50 p-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          id="skill-key"
          label="Skill key"
          hint="Lowercase letters, numbers and hyphens"
          value={form.key}
          onChange={(e) => set("key")(e.target.value)}
          pattern="[a-z0-9-]+"
          maxLength={128}
          required
        />
        <Field
          id="skill-title"
          label="Name"
          value={form.title}
          onChange={(e) => set("title")(e.target.value)}
          maxLength={120}
          required
        />
      </div>
      <Field
        id="skill-summary"
        label="What should this help with?"
        value={form.summary}
        onChange={(e) => set("summary")(e.target.value)}
        maxLength={500}
        required
      />
      <TextArea
        id="skill-instructions"
        label="Instructions for the agent"
        hint="Describe the reusable process. Keep credentials out of skill content."
        value={form.instructions}
        onChange={(e) => set("instructions")(e.target.value)}
        maxLength={16384}
        rows={8}
        required
      />
      <Field
        id="skill-capabilities"
        label="Tools this skill may need"
        hint="Optional capability keys, separated by commas. This request does not grant access."
        value={form.capabilities}
        onChange={(e) => set("capabilities")(e.target.value)}
      />
      <Button type="submit" disabled={publish.isPending}>
        {publish.isPending ? "Saving…" : "Save skill"}
      </Button>
      {publish.isError ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(publish.error, "Could not save skill")}</p>
        </Callout>
      ) : null}
    </form>
  );
}
