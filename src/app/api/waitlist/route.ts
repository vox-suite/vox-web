const EMAIL = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;
const SOURCES = new Set(["nav", "hero", "final"]);
const WINDOW_MS = 60_000;
const MAX_HITS = 5;
const hits = new Map<string, number[]>();

function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_HITS;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (limited(ip))
    return Response.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 },
    );

  let body: {
    email?: unknown;
    source?: unknown;
    company?: unknown;
    task?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  if (typeof body.company === "string" && body.company)
    return Response.json({ ok: true });

  const email =
    typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !EMAIL.test(email)) {
    return Response.json(
      { error: "Enter a valid email address." },
      { status: 400 },
    );
  }
  const source =
    typeof body.source === "string" && SOURCES.has(body.source)
      ? body.source
      : "hero";

  const url = process.env.WAITLIST_SUPABASE_URL;
  const key = process.env.WAITLIST_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key)
    return Response.json(
      { error: "The waitlist is unavailable right now." },
      { status: 503 },
    );

  const headers = {
    apikey: key,
    "Content-Type": "application/json",
  };
  try {
    const res = await fetch(`${url}/rest/v1/waitlist?on_conflict=email`, {
      method: "POST",
      headers: {
        ...headers,
        Prefer: "resolution=ignore-duplicates,return=minimal",
      },
      body: JSON.stringify({ email, source }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok)
      return Response.json(
        { error: "Could not save your email. Try again." },
        { status: 502 },
      );

    const task =
      typeof body.task === "string" ? body.task.trim().slice(0, 280) : "";
    if (task) {
      const taskResult = await fetch(`${url}/rest/v1/waitlist_tasks`, {
        method: "POST",
        headers: { ...headers, Prefer: "return=minimal" },
        body: JSON.stringify({ email, task }),
        signal: AbortSignal.timeout(10000),
      }).catch(() => null);
      if (!taskResult?.ok)
        return Response.json(
          {
            emailSaved: true,
            error:
              "You’re on the waitlist, but we couldn’t save your task. Your answer is still here—please try again.",
          },
          { status: 502 },
        );
    }
    return Response.json({ ok: true });
  } catch {
    return Response.json(
      {
        error:
          "Could not complete your signup. Your details are still here—please try again.",
      },
      { status: 502 },
    );
  }
}
