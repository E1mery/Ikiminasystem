"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export async function postAnnouncementAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return { success: false, message: "Unauthorized." };
  }

  const message = (formData.get("announcement_text") as string)?.trim();
  if (!message) {
    return { success: false, message: "Announcement message cannot be empty." };
  }

  await prisma.announcement.create({
    data: {
      adminId: session.userId,
      message,
      datePosted: new Date(),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/member");

  return { success: true, message: "Announcement successfully broadcasted to all members." };
}

export async function setLoanTermsAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return { success: false, message: "Unauthorized." };
  }

  const loanId = parseInt(formData.get("loan_id") as string, 10);
  const interestRate = parseFloat(formData.get("interest_rate") as string);

  if (isNaN(loanId) || isNaN(interestRate) || interestRate < 0) {
    return { success: false, message: "Please provide a valid interest rate." };
  }

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
  });

  if (!loan) return { success: false, message: "Loan not found." };

  const totalRepayable = loan.principalAmount + loan.principalAmount * (interestRate / 100);

  await prisma.loan.update({
    where: { id: loanId },
    data: {
      interestRate,
      totalRepayable,
      acceptanceStatus: "Pending Acceptance",
    },
  });

  revalidatePath("/admin/loans");
  revalidatePath("/member/loans");

  return { success: true, message: "Loan terms updated successfully. Waiting for member acceptance." };
}

export async function approveLoanAction(loanId: number): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return { success: false, message: "Unauthorized." };
  }

  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
  });

  if (!loan) return { success: false, message: "Loan not found." };

  if (loan.acceptanceStatus !== "Accepted") {
    return {
      success: false,
      message: "Error: Loan cannot be approved until member accepts the interest terms.",
    };
  }

  await prisma.loan.update({
    where: { id: loanId },
    data: { status: "Active" },
  });

  revalidatePath("/admin/loans");
  revalidatePath("/admin");
  revalidatePath("/member/loans");
  revalidatePath("/member");

  return { success: true, message: "Loan successfully approved and activated for disbursement!" };
}

export async function deleteMemberAction(targetUserId: number): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return { success: false, message: "Unauthorized." };
  }

  if (targetUserId === session.userId) {
    return {
      success: false,
      message: "Action denied: You cannot delete your own administrator account.",
    };
  }

  try {
    await prisma.user.delete({
      where: { id: targetUserId },
    });

    revalidatePath("/admin/members");
    revalidatePath("/admin");

    return { success: true, message: "Member successfully removed from the platform." };
  } catch {
    return { success: false, message: "Database error while deleting member." };
  }
}

export async function issuePenaltyAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "Admin") {
    return { success: false, message: "Unauthorized." };
  }

  const userId = parseInt(formData.get("user_id") as string, 10);
  const amount = parseFloat(formData.get("penalty_amount") as string);
  const reason = (formData.get("penalty_reason") as string)?.trim();

  if (isNaN(userId) || isNaN(amount) || amount <= 0 || !reason) {
    return { success: false, message: "Please fill in all penalty fields properly." };
  }

  await prisma.penalty.create({
    data: {
      userId,
      adminId: session.userId,
      amount,
      reason,
      dateIssued: new Date(),
    },
  });

  revalidatePath("/admin/penalties");

  return { success: true, message: "Penalty successfully recorded." };
}
