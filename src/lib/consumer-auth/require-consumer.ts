import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { consumerBasePath, consumerHref } from "@/lib/consumer-routes";
import { currentConsumer } from "./session";

/**
 * Resolves the signed-in consumer for a page render or redirects to sign-in.
 * UI gating only: every `/api/account` handler authorizes independently.
 */
export async function requireConsumerPage() {
  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const account = await currentConsumer(requestHeaders);
  if (!account) redirect(`${consumerHref(host, "/sign-in")}?reason=session`);
  return { account, basePath: consumerBasePath(host) };
}
