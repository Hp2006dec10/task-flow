'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, Loader2, ArrowLeft, RefreshCw, CheckCircle2 } from 'lucide-react';
import { FormState } from '@/lib/definitions';

function VerifyOtpForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const [state, setState] = useState<FormState>(undefined);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const [resendStatus, setResendStatus] = useState<{ message?: string; error?: boolean }>({});
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (pending) return;

    setPending(true);
    setState(undefined);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        router.push('/dashboard');
      } else {
        setState(result);
      }
    } catch (error) {
      setState({ message: 'Something went wrong. Please try again.' });
    } finally {
      setPending(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;
    setResending(true);
    setResendStatus({});

    try {
      const res = await fetch('/api/auth/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setResendStatus({ message: result.message || 'New OTP sent!' });
        setCountdown(60); // 60 seconds cooldown
      } else {
        setResendStatus({ message: result.message || 'Failed to resend OTP.', error: true });
      }
    } catch (err) {
      setResendStatus({ message: 'An unexpected error occurred.', error: true });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="relative overflow-hidden rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl">
        {/* Back Link */}
        <Link href="/signup" className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors mb-6">
          <ArrowLeft className="h-3 w-3" />
          Back to Sign Up
        </Link>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Verify Email
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            {searchParams.get('active') === 'true'
              ? 'An active verification code is already in your inbox for'
              : 'We sent a verification code to'}
          </p>
          <p className="font-semibold text-indigo-600 text-sm mt-0.5 truncate">{email}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Hidden Input */}
          <input type="hidden" name="email" value={email} />

          {/* Validation Alert */}
          {state?.message && !state.success && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {state.message}
            </div>
          )}

          {/* Resend Status Alert */}
          {resendStatus.message && (
            <div
              className={`rounded-lg border p-3 text-sm flex items-start gap-2 ${
                resendStatus.error
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-700'
              }`}
            >
              {!resendStatus.error && <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />}
              <span>{resendStatus.message}</span>
            </div>
          )}

          {/* OTP Input */}
          <div>
            <label htmlFor="otp" className="block text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-1.5 text-center">
              One-Time Password (6-Digit OTP)
            </label>
            <div className="relative">
              <input
                id="otp"
                name="otp"
                type="text"
                required
                maxLength={6}
                placeholder="000000"
                pattern="\d{6}"
                className="block w-full rounded-lg border border-zinc-200 bg-zinc-50 py-3 text-center text-2xl font-bold tracking-widest text-zinc-900 placeholder-zinc-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
            {state?.errors?.otp && (
              <p className="mt-1 text-xs text-red-650 text-center">{state.errors.otp[0]}</p>
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
                Verifying OTP...
              </>
            ) : (
              'Verify Account'
            )}
          </button>
        </form>

        {/* Resend Action */}
        <div className="mt-8 text-center text-sm text-zinc-550">
          Didn't receive the code?{' '}
          <button
            onClick={handleResend}
            disabled={countdown > 0 || resending}
            className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-750 focus:outline-none disabled:opacity-55 disabled:hover:text-indigo-600 transition-colors cursor-pointer"
          >
            {resending ? (
              <>
                <RefreshCw className="h-3 w-3 animate-spin" />
                Resending...
              </>
            ) : countdown > 0 ? (
              `Resend OTP (${countdown}s)`
            ) : (
              'Resend Code'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-zinc-50 px-4 py-12 text-zinc-900 antialiased">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-violet-600/[0.04] blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-indigo-600/[0.04] blur-[100px] pointer-events-none" />

      <Suspense fallback={
        <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-xl flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-4" />
          <p className="text-zinc-500 text-sm">Loading verification details...</p>
        </div>
      }>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}
