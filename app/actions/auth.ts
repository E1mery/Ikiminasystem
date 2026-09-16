"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  destroySession,
  getSession,
} from "@/lib/auth";

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

const ALLOWED_DOMAIN = process.env.ALLOWED_COMPANY_DOMAIN || "@xxxxx.com";

export async function loginAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
  const password = formData.get("password") as string;
  const isAdmin = formData.get("is_admin") === "yes";

  if (!phoneNumber || !password) {
    return { success: false, message: "Please enter both phone number and password." };
  }

  const user = await prisma.user.findUnique({
    where: { phoneNumber },
  });

  if (!user) {
    return { success: false, message: "No account found with that phone number." };
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    return { success: false, message: "Invalid password." };
  }

  if (isAdmin && user.role !== "Admin") {
    return {
      success: false,
      message: "Access Denied: You do not have administrator privileges.",
    };
  }

  await createSession({
    userId: user.id,
    name: user.name,
    role: user.role as "Admin" | "Member",
  });

  if (isAdmin && user.role === "Admin") {
    redirect("/admin");
  } else {
    redirect("/member");
  }
}

export async function registerAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();
  const idNumber = (formData.get("idNumber") as string)?.trim();
  const password = formData.get("password") as string;

  if (!name || !email || !phoneNumber || !idNumber || !password) {
    return { success: false, message: "Please fill in all required fields." };
  }

  // 1. Validate email domain if configured
  if (ALLOWED_DOMAIN && !email.endsWith(ALLOWED_DOMAIN.toLowerCase())) {
    return {
      success: false,
      message: `Registration restricted. You must use an email ending in ${ALLOWED_DOMAIN}`,
    };
  }

  // 2. Validate MTN Rwanda phone number format
  const isMtn = /^078[0-9]{7}$/.test(phoneNumber) || /^079[0-9]{7}$/.test(phoneNumber);
  if (!isMtn) {
    return {
      success: false,
      message: "Phone number must be a valid Rwandan MTN number (starts with 078 or 079, 10 digits).",
    };
  }

  if (password.length < 6) {
    return {
      success: false,
      message: "Password must be at least 6 characters long.",
    };
  }

  try {
    // 3. Check for existing phone, email, or National ID
    const existing = await prisma.user.findFirst({
      where: {
        OR: [{ phoneNumber }, { email }, { idNumber }],
      },
    });

    if (existing) {
      if (existing.phoneNumber === phoneNumber) {
        return { success: false, message: "An account with this phone number already exists." };
      }
      if (existing.email === email) {
        return { success: false, message: "An account with this email address already exists." };
      }
      if (existing.idNumber === idNumber) {
        return { success: false, message: "An account with this National ID already exists." };
      }
      return { success: false, message: "An account with these credentials already exists." };
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        idNumber,
        passwordHash: hashedPassword,
        role: "Member",
      },
    });

    // Automatically enroll new member in group rotation
    const memberCount = await prisma.groupMember.count();
    await prisma.groupMember.create({
      data: {
        userId: user.id,
        payoutTurn: memberCount + 1,
        hasReceived: false,
      },
    });

    await createSession({
      userId: user.id,
      name: user.name,
      role: "Member",
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, message: "Database error during account creation. Please try again." };
  }

  redirect("/member?welcome=true");
}

// Backward compatibility aliases if needed
export const registerStep1Action = registerAction;
export const registerStep2Action = registerAction;

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function updateProfileAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Unauthorized." };

  const name = (formData.get("name") as string)?.trim();
  const phoneNumber = (formData.get("phoneNumber") as string)?.trim();

  if (!name || !phoneNumber) {
    return { success: false, message: "Name and phone number cannot be empty." };
  }

  // Check phone conflict
  const existing = await prisma.user.findFirst({
    where: {
      phoneNumber,
      NOT: { id: session.userId },
    },
  });

  if (existing) {
    return { success: false, message: "This phone number is already used by another account." };
  }

  await prisma.user.update({
    where: { id: session.userId },
    data: { name, phoneNumber },
  });

  // Refresh session
  await createSession({
    userId: session.userId,
    name,
    role: session.role,
  });

  return { success: true, message: "Profile details successfully updated." };
}

export async function updatePasswordAction(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { success: false, message: "Unauthorized." };

  const currentPassword = formData.get("currentPassword") as string;
  const newPassword = formData.get("newPassword") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { success: false, message: "All password fields are required." };
  }

  if (newPassword.length < 6) {
    return { success: false, message: "New password must be at least 6 characters long." };
  }

  if (newPassword !== confirmPassword) {
    return { success: false, message: "New passwords do not match." };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });

  if (!user) return { success: false, message: "User not found." };

  const isCurrentValid = await verifyPassword(currentPassword, user.passwordHash);
  if (!isCurrentValid) {
    return { success: false, message: "Incorrect current password entered." };
  }

  const newHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: newHash },
  });

  return { success: true, message: "Password successfully changed." };
}
