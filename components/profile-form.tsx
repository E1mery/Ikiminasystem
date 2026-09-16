"use client";

import * as React from "react";
import { useActionState } from "react";
import { User, Phone, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { updateProfileAction, updatePasswordAction, ActionResult } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { formatDate } from "@/lib/utils";

interface ProfileFormProps {
  user: {
    name: string;
    phoneNumber: string;
    email: string;
    role: string;
    dateRegistered: Date | string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [profileState, profileAction, isProfilePending] = useActionState<ActionResult, FormData>(
    updateProfileAction,
    { success: false }
  );

  const [passwordState, passwordAction, isPasswordPending] = useActionState<ActionResult, FormData>(
    updatePasswordAction,
    { success: false }
  );

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 items-start">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-1 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-800">Email:</span> {user.email}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Account Role:</span> {user.role}
            </div>
            <div>
              <span className="font-semibold text-slate-800">Member Since:</span> {formatDate(user.dateRegistered)}
            </div>
          </div>

          {profileState.message && (
            <Alert variant={profileState.success ? "success" : "destructive"}>
              {profileState.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{profileState.message}</AlertDescription>
            </Alert>
          )}

          <form action={profileAction} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <div className="relative mt-1">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  defaultValue={user.name}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <div className="relative mt-1">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  defaultValue={user.phoneNumber}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isProfilePending}
              className="w-full h-10 text-sm font-semibold mt-2"
            >
              {isProfilePending ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security & Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Security & Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {passwordState.message && (
            <Alert variant={passwordState.success ? "success" : "destructive"}>
              {passwordState.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{passwordState.message}</AlertDescription>
            </Alert>
          )}

          <form action={passwordAction} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="newPassword">New Password (min 6 characters)</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
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
              disabled={isPasswordPending}
              variant="secondary"
              className="w-full h-10 text-sm font-semibold mt-2"
            >
              {isPasswordPending ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
