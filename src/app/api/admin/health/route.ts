import { currentSuperuser } from "@/lib/auth";
import { getSystemHealth } from "@/lib/system-health";

export const dynamic = "force-dynamic";

const responseHeaders = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
};

export async function GET() {
  const user = await currentSuperuser();
  if (!user) {
    return Response.json(
      { error: "Your session has ended. Sign in again to continue." },
      { status: 401, headers: responseHeaders },
    );
  }

  try {
    const health = await getSystemHealth();
    return Response.json(health, { headers: responseHeaders });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to retrieve system health.",
      },
      { status: 500, headers: responseHeaders },
    );
  }
}
