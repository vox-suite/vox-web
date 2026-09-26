"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui";
import { Callout, PageHeader } from "@/components/app";

export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="space-y-6">
      <PageHeader title="Something went wrong" />
      <Callout
        tone="danger"
        title="This page could not be displayed"
        live="assertive"
        actions={<Button onClick={reset}>Try again</Button>}
      >
        <p>Your account data is unchanged. Try again, or reload the page.</p>
      </Callout>
    </div>
  );
}
