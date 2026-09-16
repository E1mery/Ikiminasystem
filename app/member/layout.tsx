import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";

export const dynamic = "force-dynamic";

export default async function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (session.role !== "Member") {
    redirect("/admin");
  }

  return (
    <DashboardShell
      title="Member Dashboard"
      userName={session.name}
      role="Member"
    >
      {children}
    </DashboardShell>
  );
}
