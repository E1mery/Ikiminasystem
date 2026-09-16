import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean existing records in reverse dependency order
  await prisma.groupMember.deleteMany();
  await prisma.penalty.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.contribution.deleteMany();
  await prisma.user.deleteMany();

  const adminPasswordHash = await bcrypt.hash("admin123", 10);
  const memberPasswordHash = await bcrypt.hash("member123", 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      name: "System Administrator",
      email: "admin@xxxxx.com",
      phoneNumber: "0780000000",
      idNumber: "1198580000000001",
      passwordHash: adminPasswordHash,
      role: "Admin",
    },
  });

  // 2. Create Members
  const jean = await prisma.user.create({
    data: {
      name: "Jean Dupont",
      email: "jean.dupont@xxxxx.com",
      phoneNumber: "0781234567",
      idNumber: "1199080012345678",
      passwordHash: memberPasswordHash,
      role: "Member",
    },
  });

  const marie = await prisma.user.create({
    data: {
      name: "Marie Claire Uwase",
      email: "marie.claire@xxxxx.com",
      phoneNumber: "0782345678",
      idNumber: "1199280023456789",
      passwordHash: memberPasswordHash,
      role: "Member",
    },
  });

  const eric = await prisma.user.create({
    data: {
      name: "Eric Mugisha",
      email: "eric.mugisha@xxxxx.com",
      phoneNumber: "0793456789",
      idNumber: "1199580034567890",
      passwordHash: memberPasswordHash,
      role: "Member",
    },
  });

  // 3. Create Group Member Rotations
  await prisma.groupMember.createMany({
    data: [
      { userId: jean.id, payoutTurn: 1, hasReceived: true },
      { userId: marie.id, payoutTurn: 2, hasReceived: false }, // Next payout recipient!
      { userId: eric.id, payoutTurn: 3, hasReceived: false },
    ],
  });

  // 4. Create Contributions (Savings)
  await prisma.contribution.createMany({
    data: [
      { userId: jean.id, amountPaid: 20000, paymentType: "Savings", paymentDate: new Date(Date.now() - 30 * 86400000) },
      { userId: jean.id, amountPaid: 20000, paymentType: "Savings", paymentDate: new Date(Date.now() - 5 * 86400000) },
      { userId: marie.id, amountPaid: 35000, paymentType: "Savings", paymentDate: new Date(Date.now() - 15 * 86400000) },
      { userId: eric.id, amountPaid: 15000, paymentType: "Savings", paymentDate: new Date(Date.now() - 10 * 86400000) },
      { userId: jean.id, amountPaid: 15000, paymentType: "Loan Repayment", paymentDate: new Date(Date.now() - 2 * 86400000) },
    ],
  });

  // 5. Create Loans
  // Jean has an active loan with balance 45,000 RWF
  await prisma.loan.create({
    data: {
      userId: jean.id,
      principalAmount: 45000,
      interestRate: 10.0,
      totalRepayable: 66000, // 60,000 original + 10% = 66,000, repaid 15,000 -> 45,000 principal balance
      durationMonths: 3,
      loanReason: "Emergency farming supplies investment",
      idNumber: jean.idNumber,
      status: "Active",
      acceptanceStatus: "Accepted",
      dateRequested: new Date(Date.now() - 20 * 86400000),
    },
  });

  // Marie has a pending loan awaiting review
  await prisma.loan.create({
    data: {
      userId: marie.id,
      principalAmount: 100000,
      interestRate: 10.0,
      totalRepayable: 110000,
      durationMonths: 6,
      loanReason: "Boutique shop stock replenishment",
      idNumber: marie.idNumber,
      status: "Pending",
      acceptanceStatus: "Pending Acceptance",
      dateRequested: new Date(Date.now() - 1 * 86400000),
    },
  });

  // 6. Create Announcements
  await prisma.announcement.createMany({
    data: [
      {
        adminId: admin.id,
        message: "Welcome to the modernized Ikimina digital platform! Monthly savings contributions are due by the 28th.",
        datePosted: new Date(Date.now() - 3 * 86400000),
      },
      {
        adminId: admin.id,
        message: "Scheduled maintenance for MTN Mobile Money API webhook gateway completed successfully.",
        datePosted: new Date(Date.now() - 1 * 86400000),
      },
    ],
  });

  // 7. Create Penalties
  await prisma.penalty.create({
    data: {
      userId: eric.id,
      adminId: admin.id,
      amount: 2500,
      reason: "Late monthly contribution deposit for previous cycle",
      dateIssued: new Date(Date.now() - 4 * 86400000),
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("Admin account: phone 0780000000 / password admin123");
  console.log("Member accounts: phone 0781234567, 0782345678, 0793456789 / password member123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
