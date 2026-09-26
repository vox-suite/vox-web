"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Callout, CheckboxField, Panel } from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import { useDeleteTaskHistory } from "../queries";

export function HistoryDeletionPanel() {
  const [confirming, setConfirming] = useState(false);
  const [understood, setUnderstood] = useState(false);
  const deletion = useDeleteTaskHistory();

  function close() {
    setConfirming(false);
    setUnderstood(false);
  }

  return (
    <Panel
      title="Platform task history deletion"
      description="Request deletion of platform-controlled conversation sessions and durable task executions."
    >
      <Callout tone="warning" title="What deletion does and does not do">
        <ul className="list-disc space-y-1 pl-4">
          <li>
            <strong>No transaction undo:</strong> deleting task history removes
            internal Vox logs. It{" "}
            <strong>
              does not undo, cancel, or refund completed external actions
            </strong>{" "}
            (e.g. hotel bookings, rides, food orders, or calendar events).
          </li>
          <li>
            <strong>External records:</strong> third-party services (Amazon,
            Expedia, Uber, Twilio carrier receipts) retain transaction logs
            under their own retention policies outside Vox control.
          </li>
          <li>
            <strong>Remote operators &amp; audit retention:</strong> deployment
            operators may maintain mandatory legal audit logs exempt from
            immediate user deletion.
          </li>
          <li>
            <strong>Backup timing:</strong> database backups retain records for
            up to 30 days before rolling expiration.
          </li>
        </ul>
      </Callout>
      {!confirming ? (
        <Button
          variant="danger"
          onClick={() => {
            deletion.reset();
            setConfirming(true);
          }}
        >
          Delete platform task history
        </Button>
      ) : (
        <div
          role="group"
          aria-labelledby="confirm-history-deletion"
          className="space-y-3 rounded-lg border border-coral-pulse/30 bg-ember-hush/30 p-4"
        >
          <p
            id="confirm-history-deletion"
            className="text-[13px] font-medium text-mist"
          >
            Confirm deletion of task &amp; conversation history
          </p>
          <CheckboxField
            checked={understood}
            onChange={(event) => setUnderstood(event.target.checked)}
            label="I understand that this deletes internal Vox task records and CANNOT undo or refund completed external actions."
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="danger"
              disabled={!understood || deletion.isPending}
              onClick={() => deletion.mutate(undefined, { onSuccess: close })}
            >
              {deletion.isPending
                ? "Purging task records…"
                : "Permanently delete task history"}
            </Button>
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
          </div>
        </div>
      )}
      {deletion.isError ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(deletion.error, "Failed to delete history")}</p>
        </Callout>
      ) : null}
      {deletion.isSuccess ? (
        <Callout tone="success" title="Deletion summary" live="polite">
          <p>
            Purged <strong>{deletion.data.deleted_spans_count}</strong> timeline
            entries and{" "}
            <strong>{deletion.data.deleted_conversations_count}</strong>{" "}
            conversation turns from the platform database.
          </p>
          <p className="text-smoke">{deletion.data.disclosure}</p>
        </Callout>
      ) : null}
    </Panel>
  );
}
