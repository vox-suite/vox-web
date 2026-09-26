"use client";

import { useState } from "react";
import { Field } from "@/components/ui";
import {
  PageHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tag,
} from "@/components/app";
import { DEFAULT_CONNECTION_ID } from "../samples";
import { CompositeJourney } from "./composite-journey";
import { ConnectedRead } from "./connected-read";
import { LabelledHandoffs } from "./labelled-handoffs";
import { LodgingWrite } from "./lodging-write";

export function JourneysScreen() {
  const [connectionId, setConnectionId] = useState(DEFAULT_CONNECTION_ID);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={<Tag tone="info">Platform V1 contract</Tag>}
        title="Unified product journeys"
        description="One coherent interface for connected reads, approved writes, provider authentication, honest outcomes, and labelled handoffs."
      />
      <Field
        id="journey-connection-id"
        label="Active provider connection ID"
        hint="Authority is tied strictly to user-authorized connections stored in Core."
        className="max-w-md"
        value={connectionId}
        onChange={(event) => setConnectionId(event.target.value)}
      />
      <Tabs defaultValue="composite">
        <TabsList aria-label="Journey types">
          <TabsTrigger value="composite">Composite journey</TabsTrigger>
          <TabsTrigger value="read">Connected read (Uber)</TabsTrigger>
          <TabsTrigger value="write">Consequential write (Expedia)</TabsTrigger>
          <TabsTrigger value="handoffs">Labelled handoffs</TabsTrigger>
        </TabsList>
        <TabsContent value="composite">
          <CompositeJourney />
        </TabsContent>
        <TabsContent
          value="read"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <ConnectedRead connectionId={connectionId} />
        </TabsContent>
        <TabsContent
          value="write"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <LodgingWrite connectionId={connectionId} />
        </TabsContent>
        <TabsContent
          value="handoffs"
          forceMount
          className="data-[state=inactive]:hidden"
        >
          <LabelledHandoffs connectionId={connectionId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
