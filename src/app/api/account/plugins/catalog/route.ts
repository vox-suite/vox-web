import { NextRequest, NextResponse } from "next/server";
import { presentConnector } from "@/features/plugins/catalog";
import { currentConsumer } from "@/lib/consumer-auth/session";
import { getCoreHostClient } from "@/lib/consumer-auth/runtime";

/** Only deployment-reviewed packages are installable. Static entries supply branding only. */
export async function GET(request: NextRequest) {
  const account = await currentConsumer(request.headers);
  if (!account)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const core = getCoreHostClient();
  if (!core)
    return NextResponse.json(
      { error: "Core service unavailable" },
      { status: 503 },
    );
  try {
    const packages = await core.listConnectorPackages(account.accountId);
    const plugins = packages
      .filter((p) => p.manifest.protocol === "mcp")
      .map((p) => presentConnector(p.manifest, p.version, p.digest, p.metadata));
    const response = NextResponse.json(plugins);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  } catch {
    return NextResponse.json(
      { error: "Connector catalog unavailable" },
      { status: 502 },
    );
  }
}
