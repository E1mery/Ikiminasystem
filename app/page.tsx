import Link from "next/link";
import {
  Wallet,
  ArrowRight,
  RotateCcw,
  HandCoins,
  ShieldCheck,
  TrendingUp,
  Users,
  Building2,
} from "lucide-react";
import prisma from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real-time public stats for the landing page
  const [totalMembers, contributionsSum, loansSum] = await Promise.all([
    prisma.user.count({ where: { role: "Member" } }),
    prisma.contribution.aggregate({ _sum: { amountPaid: true } }),
    prisma.loan.aggregate({
      where: { status: "Active" },
      _sum: { principalAmount: true },
    }),
  ]);

  const totalSaved = contributionsSum._sum.amountPaid || 0;
  const activeLoans = loansSum._sum.principalAmount || 0;

  return (
    <div className="flex min-h-screen flex-col bg-slate-900 text-slate-100">
      {/* Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/30">
              <Wallet className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider text-white">IKIMINA</span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2"
            >
              Member Login
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-600/25 hover:bg-blue-500 transition-all hover:-translate-y-0.5"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          {/* Subtle gradient background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

          <div className="relative mx-auto max-w-5xl px-6 text-center lg:px-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 mb-8">
              <Building2 className="h-3.5 w-3.5" />
              <span>Next-Generation Community SACCO & Rotating Savings</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-white">
              Modernize Your <span className="text-blue-500">Community Savings</span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              A transparent, secure, and automated system to manage your group&apos;s contributions,
              rotations, and internal loans directly with MTN Mobile Money.
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-blue-600/30 hover:bg-blue-500 transition-all hover:-translate-y-0.5"
              >
                <span>Create an Account</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-7 py-3.5 text-base font-semibold text-slate-200 hover:bg-slate-700 hover:text-white transition-all"
              >
                Access Dashboard
              </Link>
            </div>

            {/* Platform Live Stats Bar */}
            <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3 border border-slate-800 rounded-2xl bg-slate-800/50 p-6 backdrop-blur-xs">
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                  <span>Total Capital Saved</span>
                </div>
                <span className="text-2xl font-bold text-white">{formatCurrency(totalSaved)}</span>
              </div>
              <div className="flex flex-col items-center sm:border-x sm:border-slate-700/80">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <HandCoins className="h-4 w-4 text-blue-400" />
                  <span>Active Loans Distributed</span>
                </div>
                <span className="text-2xl font-bold text-white">{formatCurrency(activeLoans)}</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                  <Users className="h-4 w-4 text-sky-400" />
                  <span>Verified Members</span>
                </div>
                <span className="text-2xl font-bold text-white">{totalMembers} Members</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-slate-800 bg-slate-900/50 py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Engineered for Complete Financial Transparency
              </h2>
              <p className="mt-4 text-slate-400 max-w-xl mx-auto">
                No more lost paper notebooks or manual tally errors. Everything is verified, tracked, and accessible 24/7.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {/* Feature 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-8 transition-all hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 mb-6">
                  <RotateCcw className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Transparent Rotations</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Know exactly when your scheduled payout is due and track everyone&apos;s contributions in real time with automated queue turns.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-8 transition-all hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 mb-6">
                  <HandCoins className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Integrated Loans</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Borrow from the collective pool, simulate monthly repayment installments with transparent interest rates, and repay seamlessly.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-8 transition-all hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400 mb-6">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Secure Records</h3>
                <p className="text-sm leading-relaxed text-slate-400">
                  Official printable loan contracts, phone OTP verification, and strict administrative auditing guarantee complete accountability.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 text-center text-sm text-slate-500">
        <p>&copy; 2026 Ikimina System &bull; Rwanda Community Savings Network. All rights reserved.</p>
      </footer>
    </div>
  );
}
