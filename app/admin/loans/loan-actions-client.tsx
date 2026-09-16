"use client";

import * as React from "react";
import { useActionState } from "react";
import { FileText, Check } from "lucide-react";
import { setLoanTermsAction, approveLoanAction, ActionResult } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LoanModalClient, LoanModalData } from "./loan-modal-client";

interface LoanRowActionsProps {
  loan: {
    id: number;
    userName: string;
    userPhone: string;
    userIdNumber: string;
    principalAmount: number;
    interestRate: number;
    totalRepayable: number;
    durationMonths: number;
    loanReason: string;
    status: string;
    acceptanceStatus: string;
    dateRequested: Date | string;
  };
}

export function LoanRowActions({ loan }: LoanRowActionsProps) {
  const [modalOpen, setModalOpen] = React.useState(false);
  const [isApproving, startApproveTransition] = React.useTransition();

  const [, rateAction, isRatePending] = useActionState<ActionResult, FormData>(
    setLoanTermsAction,
    { success: false }
  );

  const duration = Math.max(1, loan.durationMonths || 1);
  const monthlyPayment = Math.round(loan.totalRepayable / duration);

  const modalData: LoanModalData = {
    id: loan.id,
    userName: loan.userName,
    userPhone: loan.userPhone,
    userIdNumber: loan.userIdNumber,
    principalAmount: loan.principalAmount,
    interestRate: loan.interestRate,
    totalRepayable: loan.totalRepayable,
    durationMonths: duration,
    monthlyPayment,
    loanReason: loan.loanReason,
    status: loan.status,
    dateRequested: loan.dateRequested,
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {/* View Official Contract Form */}
        <Button
          size="sm"
          variant="outline"
          onClick={() => setModalOpen(true)}
          className="text-xs h-8 px-2.5"
          title="View & Download Official Form"
        >
          <FileText className="h-3.5 w-3.5 mr-1 text-blue-600" />
          <span>Form</span>
        </Button>

        {/* Final Approve Button (Available when member accepted terms) */}
        {loan.status === "Pending" && loan.acceptanceStatus === "Accepted" && (
          <Button
            size="sm"
            variant="success"
            disabled={isApproving}
            onClick={() => {
              startApproveTransition(async () => {
                await approveLoanAction(loan.id);
              });
            }}
            className="text-xs h-8 px-2.5"
            title="Approve & Disburse Loan"
          >
            <Check className="h-3.5 w-3.5 mr-1" />
            <span>{isApproving ? "Approving..." : "Approve"}</span>
          </Button>
        )}
      </div>

      <LoanModalClient
        loan={modalData}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}

export function LoanRateSetter({
  loanId,
  currentRate,
}: {
  loanId: number;
  currentRate: number;
}) {
  const [, formAction, isPending] = useActionState<ActionResult, FormData>(
    setLoanTermsAction,
    { success: false }
  );

  return (
    <form action={formAction} className="flex items-center gap-1.5">
      <input type="hidden" name="loan_id" value={loanId} />
      <Input
        name="interest_rate"
        type="number"
        step="0.5"
        min="0"
        defaultValue={currentRate || 10}
        className="w-16 h-7 text-xs px-1.5 text-center"
      />
      <span className="text-xs text-slate-500 font-bold">%</span>
      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        className="h-7 text-xs px-2"
      >
        {isPending ? "..." : "Set"}
      </Button>
    </form>
  );
}
