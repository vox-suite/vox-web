"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { makeQueryClient } from "./query-client";

/**
 * One QueryClient per browser session. A 401 from any account endpoint means
 * the session ended, so cached account data is dropped and the app returns to
 * sign-in instead of rendering per-panel errors.
 */
export function QueryProvider({
  children,
  signInHref,
}: {
  children: ReactNode;
  signInHref: string;
}) {
  const router = useRouter();
  const [client] = useState(() => {
    const queryClient = makeQueryClient({
      onUnauthorized: () => {
        queryClient.clear();
        router.replace(`${signInHref}?reason=session`);
      },
    });
    return queryClient;
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
