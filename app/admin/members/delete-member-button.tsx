"use client";

import * as React from "react";
import { Trash2 } from "lucide-react";
import { deleteMemberAction } from "@/app/actions/admin";
import { Button } from "@/components/ui/button";

export function DeleteMemberButton({
  userId,
  userName,
}: {
  userId: number;
  userName: string;
}) {
  const [isPending, startTransition] = React.useTransition();

  return (
    <Button
      variant="destructive"
      size="sm"
      disabled={isPending}
      onClick={() => {
        if (confirm(`Are you sure you want to remove member "${userName}" from the platform?`)) {
          startTransition(async () => {
            await deleteMemberAction(userId);
          });
        }
      }}
      className="text-xs h-8 px-2.5"
    >
      <Trash2 className="h-3.5 w-3.5 mr-1" />
      {isPending ? "Removing..." : "Remove"}
    </Button>
  );
}
