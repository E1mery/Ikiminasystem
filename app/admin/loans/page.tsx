import Link from "next/link";
import prisma from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LoanRowActions, LoanRateSetter } from "./loan-actions-client";

export const dynamic = "force-dynamic";

interface AdminLoansPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function AdminLoansPage({
  searchParams,
}: AdminLoansPageProps) {
  const params = await searchParams;
  const currentStatus = params.status || "Pending";

  const filterTabs = [
    { label: "Pending Review", value: "Pending" },
    { label: "Waiting Disbursement", value: "Accepted" },
    { label: "Active Loans", value: "Active" },
    { label: "Settled History", value: "Paid" },
    { label: "All Records", value: "All" },
  ];

  // Query condition based on status filter
  let whereClause: any = {};
  if (currentStatus === "Accepted") {
    whereClause = { status: "Pending", acceptanceStatus: "Accepted" };
  } else if (currentStatus === "Pending") {
    whereClause = { status: "Pending" };
  } else if (currentStatus === "Active") {
    whereClause = { status: "Active" };
  } else if (currentStatus === "Paid") {
    whereClause = { status: "Paid" };
  }

  const loans = await prisma.loan.findMany({
    where: whereClause,
    orderBy: { dateRequested: "desc" },
    include: { user: true },
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900">
          Loan Approvals & Management
        </h2>
        <p className="text-sm text-slate-500 mt-1">
          Review member loan applications, configure interest terms, and authorize disbarment contracts.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {filterTabs.map((tab) => {
          const isActive = currentStatus === tab.value;
          return (
            <Link
              key={tab.value}
              href={`/admin/loans?status=${tab.value}`}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Loan Management Table Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Loan Records ({loans.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant Details</TableHead>
                <TableHead>Principal & Duration</TableHead>
                <TableHead>Interest & Repayment</TableHead>
                <TableHead>Status / Acceptance</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loans.length > 0 ? (
                loans.map((loan) => {
                  const duration = Math.max(1, loan.durationMonths || 1);
                  const monthlyPayment = Math.round(loan.totalRepayable / duration);

                  return (
                    <TableRow key={loan.id}>
                      {/* Applicant */}
                      <TableCell>
                        <div className="font-bold text-slate-900">{loan.user.name}</div>
                        <div className="text-xs text-slate-500">{loan.user.phoneNumber}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ID: {loan.idNumber || "N/A"}
                        </div>
                      </TableCell>

                      {/* Principal & Duration */}
                      <TableCell>
                        <div className="font-bold text-slate-900">
                          {formatCurrency(loan.principalAmount)}
                        </div>
                        <div className="text-xs text-slate-500">
                          Duration: <span className="font-semibold text-slate-700">{duration} Month(s)</span>
                        </div>
                      </TableCell>

                      {/* Interest Rate & Total */}
                      <TableCell>
                        {loan.status === "Pending" ? (
                          <div className="space-y-1">
                            <LoanRateSetter loanId={loan.id} currentRate={loan.interestRate} />
                            <div className="text-xs text-slate-600">
                              Total: <span className="font-bold text-slate-900">{formatCurrency(loan.totalRepayable)}</span>
                            </div>
                            <div className="text-[11px] text-emerald-600 font-semibold">
                              ~{formatCurrency(monthlyPayment)}/mo
                            </div>
                          </div>
                        ) : (
                          <div>
                            <div className="text-xs text-slate-600">
                              Rate: <span className="font-bold text-slate-900">{loan.interestRate}%</span>
                            </div>
                            <div className="text-xs text-slate-600">
                              Total: <span className="font-bold text-slate-900">{formatCurrency(loan.totalRepayable)}</span>
                            </div>
                            <div className="text-[11px] text-emerald-600 font-semibold">
                              ~{formatCurrency(monthlyPayment)}/mo
                            </div>
                          </div>
                        )}
                      </TableCell>

                      {/* Status / Acceptance */}
                      <TableCell>
                        {loan.status === "Pending" && (
                          <div className="space-y-1">
                            {loan.acceptanceStatus === "Accepted" ? (
                              <Badge variant="success">Terms Accepted ✅</Badge>
                            ) : (
                              <Badge variant="warning">Waiting Member ⏳</Badge>
                            )}
                            <div className="text-[10px] text-slate-400">
                              {formatDate(loan.dateRequested)}
                            </div>
                          </div>
                        )}

                        {loan.status === "Active" && (
                          <div className="space-y-1">
                            <Badge variant="info">Active / Disbursed</Badge>
                            <div className="text-[10px] text-slate-400">
                              {formatDate(loan.dateRequested)}
                            </div>
                          </div>
                        )}

                        {loan.status === "Paid" && (
                          <div className="space-y-1">
                            <Badge variant="success">Fully Settled</Badge>
                            <div className="text-[10px] text-slate-400">
                              {formatDate(loan.dateRequested)}
                            </div>
                          </div>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <LoanRowActions
                          loan={{
                            id: loan.id,
                            userName: loan.user.name,
                            userPhone: loan.user.phoneNumber,
                            userIdNumber: loan.idNumber || loan.user.idNumber,
                            principalAmount: loan.principalAmount,
                            interestRate: loan.interestRate,
                            totalRepayable: loan.totalRepayable,
                            durationMonths: loan.durationMonths,
                            loanReason: loan.loanReason,
                            status: loan.status,
                            acceptanceStatus: loan.acceptanceStatus,
                            dateRequested: loan.dateRequested,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400">
                    No loan records found for this category.
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
