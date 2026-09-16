"use client";

import * as React from "react";
import { useActionState } from "react";
import { AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { issuePenaltyAction, ActionResult } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MemberOption {
  id: number;
  name: string;
  phoneNumber: string;
}

export function PenaltyFormClient({ members }: { members: MemberOption[] }) {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    async (prev, formData) => {
      const res = await issuePenaltyAction(prev, formData);
      if (res.success && formRef.current) {
        formRef.current.reset();
      }
      return res;
    },
    { success: false }
  );

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      {state.message && (
        <Alert variant={state.success ? "success" : "destructive"}>
          {state.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <Label htmlFor="user_id">Select Member</Label>
          <select
            id="user_id"
            name="user_id"
            required
            defaultValue=""
            className="mt-1 flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:border-blue-600 focus-visible:ring-2 focus-visible:ring-blue-100"
          >
            <option value="" disabled>
              Choose member...
            </option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.phoneNumber})
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="penalty_amount">Fine Amount (RWF)</Label>
          <Input
            id="penalty_amount"
            name="penalty_amount"
            type="number"
            min={500}
            step={500}
            placeholder="5,000"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="penalty_reason">Reason / Infraction</Label>
          <Input
            id="penalty_reason"
            name="penalty_reason"
            type="text"
            placeholder="e.g., Late monthly savings contribution"
            required
            className="mt-1"
          />
        </div>

        <div>
          <Button
            type="submit"
            disabled={isPending}
            variant="destructive"
            className="w-full h-10 text-sm font-semibold"
          >
            <AlertTriangle className="h-4 w-4 mr-1.5" />
            {isPending ? "Recording..." : "Issue Fine"}
          </Button>
        </div>
      </div>
    </form>
  );
}
