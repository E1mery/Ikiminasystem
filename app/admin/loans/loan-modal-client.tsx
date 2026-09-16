"use client";

import * as React from "react";
import { Printer } from "lucide-react";
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

export interface LoanModalData {
  id: number;
  userName: string;
  userPhone: string;
  userIdNumber: string;
  principalAmount: number;
  interestRate: number;
  totalRepayable: number;
  durationMonths: number;
  monthlyPayment: number;
  loanReason: string;
  status: string;
  dateRequested: Date | string;
}

interface LoanModalClientProps {
  loan: LoanModalData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LoanModalClient({
  loan,
  open,
  onOpenChange,
}: LoanModalClientProps) {
  if (!loan) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div id="printable-area" className="space-y-6">
        {/* Modal Header for UI */}
        <DialogHeader className="no-print border-b border-slate-100 pb-3">
          <DialogTitle>Loan Contract Review</DialogTitle>
        </DialogHeader>

        {/* Printable Official Form */}
        <div className="border-b-2 border-slate-900 pb-4 text-center">
          <h2 className="text-2xl font-black tracking-wider text-slate-900 uppercase">
            IKIMINA FINANCIAL PLATFORM
          </h2>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-0.5">
            Official Verified Loan Agreement & Application Form &bull; Rwanda
          </p>
        </div>

        {/* Reference Bar */}
        <div className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-mono text-slate-700">
          <div>
            <span className="font-bold">Contract Reference:</span> #LOAN-{loan.id.toString().padStart(5, "0")}
          </div>
          <div>
            <span className="font-bold">Date Issued:</span> {formatDate(loan.dateRequested)}
          </div>
        </div>

        {/* Section 1: Applicant Details */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-2">
            1. Applicant Details
          </h4>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 w-1/3">Full Legal Name:</td>
                <td className="py-2 font-bold text-slate-900">{loan.userName}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500">Phone Number:</td>
                <td className="py-2 font-semibold text-slate-900">{loan.userPhone}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500">National ID Number:</td>
                <td className="py-2 font-mono font-semibold text-slate-900">{loan.userIdNumber}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Loan Terms & Repayment Schedule */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-2">
            2. Loan Terms & Repayment Schedule
          </h4>
          <table className="w-full text-xs">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 w-1/3">Principal Requested:</td>
                <td className="py-2 font-semibold text-slate-900">{formatCurrency(loan.principalAmount)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500">Agreed Interest Rate:</td>
                <td className="py-2 font-semibold text-slate-900">{loan.interestRate}%</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500">Repayment Period:</td>
                <td className="py-2 font-semibold text-slate-900">{loan.durationMonths} Month(s)</td>
              </tr>
              <tr className="bg-sky-50 font-semibold text-sky-900 border-b border-sky-100">
                <td className="py-2 px-3">Periodic Monthly Due:</td>
                <td className="py-2 px-3 font-bold">{formatCurrency(loan.monthlyPayment)} / month</td>
              </tr>
              <tr className="bg-slate-100 font-bold text-slate-900">
                <td className="py-2 px-3">Total Repayable:</td>
                <td className="py-2 px-3">{formatCurrency(loan.totalRepayable)}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 pt-3">Stated Purpose:</td>
                <td className="py-2 text-slate-800 pt-3 italic">{loan.loanReason}</td>
              </tr>
              <tr>
                <td className="py-2 text-slate-500">Approval Status:</td>
                <td className="py-2 font-bold uppercase tracking-wider text-slate-900">{loan.status}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Terms & Conditions */}
        <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 text-[11px] leading-relaxed text-slate-600">
          <p className="font-bold text-slate-800 mb-1">Binding Terms & Regulations:</p>
          The applicant solemnly pledges to reimburse the full specified balance across monthly installments.
          Defaulting or untimely settlement triggers regulatory group penalties as established in internal association bylaws.
        </div>

        {/* Section 4: Signatures */}
        <div className="pt-8 flex justify-between text-xs text-slate-700">
          <div className="text-center">
            <div className="w-48 border-b border-slate-400 mb-2" />
            <p className="font-bold">Applicant Signature</p>
          </div>
          <div className="text-center">
            <div className="w-48 border-b border-slate-400 mb-2" />
            <p className="font-bold">Authorized Admin Seal & Signature</p>
          </div>
        </div>
      </div>

      {/* Modal Actions */}
      <DialogFooter className="no-print">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
        <Button
          onClick={() => window.print()}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Printer className="h-4 w-4 mr-1.5" />
          Print / Export PDF
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
