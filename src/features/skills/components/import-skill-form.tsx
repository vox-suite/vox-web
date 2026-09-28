"use client";
import { useState, type FormEvent } from "react";
import { Button, Field } from "@/components/ui";
import { Callout } from "@/components/app";
import { apiRequest, errorMessage } from "@/lib/api/http";
import { useQueryClient } from "@tanstack/react-query";
import { skillKeys } from "../queries";
import type { PublishSkillRequest } from "@/lib/consumer-auth/core-host-client";

export function ImportSkillForm({ onSaved }: { onSaved: () => void }) {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState<{
    skill: PublishSkillRequest;
    digest: string;
  } | null>(null);
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<unknown>(null);
  const queryClient = useQueryClient();
  async function submit(event: FormEvent) {
    event.preventDefault();
    setPending(true);
    setFailure(null);
    try {
      const result = await apiRequest<{
        skill: PublishSkillRequest;
        digest: string;
      }>("/api/account/skills/import", {
        method: "POST",
        body: { files, preview: !preview },
        fallbackError: "Could not import skill",
      });
      if (!preview) setPreview(result);
      else {
        await queryClient.invalidateQueries({ queryKey: skillKeys.list() });
        onSaved();
      }
    } catch (error) {
      setFailure(error);
    } finally {
      setPending(false);
    }
  }
  return (
    <form
      aria-label="Import skill"
      onSubmit={submit}
      className="space-y-4 rounded-lg border border-border-edge p-4"
    >
      <p className="text-sm text-smoke">
        Select SKILL.md and optional text references/assets. Executable scripts
        are unsupported.
      </p>
      <Field
        id="skill-files"
        label="Skill files"
        type="file"
        multiple
        accept=".md,.txt,.json"
        onChange={async (event) => {
          setPreview(null);
          setFailure(null);
          const selected = Array.from(event.target.files ?? []);
          if (
            selected.length > 32 ||
            selected.some((file) => file.size > 16384)
          ) {
            setFailure(new Error("Choose up to 32 files, each at most 16 KB."));
            return;
          }
          const imported: Record<string, string> = {};
          for (const file of selected) {
            const name =
              file.name === "SKILL.md" ? "SKILL.md" : `references/${file.name}`;
            if (imported[name] !== undefined) {
              setFailure(new Error("File names must be unique."));
              return;
            }
            imported[name] = await file.text();
          }
          setFiles(imported);
        }}
      />
      {preview ? (
        <div className="space-y-2">
          <h3 className="text-sm text-mist">{preview.skill.title}</h3>
          <p className="text-sm text-smoke">{preview.skill.summary}</p>
          <pre className="max-h-80 overflow-auto whitespace-pre-wrap text-xs text-ash">
            {preview.skill.instructions}
          </pre>
          <p className="text-sm text-smoke">
            Requested tools:{" "}
            {preview.skill.requested_capabilities.join(", ") || "None"}. Saving
            does not grant them.
          </p>
        </div>
      ) : null}
      <Button type="submit" disabled={pending || !files["SKILL.md"]}>
        {pending
          ? "Working…"
          : preview
            ? "Save private skill"
            : "Preview import"}
      </Button>
      {failure ? (
        <Callout tone="danger" live="assertive">
          {errorMessage(failure, "Could not import skill")}
        </Callout>
      ) : null}
    </form>
  );
}
