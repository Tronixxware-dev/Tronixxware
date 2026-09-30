'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { customerLogin } from '../../lib/customer-auth';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/account/orders';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await customerLogin({ identifier, password });
      router.push(redirectTo);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm">
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Tronixxware</p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">Log in</h1>
      <p className="mt-2 text-sm text-stone-500">
        Use the email or phone number you signed up with.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Email or phone number
          </span>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
            autoFocus
          />
        </label>

        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Password
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          />
        </label>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-stone-900 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
        >
          {submitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        New here?{' '}
        <Link href={`/account/register?redirect=${encodeURIComponent(redirectTo)}`} className="font-medium text-stone-900 underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:px-8">
      <Suspense fallback={<p className="text-center text-sm text-stone-500">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}