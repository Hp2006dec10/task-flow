'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { FormState } from '@/lib/definitions';

export default function ForgotPasswordPage() {
  const [state, setState] = useState<FormState>(undefined);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setState(undefined);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        setState(result);
        setTimeout(() => {
          router.push(`/reset-password?email=${encodeURIComponent(data.email as string)}${result.activeOtp ? '&active=true' : ''}`);
        }, 3000);
      } else {
        setState(result);
      }
    } catch (error) {
      setState({ message: 'Something went wrong. Please try again.' });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-12 text-zinc-900 antialiased">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-violet-600/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-600/[0.04] blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
          {/* Back Link */}
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors mb-6">
            <ArrowLeft className="h-3 w-3" />
            Back to Sign In
          </Link>

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Forgot Password
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Enter your email to request a reset code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {state?.message && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  state.success || state.activeOtp
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-750'
                    : 'border-red-200 bg-red-50 text-red-700'
                }`}
              >
                {state.message}
              </div>
            )}

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4.5 w-4.5 text-zinc-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
              {state?.errors?.email && (
                <p className="mt-1 text-xs text-red-650">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-violet-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 transition-all cursor-pointer"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                <>
                  Send Reset OTP
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
