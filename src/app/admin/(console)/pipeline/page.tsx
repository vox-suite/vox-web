import { AdminPipelineConsole } from "@/components/pipeline/admin-pipeline-console";
import { requireSuperuser } from "@/lib/auth";

export default async function AdminPipelinePage() {
  await requireSuperuser();
  return <AdminPipelineConsole />;
}
