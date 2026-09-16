"use client";

import { Menu, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { logoutAction } from "@/app/actions/auth";

interface TopbarProps {
  title: string;
  userName: string;
  role: "Admin" | "Member";
  onMenuToggle?: () => void;
}

export function Topbar({ title, userName, role, onMenuToggle }: TopbarProps) {
  const initial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8 shadow-xs">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 md:hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
        )}
        <h1 className="text-lg md:text-xl font-bold tracking-tight text-slate-900">{title}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Badge variant={role === "Admin" ? "admin" : "member"}>
          {role}
        </Badge>

        <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-sm shadow-sm">
            {initial}
          </div>
          <span className="hidden sm:inline-block text-sm font-semibold text-slate-800">
            {userName}
          </span>
          <form action={logoutAction}>
            <button
              type="submit"
              className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
