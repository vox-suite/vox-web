"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { Callout, MetaList, PageHeader, Panel } from "@/components/app";
import { useAccount } from "@/components/app-shell/account-context";
import { useAppPaths } from "@/components/app-shell/app-paths";
import { signOut, type SignOutScope } from "../session";

function LinkedIdentities() {
  return (
    <Callout title="Identity linking is not available yet">
      <p>
        Use the sign-in method you originally chose. Joining another login
        identity will require verifying both identities. Matching email
        addresses do not grant access to an existing Vox account.
      </p>
    </Callout>
  );
}

function SessionControls() {
  const { signInHref } = useAppPaths();
  const queryClient = useQueryClient();
  const [pending, setPending] = useState<SignOutScope | null>(null);

  async function end(scope: SignOutScope) {
    setPending(scope);
    queryClient.clear();
    await signOut(scope, signInHref);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="secondary"
        disabled={pending !== null}
        onClick={() => void end("local")}
      >
        {pending === "local" ? "Signing out…" : "Sign out"}
      </Button>
      <Button
        variant="ghost"
        disabled={pending !== null}
        onClick={() => void end("global")}
      >
        {pending === "global"
          ? "Signing out everywhere…"
          : "Sign out everywhere"}
      </Button>
    </div>
  );
}

export function AccountScreen() {
  const account = useAccount();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Account"
        description="Identity and sessions for your Vox account."
      />
      <Panel title="Profile">
        <MetaList
          items={[
            { label: "Name", value: account.name },
            { label: "Email", value: account.email },
          ]}
        />
      </Panel>
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Panel
          title="Linked identities"
          description="Connected service accounts and assistant permissions remain separate from sign-in identities."
        >
          <LinkedIdentities />
        </Panel>
      </div>
      <Panel
        title="Sessions"
        description="Sign out of this browser, or end every Vox session for this account."
      >
        <SessionControls />
      </Panel>
    </div>
  );
}
