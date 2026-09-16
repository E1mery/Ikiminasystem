"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export async function makePaymentAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "Member") {
    return { success: false, message: "Unauthorized." };
  }

  const amount = parseFloat(formData.get("amount") as string);
  const paymentType = formData.get("payment_type") as string;
  const phoneNumber = (formData.get("phone_number") as string)?.trim();

  const isMtn = /^078[0-9]{7}$/.test(phoneNumber) || /^079[0-9]{7}$/.test(phoneNumber);
  if (!isMtn) {
    return {
      success: false,
      message: "Please enter a valid Rwandan MTN phone number (starts with 078 or 079).",
    };
  }

  if (isNaN(amount) || amount < 1000) {
    return { success: false, message: "Minimum payment amount is 1,000 RWF." };
  }

  if (paymentType === "Savings") {
    await prisma.contribution.create({
      data: {
        userId: session.userId,
        amountPaid: amount,
        paymentType: "Savings",
        paymentDate: new Date(),
      },
    });

    revalidatePath("/member");
    revalidatePath("/member/contributions");
    return {
      success: true,
      message: `MTN MoMo prompt sent to ${phoneNumber}. Successfully deposited ${amount.toLocaleString()} RWF into savings!`,
    };
  }

  if (paymentType === "Loan Repayment") {
    const activeLoan = await prisma.loan.findFirst({
      where: {
        userId: session.userId,
        status: "Active",
      },
    });

    if (!activeLoan) {
      return {
        success: false,
        message: "You do not have any active loans to repay.",
      };
    }

    const newBalance = Math.max(0, activeLoan.principalAmount - amount);
    const newStatus = newBalance <= 0 ? "Paid" : "Active";

    await prisma.loan.update({
      where: { id: activeLoan.id },
      data: {
        principalAmount: newBalance,
        status: newStatus,
      },
    });

    await prisma.contribution.create({
      data: {
        userId: session.userId,
        amountPaid: amount,
        paymentType: "Loan Repayment",
        paymentDate: new Date(),
      },
    });

    revalidatePath("/member");
    revalidatePath("/member/contributions");
    revalidatePath("/member/loans");

    return {
      success: true,
      message: `MTN MoMo prompt sent to ${phoneNumber}. Repayment accepted! Remaining active loan balance: ${newBalance.toLocaleString()} RWF.`,
    };
  }

  return { success: false, message: "Invalid payment type." };
}

export async function requestLoanAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "Member") {
    return { success: false, message: "Unauthorized." };
  }

  const idNumber = (formData.get("id_number") as string)?.trim();
  const principalAmount = parseFloat(formData.get("principal_amount") as string);
  const durationMonths = parseInt(formData.get("duration_months") as string, 10);
  const loanReason = (formData.get("loan_reason") as string)?.trim();

  if (!idNumber || isNaN(principalAmount) || principalAmount <= 0 || isNaN(durationMonths) || durationMonths <= 0 || !loanReason) {
    return { success: false, message: "Please fill in all loan application fields accurately." };
  }

  const existingLoan = await prisma.loan.findFirst({
    where: {
      userId: session.userId,
      status: { in: ["Pending", "Active"] },
    },
  });

  if (existingLoan) {
    return {
      success: false,
      message: "You already have a pending or active loan. Please settle it first before requesting another.",
    };
  }

  const defaultInterestRate = 10.0;
  const totalRepayable = principalAmount + principalAmount * (defaultInterestRate / 100);

  await prisma.loan.create({
    data: {
      userId: session.userId,
      principalAmount,
      interestRate: defaultInterestRate,
      totalRepayable,
      durationMonths,
      loanReason,
      idNumber,
      status: "Pending",
      acceptanceStatus: "Pending Acceptance",
      dateRequested: new Date(),
    },
  });

  revalidatePath("/member");
  revalidatePath("/member/loans");
  revalidatePath("/admin");
  revalidatePath("/admin/loans");

  return {
    success: true,
    message: "Loan application submitted successfully! It is now under admin review.",
  };
}

export async function acceptLoanTermsAction(loanId: number): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "Member") {
    return { success: false, message: "Unauthorized." };
  }

  const loan = await prisma.loan.findFirst({
    where: {
      id: loanId,
      userId: session.userId,
      status: "Pending",
    },
  });

  if (!loan) {
    return { success: false, message: "Loan record not found or not eligible for acceptance." };
  }

  await prisma.loan.update({
    where: { id: loanId },
    data: { acceptanceStatus: "Accepted" },
  });

  revalidatePath("/member/loans");
  revalidatePath("/admin/loans");

  return {
    success: true,
    message: "You have accepted the loan terms. Waiting for final admin disbursement.",
  };
}
