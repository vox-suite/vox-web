"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Field } from "@/components/ui";
import { Callout, ItemCard, MetaList } from "@/components/app";
import { apiRequest, errorMessage } from "@/lib/api/http";
import { connectionKeys } from "../queries";

type CaptureStatus = {
  capture_enabled: boolean;
  last_synced_at: string | null;
  failure_code: string | null;
  games: Record<
    string,
    {
      total_seconds: number;
      last_played_at: string;
      name: string;
      platform: string;
    }
  >;
};

export function PlayStationLink() {
  const [token, setToken] = useState("");
  const [capture, setCapture] = useState(true);
  const submittedToken = useRef("");
  const client = useQueryClient();
  const link = useMutation({
    mutationFn: () => {
      const npsso = submittedToken.current;
      submittedToken.current = "";
      return apiRequest("/api/account/playstation/link", {
        method: "POST",
        body: { npsso, capture_enabled: capture },
      });
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: connectionKeys.all });
    },
  });
  return (
    <ItemCard
      title="Connect PlayStation"
      subtitle="Capture newly observed PS5 and PS4 playtime in your timeline."
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (link.isPending) return;
          const npsso = token.trim();
          setToken("");
          submittedToken.current = npsso;
          link.mutate();
        }}
      >
        <p className="text-sm text-smoke">
          Sign in on{" "}
          <a
            className="underline"
            href="https://www.playstation.com/"
            target="_blank"
            rel="noreferrer"
          >
            PlayStation
          </a>
          , then open{" "}
          <a
            className="underline"
            href="https://ca.account.sony.com/api/v1/ssocookie"
            target="_blank"
            rel="noreferrer"
          >
            Sony’s session page
          </a>{" "}
          in the same browser and copy the npsso value. This uses a community
          PSN integration.
        </p>
        <Field
          id="playstation-session"
          label="Sony session token"
          type="password"
          disabled={link.isPending}
          autoComplete="off"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          required
          minLength={64}
          maxLength={64}
          hint="Keep this token private. Vox exchanges it with Sony and does not retain it."
        />
        <label className="flex items-start gap-2 text-sm text-mist">
          <input
            type="checkbox"
            disabled={link.isPending}
            checked={capture}
            onChange={(event) => setCapture(event.target.checked)}
          />
          Capture new gaming activity once a day. Use Refresh to check sooner.
          The first refresh records a baseline; later changes appear as activity
          over an observation window. Exact session times are unknown.
        </label>
        <Button type="submit" disabled={link.isPending}>
          {link.isPending ? "Verifying account…" : "Connect PlayStation"}
        </Button>
        {link.isError ? (
          <Callout tone="danger" live="assertive">
            <p>{errorMessage(link.error, "Unable to link PlayStation")}</p>
          </Callout>
        ) : null}
        {link.isSuccess ? (
          <Callout live="polite">
            <p>
              PlayStation account verified. Capture starts with a baseline and
              creates no agent grants.
            </p>
          </Callout>
        ) : null}
      </form>
    </ItemCard>
  );
}

export function PlayStationCapture({ connectionId }: { connectionId: string }) {
  const client = useQueryClient();
  const key = ["playstation", connectionId];
  const status = useQuery({
    queryKey: key,
    queryFn: () =>
      apiRequest<CaptureStatus>(
        `/api/account/playstation/${connectionId}/status`,
        { method: "POST" },
      ),
    refetchInterval: 30_000,
  });
  const change = useMutation({
    mutationFn: (enabled: boolean) =>
      apiRequest(`/api/account/playstation/${connectionId}/capture`, {
        method: "POST",
        body: { capture_enabled: enabled },
      }),
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: key });
    },
  });
  const sync = useMutation({
    mutationFn: () =>
      apiRequest<{ spans_created: number; baseline: boolean }>(
        `/api/account/playstation/${connectionId}/sync`,
        { method: "POST" },
      ),
    onSettled: () => {
      void client.invalidateQueries({ queryKey: key });
    },
  });
  return (
    <div className="space-y-3">
      <MetaList
        items={[
          {
            label: "Gaming capture",
            value: status.isPending
              ? "Loading…"
              : status.data?.capture_enabled
                ? "Enabled"
                : "Paused",
          },
          {
            label: "Last refresh",
            value: status.data?.last_synced_at
              ? new Date(status.data.last_synced_at).toLocaleString()
              : "Awaiting first refresh",
          },
          {
            label: "Games tracked",
            value: String(Object.keys(status.data?.games ?? {}).length),
          },
        ]}
      />
      {status.data ? (
        <MetaList
          items={Object.entries(status.data.games)
            .slice(0, 10)
            .map(([id, game]) => ({
              label: game.name || id,
              value: `${Math.floor(game.total_seconds / 3600)}h ${Math.floor((game.total_seconds % 3600) / 60)}m total on ${game.platform || "PlayStation"}`,
            }))}
        />
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          disabled={!status.data || change.isPending || sync.isPending}
          onClick={() => change.mutate(!status.data?.capture_enabled)}
        >
          {status.data?.capture_enabled ? "Pause capture" : "Resume capture"}
        </Button>
        <Button
          size="sm"
          disabled={
            !status.data?.capture_enabled || sync.isPending || change.isPending
          }
          onClick={() => sync.mutate()}
        >
          {sync.isPending ? "Refreshing…" : "Refresh"}
        </Button>
      </div>
      {status.data?.failure_code ? (
        <Callout tone="warning">
          <p>
            {status.data.failure_code === "reconnect_required"
              ? "Reconnect PlayStation to resume capture."
              : "The last sync failed. Vox will retry automatically."}
          </p>
        </Callout>
      ) : null}
      {sync.isSuccess ? (
        <Callout live="polite">
          <p>
            {sync.data.baseline
              ? "Baseline recorded. New playtime will appear after your next gaming activity."
              : `${sync.data.spans_created} gaming spans captured.`}
          </p>
        </Callout>
      ) : null}
      {status.isError || change.isError || sync.isError ? (
        <Callout tone="danger" live="assertive">
          <p>
            {errorMessage(
              status.error ?? change.error ?? sync.error,
              "PlayStation request failed",
            )}
          </p>
        </Callout>
      ) : null}
    </div>
  );
}
