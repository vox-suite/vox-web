import { PipelineView } from "@/components/pipeline/pipeline-view";
import { requireSuperuser } from "@/lib/auth";

export default async function AdminPipelinePage() {
  await requireSuperuser();
  return (
    <div className="h-[calc(100vh-56px)] w-full overflow-hidden bg-[var(--color-void-black)]">
      <PipelineView
        showHeader
        className="w-full h-full border-none shadow-none"
      />
    </div>
  );
}
