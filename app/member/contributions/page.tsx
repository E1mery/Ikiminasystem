import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PaymentFormClient } from "./payment-form-client";

export const dynamic = "force-dynamic";

export default async function MemberContributionsPage() {
  const session = (await getSession())!;
  const userId = session.userId;

  const [user, savingsRes, activeLoan, transactions] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.contribution.aggregate({
      where: { userId, paymentType: "Savings" },
      _sum: { amountPaid: true },
    }),
    prisma.loan.findFirst({
      where: { userId, status: "Active" },
    }),
    prisma.contribution.findMany({
      where: { userId },
      orderBy: { paymentDate: "desc" },
      take: 15,
    }),
  ]);

  const totalSavings = savingsRes._sum.amountPaid || 0;
  const activeLoanBalance = activeLoan ? activeLoan.principalAmount : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          MTN Mobile Money Payments & Repayments
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Deposit monthly group savings or repay your active internal loans with automated USSD prompts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
        {/* Left Column: Interactive Payment Form */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Make an MTN Mobile Money Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentFormClient
              defaultPhone={user?.phoneNumber || ""}
              activeLoanBalance={activeLoanBalance}
            />
          </CardContent>
        </Card>

        {/* Right Column: Financial Summary & Transaction Log */}
        <div className="space-y-6">
          {/* Summary Card */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Total Savings Balance
                </p>
                <p className="text-2xl font-bold text-emerald-800 mt-1">
                  {formatCurrency(totalSavings)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-red-700">
                  Active Loan Debt
                </p>
                <p className="text-2xl font-bold text-red-800 mt-1">
                  {formatCurrency(activeLoanBalance)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment History Card */}
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base">Payment History Log</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell className="text-slate-600">{formatDate(tx.paymentDate)}</TableCell>
                        <TableCell>
                          <Badge variant={tx.paymentType === "Savings" ? "success" : "info"}>
                            {tx.paymentType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-bold text-slate-900">
                          {formatCurrency(tx.amountPaid)}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-slate-400">
                        No transaction logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
