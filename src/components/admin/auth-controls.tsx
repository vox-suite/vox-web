"use client";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { Button, Notice, Stack } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";

function adminHome() {
  return window.location.host.startsWith("admin.") ? "/" : "/admin";
}

function adminLogin() {
  return window.location.host.startsWith("admin.") ? "/login" : "/admin/login";
}

export function GoogleSignIn({ disabled = false }: { disabled?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  return (
    <Stack gap="small">
      <Button
        disabled={disabled || pending}
        onClick={async () => {
          setPending(true);
          setError(false);
          try {
            const supabase = createClient();
            const { error: oauthError } = await supabase.auth.signInWithOAuth({
              provider: "google",
              options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${adminHome()}`,
                queryParams: { prompt: "select_account" },
              },
            });
            if (oauthError) {
              setError(true);
              setPending(false);
            }
          } catch {
            setError(true);
            setPending(false);
          }
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.61 4.61 0 0 1-2 3.02v2.51h3.24c1.89-1.74 2.98-4.3 2.98-7.36ZM12 22c2.7 0 4.96-.9 6.62-2.41l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.76-5.59-4.12H3.07v2.59A10 10 0 0 0 12 22ZM6.41 13.92a6 6 0 0 1 0-3.84V7.49H3.07a10 10 0 0 0 0 9.02l3.34-2.59ZM12 5.96c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.93 5.49l3.34 2.59A6 6 0 0 1 12 5.96Z" />
        </svg>
        {pending ? "Connecting to Google…" : "Continue with Google"}
      </Button>
      {error && (
        <Notice title="Could not start sign-in" tone="error">
          Try again in a moment.
        </Notice>
      )}
    </Stack>
  );
}

export function SignOutButton() {
  return (
    <Button
      variant="ghost"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.assign(adminLogin());
      }}
    >
      <LogOut size={15} aria-hidden="true" />
      Sign out
    </Button>
  );
}
