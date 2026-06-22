'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Loader2, ArrowRight } from 'lucide-react';
import { FormState } from '@/lib/definitions';

export default function LoginPage() {
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
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        router.push('/dashboard');
      } else if (result.unverified) {
        // Display unverified info state before redirecting
        setState(result);
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(data.email as string)}${result.activeOtp ? '&active=true' : ''}`);
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
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Sign in to manage your tasks
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {state?.message && (
              <div
                className={`rounded-lg border p-3 text-sm ${
                  state.success || state.activeOtp || state.errors?.otp
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
                <p className="mt-1 text-xs text-red-600">{state.errors.email[0]}</p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
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
                <p className="mt-1 text-xs text-red-650">{state.errors.password[0]}</p>
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
                  Signing In...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 text-center text-sm text-zinc-500">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-indigo-600 hover:text-indigo-750 hover:underline transition-colors"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
