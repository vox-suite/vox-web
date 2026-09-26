"use client";

import type { ReactNode } from "react";
import type { Connection } from "@/lib/consumer-auth/core-host-client";
import { Lodging } from "../actions/lodging";
import { TripHistory } from "../actions/trip-history";

type ConnectionAction = {
  label: string;
  render: (connection: Connection) => ReactNode;
};

/**
 * What a connected account lets the user do from Vox, derived from the
 * provider and the capabilities Core recorded for that connection. A
 * connection with no matching capability shows nothing.
 */
function actionsFor(connection: Connection): ConnectionAction[] {
  if (connection.authorization_state !== "authorized") return [];
  const granted = new Set(connection.authorized_capabilities);
  const actions: ConnectionAction[] = [];

  if (connection.integration_external_key === "uber") {
    if (granted.has("uber.trips.read")) {
      actions.push({
        label: "Trip history",
        render: (c) => <TripHistory connectionId={c.id} />,
      });
    }
  }

  if (connection.integration_external_key === "expedia") {
    if (granted.has("lodging.search")) {
      actions.push({
        label: "Find a stay",
        render: (c) => (
          <Lodging connectionId={c.id} canBook={granted.has("lodging.book")} />
        ),
      });
    }
  }

  return actions;
}

export function ConnectionActions({ connection }: { connection: Connection }) {
  const actions = actionsFor(connection);
  if (actions.length === 0) return null;

  return (
    <div className="space-y-2">
      {actions.map((action) => (
        <details
          key={action.label}
          className="group rounded-lg border border-border-edge px-4 py-3"
        >
          <summary className="cursor-pointer list-none text-sm font-medium text-mist hover:text-pure-white focus-visible:outline-2 focus-visible:outline-mist">
            {action.label}
          </summary>
          <div className="mt-3">{action.render(connection)}</div>
        </details>
      ))}
    </div>
  );
}
