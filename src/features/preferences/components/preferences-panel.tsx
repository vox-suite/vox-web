"use client";

import { useState, type FormEvent } from "react";
import { Button, Field, Select } from "@/components/ui";
import {
  Callout,
  CheckboxField,
  EmptyMessage,
  ItemCard,
  Panel,
  QueryContent,
  Tag,
} from "@/components/app";
import { ApiError, errorMessage } from "@/lib/api/http";
import {
  PREFERENCE_CATEGORIES,
  formatPreferenceValue,
  isSensitivePreference,
  parsePreferenceValue,
} from "../api";
import {
  useDeletePreference,
  usePreferences,
  useSavePreference,
} from "../queries";

function PreferenceForm() {
  const [category, setCategory] = useState("locale");
  const [key, setKey] = useState("display_currency");
  const [value, setValue] = useState("USD");
  const [confirmed, setConfirmed] = useState(false);
  const save = useSavePreference();
  const sensitive = isSensitivePreference(category, key);
  const needsConfirmation =
    sensitive || (save.error instanceof ApiError && save.error.status === 428);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!key.trim() || (sensitive && !confirmed)) return;
    save.mutate(
      {
        category,
        preference_key: key.trim(),
        value: parsePreferenceValue(value),
        is_sensitive: sensitive,
        confirmed,
      },
      { onSuccess: () => setConfirmed(false) },
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Select
          id="preference-category"
          label="Category"
          value={category}
          onChange={(event) => {
            const next = PREFERENCE_CATEGORIES.find(
              (c) => c.id === event.target.value,
            );
            setCategory(event.target.value);
            setConfirmed(false);
            save.reset();
            if (next?.defaultKey) setKey(next.defaultKey);
          }}
        >
          {PREFERENCE_CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Field
          id="preference-key"
          label="Preference key"
          placeholder="e.g. display_currency"
          value={key}
          onChange={(event) => {
            setKey(event.target.value);
            setConfirmed(false);
            save.reset();
          }}
          required
        />
        <Field
          id="preference-value"
          label="Value"
          placeholder='e.g. "USD" or {"city": "Bengaluru"}'
          value={value}
          onChange={(event) => setValue(event.target.value)}
          required
        />
      </div>
      {needsConfirmation ? (
        <Callout tone="warning" title="Sensitive personal preference">
          <p>
            <strong>{key}</strong> contains sensitive personal data (e.g.
            address, medical/dietary, ID, or payment preference). Vox requires
            explicit confirmation before saving or replacing it.
          </p>
          <CheckboxField
            checked={confirmed}
            onChange={(event) => setConfirmed(event.target.checked)}
            label="I explicitly authorize Vox to save/replace this sensitive preference."
          />
        </Callout>
      ) : null}
      <Button
        type="submit"
        disabled={save.isPending || (needsConfirmation && !confirmed)}
      >
        {save.isPending ? "Saving…" : "Save preference"}
      </Button>
      {save.isError ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(save.error, "Failed to save preference")}</p>
        </Callout>
      ) : null}
      {save.isSuccess ? (
        <Callout tone="success" live="polite">
          <p>
            Preference &quot;{save.data.preference_key}&quot; saved
            successfully.
          </p>
        </Callout>
      ) : null}
    </form>
  );
}

export function PreferencesPanel() {
  const preferences = usePreferences();
  const remove = useDeletePreference();

  return (
    <div className="space-y-6">
      <Callout title="Preferences are advisory context only">
        <p>
          Saved preferences are user-managed and kept separate from task history
          and agent code. They grant no capability, account, payment, or action
          authority. Authoritative provider facts (currency, inventory, booking
          deadlines, timezone) always supersede saved preferences.
        </p>
      </Callout>
      <div className="grid items-start gap-6 2xl:grid-cols-2">
        <Panel title="Save a preference">
          <PreferenceForm />
        </Panel>
        <Panel
          title={`Saved preferences${preferences.data ? ` (${preferences.data.length})` : ""}`}
          actions={
            <Button
              variant="secondary"
              size="sm"
              disabled={preferences.isFetching}
              onClick={() => void preferences.refetch()}
            >
              {preferences.isFetching ? "Loading…" : "Refresh"}
            </Button>
          }
        >
          {remove.isError ? (
            <Callout tone="danger" live="assertive">
              <p>{errorMessage(remove.error, "Failed to delete preference")}</p>
            </Callout>
          ) : null}
          <QueryContent
            query={preferences}
            loadingLabel="Loading preferences"
            errorTitle="Preferences could not be loaded"
            isEmpty={(data) => data.length === 0}
            empty={
              <EmptyMessage title="No saved preferences">
                Add advisory preferences using the form.
              </EmptyMessage>
            }
          >
            {(data) => (
              <div className="space-y-2">
                {data.map((preference) => (
                  <ItemCard
                    key={preference.id}
                    testId={`pref-${preference.preference_key}`}
                    title={
                      <span className="font-mono">
                        {preference.preference_key}
                      </span>
                    }
                    badges={
                      <>
                        <Tag
                          tone={preference.is_sensitive ? "warning" : "neutral"}
                        >
                          {preference.category}
                        </Tag>
                        {preference.is_sensitive ? (
                          <Tag
                            tone="warning"
                            label="Sensitive personal preference, explicitly confirmed"
                          >
                            Sensitive · confirmed
                          </Tag>
                        ) : null}
                      </>
                    }
                    subtitle={
                      <span className="font-mono text-xs">
                        {formatPreferenceValue(preference.value)}
                      </span>
                    }
                    actions={
                      <Button
                        variant="danger"
                        size="sm"
                        aria-label={`Delete preference: ${preference.preference_key}`}
                        disabled={
                          remove.isPending &&
                          remove.variables === preference.preference_key
                        }
                        onClick={() => remove.mutate(preference.preference_key)}
                      >
                        Delete
                      </Button>
                    }
                    footer={<span>{preference.authority_disclaimer}</span>}
                  />
                ))}
              </div>
            )}
          </QueryContent>
        </Panel>
      </div>
    </div>
  );
}
