import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { ProfileForm } from "@/components/profile-form";

export const dynamic = "force-dynamic";

export default async function AdminProfilePage() {
  const session = (await getSession())!;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Admin Account Settings
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage your administrator profile and access credentials.
        </p>
      </div>

      <ProfileForm user={user} />
    </div>
  );
}
