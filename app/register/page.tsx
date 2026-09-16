"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { ShieldCheck, User, Mail, Phone, IdCard, Lock, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, KeyRound } from "lucide-react";
import { registerStep1Action, registerStep2Action, ActionResult } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function RegisterPage() {
  const [step1State, step1Action, isStep1Pending] = useActionState<ActionResult, FormData>(
    registerStep1Action,
    { success: false }
  );

  const [step2State, step2Action, isStep2Pending] = useActionState<ActionResult, FormData>(
    registerStep2Action,
    { success: false }
  );

  const isStep2 = step1State.success && step1State.data;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs font-semibold">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </Link>
          <Link href="/login" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-700">
            <span>Already registered? Log In</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <ShieldCheck className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
            {isStep2 ? "Phone SMS Verification" : "Secure Account Registration"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {isStep2
              ? "Enter the 6-digit verification code sent to your phone"
              : "Join your community savings association securely"}
          </p>
        </div>

        {/* Step 1 Error/Success Alert */}
        {!isStep2 && step1State.message && (
          <Alert variant={step1State.success ? "success" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{step1State.message}</AlertDescription>
          </Alert>
        )}

        {/* Step 2 Error/Success Alert */}
        {isStep2 && step2State.message && (
          <Alert variant={step2State.success ? "success" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{step2State.message}</AlertDescription>
          </Alert>
        )}

        {/* Step 2 Simulated OTP Notice */}
        {isStep2 && step1State.message && (
          <Alert variant="info" className="bg-sky-50 border-sky-200">
            <CheckCircle2 className="h-4 w-4 text-sky-600" />
            <AlertTitle className="text-sky-900 font-semibold text-xs">Simulated SMS Service</AlertTitle>
            <AlertDescription className="text-sky-800 text-xs mt-0.5">
              {step1State.message}
            </AlertDescription>
          </Alert>
        )}

        {!isStep2 ? (
          /* STEP 1: Personal Details Form */
          <form action={step1Action} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="e.g., Jean Dupont Uwase"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Professional Email (must end in @xxxxx.com)</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@xxxxx.com"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number (MTN Rwanda: 078 / 079)</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  placeholder="078XXXXXXX"
                  maxLength={10}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="idNumber">National ID Number (16 digits)</Label>
              <div className="relative mt-1">
                <IdCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="idNumber"
                  name="idNumber"
                  type="text"
                  placeholder="1 1999 8 0000000 1 23"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password (min 6 characters)</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isStep1Pending}
              className="w-full h-11 text-base font-semibold mt-6"
            >
              {isStep1Pending ? "Validating..." : "Proceed to SMS Verification"}
            </Button>
          </form>
        ) : (
          /* STEP 2: OTP Code Verification Form */
          <form action={step2Action} className="space-y-6">
            <input type="hidden" name="name" value={step1State.data.name} />
            <input type="hidden" name="email" value={step1State.data.email} />
            <input type="hidden" name="phoneNumber" value={step1State.data.phoneNumber} />
            <input type="hidden" name="idNumber" value={step1State.data.idNumber} />
            <input type="hidden" name="passwordHash" value={step1State.data.passwordHash} />
            <input type="hidden" name="expectedOtp" value={step1State.data.otp} />

            <div>
              <Label htmlFor="otpCode" className="text-center block text-sm font-medium text-slate-700">
                Enter 6-Digit SMS Code Sent to {step1State.data.phoneNumber}
              </Label>
              <div className="relative mt-3">
                <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="otpCode"
                  name="otpCode"
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  required
                  className="pl-10 text-center tracking-[0.5em] text-xl font-bold font-mono h-12"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isStep2Pending}
              variant="success"
              className="w-full h-11 text-base font-semibold"
            >
              {isStep2Pending ? "Verifying..." : "Verify & Complete Registration"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
