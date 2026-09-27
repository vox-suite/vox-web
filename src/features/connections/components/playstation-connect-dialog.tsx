"use client";

import { useState } from "react";
import { Button, Field } from "@/components/ui";
import { Callout } from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import { useConnectPlayStation } from "../queries";

export function PlayStationConnectDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [onlineId, setOnlineId] = useState("");
  const [npsso, setNpsso] = useState("");
  const connect = useConnectPlayStation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onlineId.trim()) return;

    connect.mutate(
      {
        accountDisplayId: onlineId.trim(),
        npssoToken: npsso.trim(),
      },
      {
        onSuccess: () => {
          setOnlineId("");
          setNpsso("");
          onClose();
        },
      },
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-xl border border-border-edge bg-ink p-6 shadow-xl">
        <div className="flex items-center justify-between border-b border-border-edge pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-pure-white">
              Sign In to PlayStation Network
            </h3>
            <p className="text-xs text-smoke">
              Link your PlayStation 5 account to extract and view gaming activity in your timeline Spans.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-smoke hover:text-pure-white cursor-pointer"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <Callout title="How to get your PlayStation authentication token">
            <ol className="list-decimal pl-4 text-xs space-y-1 text-smoke">
              <li>
                Sign in to your PlayStation account at{" "}
                <a
                  href="https://www.playstation.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist underline hover:text-pure-white"
                >
                  playstation.com
                </a>
              </li>
              <li>
                In the same browser session, open{" "}
                <a
                  href="https://ca.account.sony.com/api/v1/ssocookie"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mist underline hover:text-pure-white font-mono"
                >
                  sony.com ssocookie
                </a>{" "}
                and copy the 64-character <code>npsso</code> code.
              </li>
              <li>Paste your PSN Online ID and NPSSO token below.</li>
            </ol>
          </Callout>

          <Field
            id="psn-online-id"
            label="PlayStation Online ID / PSN ID"
            placeholder="e.g. GamerTag"
            value={onlineId}
            onChange={(e) => setOnlineId(e.target.value)}
            required
            hint="Your public PSN account handle or username."
          />

          <Field
            id="psn-npsso"
            label="NPSSO Token (Authentication)"
            placeholder="64-character token"
            value={npsso}
            onChange={(e) => setNpsso(e.target.value)}
            hint="Used securely by the PlayStation 5 worker to extract your game play sessions."
          />

          {connect.isError ? (
            <Callout tone="danger" live="assertive">
              <p>{errorMessage(connect.error, "Failed to connect PlayStation account")}</p>
            </Callout>
          ) : null}

          <div className="flex justify-end gap-2 pt-2 border-t border-border-edge">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onClose}
              disabled={connect.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={connect.isPending || !onlineId.trim()}
            >
              {connect.isPending ? "Connecting & Syncing…" : "Sign In & Sync Activity"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
