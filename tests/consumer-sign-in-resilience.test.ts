import assert from "node:assert/strict";
import test from "node:test";
import { getSupabase } from "../src/lib/consumer-auth/client";

test("importing the consumer Supabase client does not throw without public env", () => {
  // Reaching this line means the module loaded; client components are also
  // rendered on the server, where the env may be absent.
  assert.equal(typeof getSupabase, "function");
});

test("the client is only built on first use", () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  try {
    assert.throws(() => getSupabase(), /URL and API key are required/);
  } finally {
    if (url) process.env.NEXT_PUBLIC_SUPABASE_URL = url;
    if (key) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = key;
  }
});
