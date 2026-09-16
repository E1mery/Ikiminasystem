import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  Users,
  Clock,
  CalendarCheck,
  Megaphone,
  ArrowRight,
} from "lucide-react";
import { AnnouncementFormClient } from "./announcement-form-client";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [incomeRes, totalMembers, pendingLoansRes, pendingLoans, nextPayoutMember, announcements] =
    await Promise.all([
      // 1. Total Income (Sum of all contributions)
      prisma.contribution.aggregate({
        _sum: { amountPaid: true },
      }),
      // 2. Total Members
      prisma.user.count({
        where: { role: "Member" },
      }),
      // 3. Pending Loans sum
      prisma.loan.aggregate({
        where: { status: "Pending" },
        _sum: { principalAmount: true },
      }),
      // 4. Pending Loans list
      prisma.loan.findMany({
        where: { status: "Pending" },
        orderBy: { dateRequested: "asc" },
        include: { user: true },
        take: 5,
      }),
      // 5. Next Payout user
      prisma.groupMember.findFirst({
        where: { hasReceived: false },
        orderBy: { payoutTurn: "asc" },
        include: { user: true },
      }),
      // 6. Recent announcements
      prisma.announcement.findMany({
        orderBy: { datePosted: "desc" },
        take: 5,
        include: { admin: true },
      }),
    ]);

  const totalIncome = incomeRes._sum.amountPaid || 0;
  const pendingLoansSum = pendingLoansRes._sum.principalAmount || 0;
  const nextPayoutUser = nextPayoutMember ? nextPayoutMember.user.name : "Pending Setup";

  return (
    <div className="space-y-8">
      {/* 4 Statistics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Income */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Income
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(totalIncome)}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <Wallet className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Members */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Members
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {totalMembers}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Loans */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pending Loans
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">
                {formatCurrency(pendingLoansSum)}
              </h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Clock className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Next Payout */}
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
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <CalendarCheck className="h-6 w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2-Column Section: Action Required (Pending Loans) & Broadcast Announcements */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left 2 Cols: Action Required Pending Loans */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Action Required: Pending Loans</CardTitle>
              <Link href="/admin/loans">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-blue-600">
                  <span>View All</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingLoans.length > 0 ? (
                    pendingLoans.map((loan) => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-bold text-slate-900">
                          {loan.user.name}
                        </TableCell>
                        <TableCell className="text-slate-700">
                          {formatCurrency(loan.principalAmount)}
                        </TableCell>
                        <TableCell className="text-slate-500 text-xs">
                          {formatDate(loan.dateRequested)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link href={`/admin/loans?status=Pending`}>
                            <Button size="sm" variant="outline" className="text-xs h-8">
                              Review
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-10 text-slate-400">
                        No pending loan requests at this time.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Right 1 Col: Broadcast Announcement & Recent Broadcasts */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-blue-600" />
                <span>Broadcast Announcement</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AnnouncementFormClient />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Recent Broadcasts Sent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.length > 0 ? (
                announcements.map((notice) => (
                  <div
                    key={notice.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-1.5"
                  >
                    <p className="text-xs leading-relaxed text-slate-800">{notice.message}</p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>By {notice.admin.name}</span>
                      <span>{formatDateTime(notice.datePosted)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-6 text-xs text-slate-400">
                  No announcements posted yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
