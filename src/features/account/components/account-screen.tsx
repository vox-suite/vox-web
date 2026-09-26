"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui";
import { Callout, MetaList, PageHeader, Panel } from "@/components/app";
import { useAccount } from "@/components/app-shell/account-context";
import { useAppPaths } from "@/components/app-shell/app-paths";
import { linkGoogleIdentity, signOut, type SignOutScope } from "../session";
import { RecoveryEnrollment } from "./recovery-enrollment";

function LinkedIdentities() {
  const { basePath } = useAppPaths();
  const [pending, setPending] = useState(false);
  const [failed, setFailed] = useState(false);

  async function link() {
    setPending(true);
    setFailed(false);
    const { error } = await linkGoogleIdentity(basePath);
    // On success the browser navigates to Google; only failures return here.
    if (error) {
      setPending(false);
      setFailed(true);
    }
  }

  return (
    <div className="space-y-4">
      <Button disabled={pending} onClick={() => void link()}>
        {pending ? "Opening Google…" : "Link a verified Google identity"}
      </Button>
      {failed ? (
        <Callout
          tone="danger"
          title="Google identity was not linked"
          live="assertive"
        >
          <p>
            The identity may already belong to another Vox account, or its email
            may not match this account.
          </p>
        </Callout>
      ) : null}
    </div>
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
        description="Identity, recovery, and sessions for your Vox account."
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
          title="Email recovery"
          description="Enable this explicitly before email codes may recover a Google account."
        >
          <RecoveryEnrollment enabled={account.recoveryEnabled} />
        </Panel>
        <Panel
          title="Linked identities"
          description="Linking is always explicit. Vox never merges accounts because two providers report the same email."
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
