"use client";
import { AuthFrame, Button, EmptyState } from "@/components/ui";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <AuthFrame>
      <EmptyState
        title="Something interrupted this page"
        description="Try loading the page again. If the problem continues, contact the workspace owner."
        action={<Button onClick={reset}>Try again</Button>}
      />
    </AuthFrame>
  );
}
