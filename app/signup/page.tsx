'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, User, Lock, Loader2, ArrowRight } from 'lucide-react';
import { FormState } from '@/lib/definitions';

export default function SignupPage() {
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
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        router.push(`/verify-otp?email=${encodeURIComponent(data.email as string)}`);
      } else if (result.activeOtp) {
        setState(result);
        setTimeout(() => {
          router.push(`/verify-otp?email=${encodeURIComponent(data.email as string)}&active=true`);
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
              Create an account
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Get started with To-Do App today
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {state?.message && (
              <div
                className={`rounded-lg border p-3 text-sm ${state.success || state.activeOtp
                    ? 'border-indigo-200 bg-indigo-50 text-indigo-750'
                    : 'border-red-200 bg-red-50 text-red-700'
                  }`}
              >
                {state.message}
              </div>
            )}

            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4.5 w-4.5 text-zinc-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="John Doe"
                  className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pl-10 pr-4 text-sm text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
                />
              </div>
              {state?.errors?.name && (
                <p className="mt-1 text-xs text-red-650">{state.errors.name[0]}</p>
              )}
            </div>

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

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5">
                Password
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
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg hover:from-violet-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 transition-all cursor-pointer"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Login link */}
          <div className="mt-6 text-center text-sm text-zinc-550">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-750 hover:underline transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
