import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    if (!data || data.status !== "SUCCESSFUL") {
      return NextResponse.json(
        { status: "failed or invalid transaction" },
        { status: 400 }
      );
    }

    const userId = parseInt(data.user_id, 10);
    const amount = parseFloat(data.amount);
    const transactionType = (data.type as string)?.toLowerCase();

    if (isNaN(userId) || isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { status: "invalid payload parameters" },
        { status: 400 }
      );
    }

    if (transactionType === "savings") {
      await prisma.contribution.create({
        data: {
          userId,
          amountPaid: amount,
          paymentType: "Savings",
          paymentDate: new Date(),
        },
      });
      return NextResponse.json({ status: "received", transaction: "savings" });
    }

    if (transactionType === "loan_repayment") {
      const activeLoan = await prisma.loan.findFirst({
        where: {
          userId,
          status: "Active",
        },
      });

      if (activeLoan) {
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
            userId,
            amountPaid: amount,
            paymentType: "Loan Repayment",
            paymentDate: new Date(),
          },
        });
      }

      return NextResponse.json({ status: "received", transaction: "loan_repayment" });
    }

    return NextResponse.json(
      { status: "unrecognized transaction type" },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { status: "server error", message: error.message },
      { status: 500 }
    );
  }
}
