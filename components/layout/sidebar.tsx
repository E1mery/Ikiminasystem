"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  LayoutDashboard,
  Users,
  FileSignature,
  AlertTriangle,
  User,
  CreditCard,
  HandCoins,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  role: "Admin" | "Member";
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/members", label: "Member Settings", icon: Users },
    { href: "/admin/loans", label: "Loan Approvals", icon: FileSignature },
    { href: "/admin/penalties", label: "Penalties & Fines", icon: AlertTriangle },
    { href: "/admin/profile", label: "Profile", icon: User },
  ];

  const memberLinks = [
    { href: "/member", label: "Dashboard", icon: LayoutDashboard },
    { href: "/member/contributions", label: "Payments & Loans", icon: CreditCard },
    { href: "/member/loans", label: "Request Loan", icon: HandCoins },
    { href: "/member/profile", label: "Profile", icon: User },
  ];

  const links = role === "Admin" ? adminLinks : memberLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-200 ease-in-out md:static md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-800 px-6">
          <Link href={role === "Admin" ? "/admin" : "/member"} className="flex items-center gap-3 font-bold text-lg tracking-wider text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-md">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span>IKIMINA</span>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1.5 overflow-y-auto px-3 py-6">
          {links.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all",
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Platform tag */}
        <div className="border-t border-slate-800/80 p-4 text-center text-xs text-slate-500">
          Ikimina Platform &bull; Rwanda &copy; 2026
        </div>
      </aside>
    </>
  );
}
