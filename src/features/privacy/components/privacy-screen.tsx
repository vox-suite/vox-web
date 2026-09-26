"use client";

import {
  PageHeader,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/app";
import { PreferencesPanel } from "@/features/preferences/components/preferences-panel";
import { DataSharingPanel } from "./data-sharing-panel";
import { HistoryDeletionPanel } from "./history-deletion-panel";

export function PrivacyScreen() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Privacy, preferences & data governance"
        description="Manage saved preferences separately from conversation and task history. Understand platform-controlled retention limits."
      />
      <Tabs defaultValue="preferences">
        <TabsList aria-label="Privacy areas">
          <TabsTrigger value="preferences">Saved preferences</TabsTrigger>
          <TabsTrigger value="history">Task &amp; history deletion</TabsTrigger>
          <TabsTrigger value="governance">
            Data sharing &amp; portability
          </TabsTrigger>
        </TabsList>
        <TabsContent value="preferences">
          <PreferencesPanel />
        </TabsContent>
        <TabsContent value="history">
          <HistoryDeletionPanel />
        </TabsContent>
        <TabsContent value="governance">
          <DataSharingPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}
