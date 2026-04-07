import { requireAdmin } from "@/lib/auth/dal";
import AdminShell from "@/components/admin/layout/AdminShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <div className="min-h-screen bg-background">
      <AdminShell userName={session.name}>{children}</AdminShell>
    </div>
  );
}
