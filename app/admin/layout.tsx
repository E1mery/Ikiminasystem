import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "Admin") {
    redirect("/member");
  }

  return (
    <DashboardShell
      title="Admin Portal"
      userName={session.name}
      role="Admin"
    >
      {children}
    </DashboardShell>
  );
}
