import { getSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoanFormClient } from "./loan-form-client";
import { LoanAcceptanceButton } from "./loan-acceptance-button";

export const dynamic = "force-dynamic";

export default async function MemberLoansPage() {
  const session = (await getSession())!;
  const userId = session.userId;

  const [user, userLoans] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.loan.findMany({
      where: { userId },
      orderBy: { dateRequested: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Loan Application & Status
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Apply for an internal community loan and track your approval status and repayment schedule.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
        {/* Left Column: Loan Application Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Apply for a New Loan</CardTitle>
          </CardHeader>
          <CardContent>
            <LoanFormClient defaultIdNumber={user?.idNumber || ""} />
          </CardContent>
        </Card>

        {/* Right Column: Loan History & Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">My Loan History & Status</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Principal / Duration</TableHead>
                  <TableHead>Repayable</TableHead>
                  <TableHead>Status & Terms</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userLoans.length > 0 ? (
                  userLoans.map((loan) => {
                    const dur = Math.max(1, loan.durationMonths || 1);
                    const monthly = Math.round(loan.totalRepayable / dur);

                    return (
                      <TableRow key={loan.id}>
                        <TableCell>
                          <div className="font-bold text-slate-900">
                            {formatCurrency(loan.principalAmount)}
                          </div>
                          <div className="text-xs text-slate-500">
                            {dur} Month(s) (~{formatCurrency(monthly)}/mo)
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="font-bold text-slate-900">
                            {formatCurrency(loan.totalRepayable)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Rate: {loan.interestRate}%
                          </div>
                        </TableCell>

                        <TableCell>
                          {loan.status === "Pending" && (
                            <div className="space-y-1.5">
                              {loan.acceptanceStatus === "Pending Acceptance" ? (
                                <div className="space-y-1">
                                  <Badge variant="warning">Under Review</Badge>
                                  <div>
                                    <LoanAcceptanceButton loanId={loan.id} />
                                  </div>
                                </div>
                              ) : (
                                <Badge variant="success">Accepted (Awaiting Admin)</Badge>
                              )}
                            </div>
                          )}

                          {loan.status === "Active" && (
                            <Badge variant="info">Active Loan</Badge>
                          )}

                          {loan.status === "Paid" && (
                            <Badge variant="success">Fully Settled</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-10 text-slate-400">
                      You have no loan records yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
