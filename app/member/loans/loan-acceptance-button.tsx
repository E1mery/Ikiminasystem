"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { acceptLoanTermsAction } from "@/app/actions/member";
import { Button } from "@/components/ui/button";

export function LoanAcceptanceButton({ loanId }: { loanId: number }) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      size="sm"
      variant="warning"
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          await acceptLoanTermsAction(loanId);
        });
      }}
      className="text-xs h-7 px-2.5"
    >
      <Check className="h-3.5 w-3.5" />
      {isPending ? "Accepting..." : "Accept Terms"}
    </Button>
  );
}
