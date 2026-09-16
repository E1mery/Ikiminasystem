"use client";

import * as React from "react";
import Link from "next/link";
import { useActionState } from "react";
import { Wallet, Phone, Lock, ArrowLeft, AlertCircle } from "lucide-react";
import { loginAction } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, {
    success: false,
    message: "",
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 shadow-md shadow-blue-600/30">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-slate-900">Welcome Back</h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your credentials to access your Ikimina account
          </p>
        </div>

        {state.message && (
          <Alert variant={state.success ? "success" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        <form action={formAction} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="phoneNumber" className="text-slate-700">Phone Number</Label>
              <div className="relative mt-1.5">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  placeholder="078XXXXXXX"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <input
                id="is_admin"
                name="is_admin"
                type="checkbox"
                value="yes"
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <Label htmlFor="is_admin" className="text-sm font-medium text-slate-600 cursor-pointer">
                Log in as Administrator
              </Label>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={isPending}
              className="w-full h-11 text-base font-semibold"
            >
              {isPending ? "Signing In..." : "Sign In"}
            </Button>
          </div>

          <div className="text-center text-sm text-slate-500 pt-2 space-y-2">
            <p>
              Don&apos;t have an account?{" "}
              <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700">
                Register Here
              </Link>
            </p>
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Home</span>
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
