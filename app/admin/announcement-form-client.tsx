"use client";

import * as React from "react";
import { useActionState } from "react";
import { Megaphone, CheckCircle2, AlertCircle } from "lucide-react";
import { postAnnouncementAction, ActionResult } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AnnouncementFormClient() {
  const formRef = React.useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    async (prev, formData) => {
      const res = await postAnnouncementAction(prev, formData);
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

      <div>
        <Label htmlFor="announcement_text">Message to All Members</Label>
        <Textarea
          id="announcement_text"
          name="announcement_text"
          placeholder="Type an announcement or update for all group members..."
          required
          className="mt-1"
        />
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-10 text-sm font-semibold"
      >
        <Megaphone className="h-4 w-4 mr-1.5" />
        {isPending ? "Broadcasting..." : "Send Broadcast"}
      </Button>
    </form>
  );
}
