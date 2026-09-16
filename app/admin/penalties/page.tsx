import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { PenaltyFormClient } from "./penalty-form-client";

export const dynamic = "force-dynamic";

export default async function AdminPenaltiesPage() {
  const [members, penalties] = await Promise.all([
    prisma.user.findMany({
      where: { role: "Member" },
      select: { id: true, name: true, phoneNumber: true },
      orderBy: { name: "asc" },
    }),
    prisma.penalty.findMany({
      orderBy: { dateIssued: "desc" },
      include: {
        user: true,
        admin: true,
      },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Member Penalties & Fine Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Issue policy infractions, track outstanding fines, and maintain group discipline.
        </p>
      </div>

      {/* Issue Penalty Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Issue Member Infraction Fine</CardTitle>
        </CardHeader>
        <CardContent>
          <PenaltyFormClient members={members} />
        </CardContent>
      </Card>

      {/* Penalties Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Penalties Log ({penalties.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Member</TableHead>
                <TableHead>Fine Amount</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="text-right">Issued By (Admin)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {penalties.length > 0 ? (
                penalties.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-slate-500 text-xs">
                      {formatDate(p.dateIssued)}
                    </TableCell>
                    <TableCell className="font-semibold text-slate-900">
                      {p.user.name}
                    </TableCell>
                    <TableCell className="font-bold text-red-600">
                      {formatCurrency(p.amount)}
                    </TableCell>
                    <TableCell className="text-slate-700 text-xs">
                      {p.reason}
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-500">
                      {p.admin.name}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                    No penalties or fines have been recorded.
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
