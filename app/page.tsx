import Link from 'next/link';
import { getSessionUser } from '@/lib/dal';
import { redirect } from 'next/navigation';
import { CheckSquare, ArrowRight, ShieldCheck, Mail, Database } from 'lucide-react';

export default async function HomePage() {
  // If user has a valid active session, redirect them directly to the dashboard
  const user = await getSessionUser();
  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col bg-zinc-50 text-zinc-900 antialiased overflow-hidden">
      {/* Background glow animations */}
      <div className="absolute top-0 right-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-indigo-600/[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-10 h-[500px] w-[500px] rounded-full bg-violet-600/[0.04] blur-[120px] pointer-events-none" />

      {/* Navigation header */}
      <header className="border-b border-zinc-200/80 backdrop-blur-md bg-white/80 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-650/20">
              <CheckSquare className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-zinc-950 to-zinc-800 bg-clip-text text-transparent">
              TaskFlow
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-md hover:shadow-indigo-600/10 cursor-pointer"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <main className="flex-1 flex flex-col justify-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="mb-6 inline-flex self-center items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 bg-indigo-50 text-xs font-semibold text-indigo-700 backdrop-blur-sm">
          <span>Version 1.0 Available Now</span>
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping" />
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 mb-6 leading-tight">
          Supercharge your productivity with{' '}
          <span className="bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-700 bg-clip-text text-transparent block mt-2">
            TaskFlow
          </span>
        </h1>

        <p className="text-lg text-zinc-650 max-w-2xl mx-auto mb-10 leading-relaxed">
          A seamless, tab-based todo list application secured with OTP-verified email authentication and backed by a robust PostgreSQL database.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
          <Link
            href="/signup"
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-3.5 text-base font-bold text-white hover:from-violet-500 hover:to-indigo-500 transition-all shadow-lg hover:shadow-indigo-600/20 cursor-pointer w-full sm:w-auto justify-center"
          >
            Create Free Account
            <ArrowRight className="h-5 w-5" />
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 px-6 py-3.5 text-base font-bold text-zinc-700 hover:text-zinc-900 transition-colors cursor-pointer w-full sm:w-auto justify-center shadow-sm"
          >
            Sign In
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="rounded-xl border border-zinc-200 bg-white/70 p-6 backdrop-blur-sm shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">Secure Authentication</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Password hashing using bcrypt combined with JWT-based cookies and state checks.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white/70 p-6 backdrop-blur-sm shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-violet-50 border border-violet-100 flex items-center justify-center text-violet-600 mb-4">
              <Mail className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">OTP Verification</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              Email OTP confirmations via Nodemailer for account creation and password resets.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white/70 p-6 backdrop-blur-sm shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-4">
              <Database className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 mb-2">Relational Storage</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              PostgreSQL storage mapped with Prisma ORM for quick and secure queries.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
        &copy; {new Date().getFullYear()} TaskFlow. All rights reserved.
      </footer>
    </div>
  );
}
