'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { FormState } from '@/lib/definitions';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [state, setState] = useState<FormState>(undefined);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state?.success) {
      const timer = setTimeout(() => {
        router.push('/login');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setState(undefined);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      setState(result);
    } catch (error) {
      setState({ message: 'Something went wrong. Please try again.' });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
        {/* Back Link */}
        <Link href="/forgot-password" className="inline-flex items-center gap-1.5 text-xs text-zinc-550 hover:text-zinc-800 transition-colors mb-6">
          <ArrowLeft className="h-3 w-3" />
          Back to Forgot Password
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Reset Password
          </h1>
          <p className="mt-2 text-sm text-zinc-550">
            {searchParams.get('active') === 'true'
              ? 'An active password reset code is already in your inbox for'
              : 'Verify OTP code and create new password for'}
          </p>
          <p className="font-semibold text-indigo-600 text-sm mt-0.5 truncate">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Hidden Input */}
          <input type="hidden" name="email" value={email} />

          {/* Success Message Alert */}
          {state?.success && state.message && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              {state.message} Redirecting to login...
            </div>
          )}

          {/* Error Message Alert */}
          {state?.message && !state.success && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {state.message}
            </div>
          )}

          {/* OTP Input */}
          <div>
            <label htmlFor="otp" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              Reset OTP Code
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <KeyRound className="h-4.5 w-4.5 text-zinc-400" />
              </div>
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors tracking-widest font-semibold"
              />
            </div>
            {state?.errors?.otp && (
              <p className="mt-1 text-xs text-red-650">{state.errors.otp[0]}</p>
            )}
          </div>

          {/* New Password Input */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4.5 w-4.5 text-zinc-400" />
              </div>
              <input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            {state?.errors?.password && (
              <div className="mt-1.5 text-xs text-red-655 space-y-1">
                {state.errors.password.map((error, index) => (
                  <p key={index}>• {error}</p>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={pending || state?.success}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              'Reset Password'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-12 text-zinc-900 antialiased">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-violet-600/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-600/[0.04] blur-[100px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-zinc-550 text-sm">Loading reset form...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
