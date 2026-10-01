import "server-only";
import { createClient } from "@/lib/supabase/server";
import { resolveConsumer, type ConsumerSession } from "./session-authority";

export type { ConsumerSession } from "./session-authority";

let mockConsumerForTests: ConsumerSession | null | undefined;
export function setMockConsumerForTests(
  consumer: ConsumerSession | null | undefined,
) {
  mockConsumerForTests = consumer;
}

export async function currentConsumer(): Promise<ConsumerSession | null> {
  if (mockConsumerForTests !== undefined) return mockConsumerForTests;
  try {
    return await resolveConsumer((await createClient()).auth);
  } catch {
    return null;
  }
}
