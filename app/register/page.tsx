"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { ShieldCheck, User, Mail, Phone, IdCard, Lock, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { registerAction, ActionResult } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(
    registerAction,
    { success: false, message: "" }
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs font-semibold">
          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
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
            Account Registration
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Join your community savings association securely
          </p>
        </div>

        {state.message && (
          <Alert variant={state.success ? "success" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="space-y-4">
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
            <Label htmlFor="email">Email Address</Label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@gmail.com"
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
                placeholder="1199980000000123"
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
            disabled={isPending}
            className="w-full h-11 text-base font-semibold mt-6"
          >
            {isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>
      </div>
    </div>
  );
}
