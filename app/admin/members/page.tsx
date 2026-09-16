import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DeleteMemberButton } from "./delete-member-button";

export const dynamic = "force-dynamic";

export default async function AdminMembersPage() {
  const session = (await getSession())!;

  // Fetch all users with their contributions summed
  const users = await prisma.user.findMany({
    orderBy: { id: "desc" },
    include: {
      contributions: {
        where: { paymentType: "Savings" },
        select: { amountPaid: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Member Directory & Settings
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Manage all registered platform accounts and monitor their cumulative savings.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registered Group Members ({users.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Phone Number</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Total Savings</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length > 0 ? (
                users.map((u) => {
                  const totalSavings = u.contributions.reduce((acc, c) => acc + c.amountPaid, 0);
                  const isCurrentUser = u.id === session.userId;

                  return (
                    <TableRow key={u.id}>
                      <TableCell className="text-slate-400 font-mono text-xs">#{u.id}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{u.name}</TableCell>
                      <TableCell className="text-slate-600">{u.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge variant={u.role === "Admin" ? "admin" : "member"}>
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-bold text-slate-900">
                        {formatCurrency(totalSavings)}
                      </TableCell>
                      <TableCell className="text-right">
                        {isCurrentUser ? (
                          <span className="text-xs text-slate-400 italic">Current User</span>
                        ) : (
                          <DeleteMemberButton userId={u.id} userName={u.name} />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400">
                    No registered members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
