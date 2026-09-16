import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Scale,
  Clock,
  CalendarCheck,
  Megaphone,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MemberDashboardPage() {
  const session = (await getSession())!;
  const userId = session.userId;

  // 1. Total Savings
  const savingsRes = await prisma.contribution.aggregate({
    where: { userId, paymentType: "Savings" },
    _sum: { amountPaid: true },
  });
  const totalSavings = savingsRes._sum.amountPaid || 0;

  // 2. Active Loan Debt
  const loanRes = await prisma.loan.aggregate({
    where: { userId, status: "Active" },
    _sum: { principalAmount: true },
  });
  const activeLoanDebt = loanRes._sum.principalAmount || 0;

  // 3. Recent Deposits
  const recentDeposits = await prisma.contribution.findMany({
    where: { userId },
    orderBy: { paymentDate: "desc" },
    take: 5,
  });

  // 4. Next Deposit Due calculation
  const lastDeposit = recentDeposits[0];
  let nextDepositDateStr: string;
  if (lastDeposit) {
    const nextDate = new Date(lastDeposit.paymentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    nextDepositDateStr = formatDate(nextDate);
  } else {
    const endOfMonth = new Date();
    endOfMonth.setMonth(endOfMonth.getMonth() + 1, 0);
    nextDepositDateStr = formatDate(endOfMonth);
  }

  // 5. Next Payout turn
  const nextPayoutMember = await prisma.groupMember.findFirst({
    where: { hasReceived: false },
    orderBy: { payoutTurn: "asc" },
    include: { user: true },
  });
  const nextPayoutUser = nextPayoutMember ? nextPayoutMember.user.name : "Pending Setup";

  // 6. Announcements feed
  const announcements = await prisma.announcement.findMany({
    orderBy: { datePosted: "desc" },
    take: 5,
    include: { admin: true },
  });

  return (
    <div className="space-y-8">
      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Savings */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Savings
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(totalSavings)}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Active Loan Debt */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Active Loan Debt
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(activeLoanDebt)}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <Scale className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Next Deposit Due */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Next Deposit Due
              </p>
              <h3 className="text-xl font-bold text-slate-900 mt-1">
                {nextDepositDateStr}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Next Group Payout */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Next Payout
              </p>
              <h3 className="text-xl font-bold text-slate-900 mt-1 truncate max-w-[140px]" title={nextPayoutUser}>
                {nextPayoutUser}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
              <CalendarCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Section: Deposit History & Admin Announcements */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Recent Deposit History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">My Recent Deposit History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentDeposits.length > 0 ? (
                    recentDeposits.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-slate-600">{formatDate(item.paymentDate)}</TableCell>
                        <TableCell>
                          <Badge variant={item.paymentType === "Savings" ? "success" : "info"}>
                            {item.paymentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-bold text-slate-900">
                          {formatCurrency(item.amountPaid)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="success">Completed</Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                        You have not made any deposits yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Announcements Feed */}
        <div>
          <Card>
            <CardHeader className="pb-4 flex flex-row items-center gap-2 space-y-0">
              <Megaphone className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.length > 0 ? (
                announcements.map((notice) => (
                  <div
                    key={notice.id}
                    className="rounded-xl border-l-4 border-blue-600 bg-blue-50/70 p-4"
                  >
                    <p className="text-sm leading-relaxed text-slate-800">{notice.message}</p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>By {notice.admin.name} (Admin)</span>
                      <span>{formatDateTime(notice.datePosted)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-8 text-sm text-slate-400">
                  No announcements from the administrator yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
