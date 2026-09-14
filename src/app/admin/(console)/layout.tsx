import { requireSuperuser } from "@/lib/auth";
import { AdminShell } from "@/components/admin/shell";
export default async function ConsoleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireSuperuser();
  return <AdminShell email={user.email!}>{children}</AdminShell>;
}
