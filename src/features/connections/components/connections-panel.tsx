"use client";

import { Button } from "@/components/ui";
import {
  Callout,
  EmptyMessage,
  ItemCard,
  MetaList,
  Panel,
  QueryContent,
  StatusBadge,
} from "@/components/app";
import { errorMessage } from "@/lib/api/http";
import type { Connection } from "@/lib/consumer-auth/core-host-client";
import { useConnections, useDisconnectConnection } from "../queries";

function ConnectionCard({ connection }: { connection: Connection }) {
  const disconnect = useDisconnectConnection();
  const name = connection.integration_external_key.toUpperCase();
  const authorized = connection.authorization_state === "authorized";

  return (
    <ItemCard
      testId={`connection-${connection.id}`}
      title={name}
      subtitle={
        <>
          Account:{" "}
          <strong className="font-medium text-mist">
            {connection.account_display_id || "Account identity unavailable"}
          </strong>
        </>
      }
      badges={
        <StatusBadge
          status={authorized ? "confirmed" : connection.authorization_state}
        />
      }
      actions={
        authorized ? (
          <Button
            variant="danger"
            size="sm"
            aria-label={`Disconnect ${name} integration`}
            disabled={disconnect.isPending}
            onClick={() => disconnect.mutate(connection.id)}
          >
            {disconnect.isPending ? "Disconnecting…" : "Disconnect"}
          </Button>
        ) : null
      }
    >
      <MetaList
        items={[
          {
            label: "Custody model",
            value:
              connection.credential_custody === "platform_held"
                ? "Recorded as platform-held"
                : "Recorded as external operator",
          },
          {
            label: "Authorized capabilities",
            value: connection.authorized_capabilities.length
              ? connection.authorized_capabilities.join(", ")
              : "None",
          },
        ]}
      />
      {disconnect.isError ? (
        <Callout tone="danger" live="assertive">
          <p>{errorMessage(disconnect.error, "Failed to disconnect")}</p>
        </Callout>
      ) : null}
      {disconnect.isSuccess ? (
        <Callout tone="warning" title="Disconnect notice" live="polite">
          <p>{disconnect.data.disclosure || "Connection revoked."}</p>
        </Callout>
      ) : null}
    </ItemCard>
  );
}

export function ConnectionsPanel({ id }: { id?: string }) {
  const connections = useConnections();
  return (
    <Panel
      id={id}
      title="Connected accounts"
      description="Review account access and remove connections you no longer use."
    >
      <Callout title="Connecting is not permission">
        <p>
          Connecting an external account lets Vox reach the provider, but does{" "}
          <em>not</em> grant any agent permission to act. Agent capability
          grants are configured separately under Agent access.
        </p>
      </Callout>
      <QueryContent
        query={connections}
        loadingLabel="Loading connections"
        errorTitle="Connections could not be loaded"
        isEmpty={(data) => data.length === 0}
        empty={
          <EmptyMessage title="No connected accounts">
            Connection setup will appear here when a provider-verified
            authorization flow is available.
          </EmptyMessage>
        }
      >
        {(data) => (
          <div className="grid gap-3 2xl:grid-cols-2">
            {data.map((connection) => (
              <ConnectionCard key={connection.id} connection={connection} />
            ))}
          </div>
        )}
      </QueryContent>
    </Panel>
  );
}
