import { NextRequest, NextResponse } from "next/server";
import { connectablePlugins } from "@/features/plugins/catalog";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

/** Only apps that can really be connected right now. */
export async function GET(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  const core = getCoreHostClient();
  let configuredHosts: string[] = [];
  if (account && core) {
    configuredHosts = await core
      .connectedAppsStatus(account.accountId)
      .then((status) => status.configured_hosts)
      .catch(() => []);
  }
  return NextResponse.json(connectablePlugins(configuredHosts));
}
