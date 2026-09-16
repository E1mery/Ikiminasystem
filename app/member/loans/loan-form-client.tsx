"use client";

import * as React from "react";
import { useActionState } from "react";
import { Send, AlertCircle, CheckCircle2, Calculator } from "lucide-react";
import { requestLoanAction, ActionResult } from "@/app/actions/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";

interface LoanFormClientProps {
  defaultIdNumber: string;
}

export function LoanFormClient({ defaultIdNumber }: LoanFormClientProps) {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    requestLoanAction,
    { success: false }
  );

  const [principal, setPrincipal] = React.useState<number>(50000);
  const [duration, setDuration] = React.useState<number>(3);

  const validPrincipal = Math.max(0, principal || 0);
  const validDuration = Math.max(1, duration || 1);
  const interestRate = 10.0; // 10% standard group rate preview
  const estimatedInterest = validPrincipal * (interestRate / 100);
  const totalRepayable = validPrincipal + estimatedInterest;
  const monthlyInstallment = Math.round(totalRepayable / validDuration);

  return (
    <form action={formAction} className="space-y-4">
      {state.message && (
        <Alert variant={state.success ? "success" : "destructive"}>
          {state.success ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div>
        <Label htmlFor="id_number">National ID Number</Label>
        <Input
          id="id_number"
          name="id_number"
          type="text"
          defaultValue={defaultIdNumber}
          placeholder="Enter your 16-digit ID number"
          required
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="principal_amount">Principal Amount (RWF)</Label>
          <Input
            id="principal_amount"
            name="principal_amount"
            type="number"
            min={1000}
            step={500}
            value={principal || ""}
            onChange={(e) => setPrincipal(parseFloat(e.target.value) || 0)}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="duration_months">Repayment Duration (Months)</Label>
          <Input
            id="duration_months"
            name="duration_months"
            type="number"
            min={1}
            max={24}
            value={duration || ""}
            onChange={(e) => setDuration(parseInt(e.target.value, 10) || 1)}
            required
            className="mt-1"
          />
        </div>
      </div>

      {/* Real-time calculation preview box */}
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 space-y-1.5 text-xs text-slate-700">
        <div className="flex items-center gap-1.5 font-semibold text-blue-900 mb-1">
          <Calculator className="h-4 w-4 text-blue-600" />
          <span>Real-time Repayment Estimate</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Estimated Interest (10%):</span>
          <span className="font-semibold">{formatCurrency(estimatedInterest)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total Repayable:</span>
          <span className="font-bold text-slate-900">{formatCurrency(totalRepayable)}</span>
        </div>
        <div className="flex justify-between pt-1 border-t border-blue-100 text-emerald-700 font-semibold">
          <span>Estimated Monthly:</span>
          <span>{formatCurrency(monthlyInstallment)} / mo</span>
        </div>
      </div>

      <div>
        <Label htmlFor="loan_reason">Stated Purpose / Reason</Label>
        <Textarea
          id="loan_reason"
          name="loan_reason"
          placeholder="State why you are requesting this loan (e.g. business restocking, school fees)..."
          required
          className="mt-1"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        variant="success"
        className="w-full h-11 text-sm font-semibold"
      >
        <Send className="h-4 w-4 mr-1.5" />
        {isPending ? "Submitting Application..." : "Submit Loan Application"}
      </Button>
    </form>
  );
}
