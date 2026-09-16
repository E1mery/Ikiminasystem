"use client";

import * as React from "react";
import { useActionState } from "react";
import { Phone, Target, Smartphone, AlertCircle, CheckCircle2 } from "lucide-react";
import { makePaymentAction, ActionResult } from "@/app/actions/member";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatCurrency } from "@/lib/utils";

interface PaymentFormClientProps {
  defaultPhone: string;
  activeLoanBalance: number;
}

export function PaymentFormClient({
  defaultPhone,
  activeLoanBalance,
}: PaymentFormClientProps) {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    makePaymentAction,
    { success: false }
  );

  const [paymentType, setPaymentType] = React.useState<string>("Savings");

  return (
    <form action={formAction} className="space-y-5">
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

      {/* Transaction Purpose */}
      <div>
        <Label htmlFor="payment_type">Transaction Purpose</Label>
        <div className="relative mt-1">
          <Target className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <select
            id="payment_type"
            name="payment_type"
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-slate-300 bg-white pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100"
          >
            <option value="Savings">Savings Deposit</option>
            <option value="Loan Repayment">
              Loan Repayment (Active Debt: {formatCurrency(activeLoanBalance)})
            </option>
          </select>
        </div>
      </div>

      {/* MTN MoMo Phone Number */}
      <div>
        <Label htmlFor="phone_number">MTN MoMo Phone Number</Label>
        <div className="relative mt-1">
          <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            id="phone_number"
            name="phone_number"
            type="text"
            defaultValue={defaultPhone}
            placeholder="078XXXXXXX or 079XXXXXXX"
            maxLength={10}
            required
            className="pl-10"
          />
        </div>
      </div>

      {/* Amount (RWF) */}
      <div>
        <Label htmlFor="amount">Amount (RWF)</Label>
        <div className="relative mt-1">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
            RWF
          </span>
          <Input
            id="amount"
            name="amount"
            type="number"
            min={1000}
            step={500}
            placeholder="10,000"
            required
            className="pl-13"
          />
        </div>
        <p className="mt-1 text-[11px] text-slate-500">
          Minimum transaction is 1,000 RWF (increments of 500 RWF)
        </p>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        variant="success"
        className="w-full h-11 text-sm font-semibold"
      >
        <Smartphone className="h-4 w-4 mr-1" />
        {isPending ? "Dispatching USSD Prompt..." : "Send MTN MoMo Prompt (USSD)"}
      </Button>
    </form>
  );
}
