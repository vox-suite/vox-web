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
  const [preview, setPreview] = useState(false);
  const set = (field: keyof typeof EMPTY) => (value: string) => {
    setPreview(false);
    setForm((current) => ({ ...current, [field]: value }));
  };

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!preview) {
      setPreview(true);
      return;
    }
    publish.mutate(
      {
        external_key: (
          form.key ||
          form.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "")
            .slice(0, 64)
        ).trim(),
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
          label="Skill key (optional)"
          hint="Generated from the name when left blank"
          value={form.key}
          onChange={(e) => set("key")(e.target.value)}
          pattern="[a-z0-9-]+"
          maxLength={128}
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
      {preview ? (
        <Callout title="Preview">
          <p>{form.title}</p>
          <p>{form.summary}</p>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs">
            {form.instructions}
          </pre>
          <p>
            Requested tools: {form.capabilities || "None"}. Saving grants no
            access.
          </p>
        </Callout>
      ) : null}
      <Button type="submit" disabled={publish.isPending}>
        {publish.isPending
          ? "Saving…"
          : preview
            ? "Save skill"
            : "Preview skill"}
      </Button>
      {publish.isError ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(publish.error, "Could not save skill")}</p>
        </Callout>
      ) : null}
    </form>
  );
}
