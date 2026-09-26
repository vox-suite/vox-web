"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

let client: SupabaseClient | undefined;

/**
 * Created on first use, not at import: client components are also rendered on
 * the server, and building the browser client without its public env vars
 * throws, which would crash every page that merely imports this module.
 */
export function getSupabase() {
  client ??= createClient();
  return client;
}
