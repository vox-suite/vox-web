import type { ReactNode } from "react";
import { AccountProvider } from "@/components/app-shell/account-context";
import { AppPathsProvider } from "@/components/app-shell/app-paths";
import { AppShell } from "@/components/app-shell/app-shell";
import { requireConsumerPage } from "@/lib/consumer-auth/require-consumer";
import { QueryProvider } from "@/lib/query/query-provider";

export default async function WorkspaceLayout({
  children,
}: {
  children: ReactNode;
}) {
  const { account, basePath } = await requireConsumerPage();
  return (
    <AppPathsProvider basePath={basePath}>
      <AccountProvider
        account={{
          name: account.name,
          email: account.email,
          image: account.image,
          recoveryEnabled: account.recoveryEnabled,
        }}
      >
        <QueryProvider signInHref={`${basePath}/sign-in`}>
          <AppShell>{children}</AppShell>
        </QueryProvider>
      </AccountProvider>
    </AppPathsProvider>
  );
}
