"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Select } from "@/components/ui";
import { Callout } from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import type {
  ExtensionEffect,
  ExtensionProtocol,
  InstallExtensionRequest,
} from "@/lib/consumer-auth/core-host-client";
import { useInstallExtension } from "../queries";

const PROTOCOLS: ReadonlyArray<{ value: ExtensionProtocol; label: string }> = [
  { value: "mcp", label: "Model Context Protocol (MCP)" },
  { value: "direct", label: "Direct HTTP / REST Service" },
];

const EFFECTS: ReadonlyArray<{ value: ExtensionEffect; label: string }> = [
  { value: "read", label: "Reads information" },
  { value: "write", label: "Changes external state" },
  { value: "mixed", label: "Can read or change state" },
];

const EMPTY = {
  externalKey: "",
  displayName: "",
  protocol: "mcp" as ExtensionProtocol,
  endpointUrl: "",
  operatorId: "",
  operatorName: "",
  supportEmail: "",
  termsUrl: "",
  capabilityKey: "",
  capabilityName: "",
  capabilityEffect: "read" as ExtensionEffect,
};

type FormState = typeof EMPTY;

export function toInstallRequest(form: FormState): InstallExtensionRequest {
  return {
    external_key: form.externalKey,
    display_name: form.displayName,
    protocol: form.protocol,
    endpoint_url: form.endpointUrl,
    operator: {
      operator_id: form.operatorId,
      operator_name: form.operatorName,
      support_email: form.supportEmail || null,
      terms_url: form.termsUrl || null,
    },
    capabilities: [
      {
        external_key: form.capabilityKey,
        display_name: form.capabilityName,
        effect: form.capabilityEffect,
        consequential: form.capabilityEffect !== "read",
        data_recipients: [form.operatorName],
        access_needs: [],
      },
    ],
  };
}

export function InstallExtensionForm({
  onInstalled,
  onCancel,
}: {
  onInstalled: (displayName: string) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState(EMPTY);
  const install = useInstallExtension();
  const text = (field: keyof FormState) => ({
    value: form[field],
    onChange: (event: { target: { value: string } }) =>
      setForm((current) => ({ ...current, [field]: event.target.value })),
  });

  function submit(event: FormEvent) {
    event.preventDefault();
    install.mutate(toInstallRequest(form), {
      onSuccess: () => {
        onInstalled(form.displayName);
        setForm(EMPTY);
      },
    });
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Register remote extension form"
      className="space-y-5 rounded-lg border border-border-edge bg-obsidian/50 p-4"
    >
      <fieldset className="space-y-4">
        <legend className="text-[13px] font-medium text-pure-white">
          MCP server or remote app
        </legend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="ext-key"
            label="External key"
            required
            {...text("externalKey")}
          />
          <Field
            id="ext-name"
            label="Display name"
            required
            {...text("displayName")}
          />
          <Select
            id="ext-proto"
            label="Protocol adapter"
            value={form.protocol}
            onChange={(event) => {
              const protocol = PROTOCOLS.find(
                (p) => p.value === event.target.value,
              );
              if (protocol)
                setForm((current) => ({
                  ...current,
                  protocol: protocol.value,
                }));
            }}
          >
            {PROTOCOLS.map((protocol) => (
              <option key={protocol.value} value={protocol.value}>
                {protocol.label}
              </option>
            ))}
          </Select>
          <Field
            id="ext-url"
            label="Server endpoint URL"
            type="url"
            hint="Use a public HTTPS endpoint. Local addresses are reserved for isolated tests."
            required
            {...text("endpointUrl")}
          />
        </div>
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="text-[13px] font-medium text-pure-white">
          Operator
        </legend>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            id="op-id"
            label="Operator ID"
            required
            {...text("operatorId")}
          />
          <Field
            id="op-name"
            label="Operator legal name"
            required
            {...text("operatorName")}
          />
          <Field
            id="op-email"
            label="Support contact email"
            type="email"
            {...text("supportEmail")}
          />
          <Field
            id="op-terms"
            label="Terms of service URL"
            type="url"
            {...text("termsUrl")}
          />
        </div>
      </fieldset>
      <fieldset className="space-y-4">
        <legend className="text-[13px] font-medium text-pure-white">
          Tool
        </legend>
        <div className="grid gap-4 md:grid-cols-3">
          <Field
            id="capability-key"
            label="Tool key"
            required
            {...text("capabilityKey")}
          />
          <Field
            id="capability-name"
            label="What the tool does"
            required
            {...text("capabilityName")}
          />
          <Select
            id="capability-effect"
            label="Effect"
            value={form.capabilityEffect}
            onChange={(event) => {
              const effect = EFFECTS.find(
                (e) => e.value === event.target.value,
              );
              if (effect)
                setForm((current) => ({
                  ...current,
                  capabilityEffect: effect.value,
                }));
            }}
          >
            {EFFECTS.map((effect) => (
              <option key={effect.value} value={effect.value}>
                {effect.label}
              </option>
            ))}
          </Select>
        </div>
      </fieldset>
      <Callout tone="warning">
        <p>
          This saves a server declaration only. Vox cannot discover its tools,
          connect your account, or let an agent use it yet. Do not enter a token
          or password in the endpoint URL or any field.
        </p>
      </Callout>
      {install.isError ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(install.error, "Failed to install extension")}</p>
        </Callout>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="submit"
          disabled={install.isPending}
          aria-label="Save remote server declaration"
        >
          {install.isPending ? "Saving…" : "Save server declaration"}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
