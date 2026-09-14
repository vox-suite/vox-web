import { AuthFrame, EmptyState, LinkButton } from "@/components/ui";
export default function NotFound() {
  return (
    <AuthFrame>
      <EmptyState
        title="This page isn’t here"
        description="The address may have changed. Head back to the workspace or the Vox homepage."
        action={<LinkButton href="/">Go home</LinkButton>}
      />
    </AuthFrame>
  );
}
