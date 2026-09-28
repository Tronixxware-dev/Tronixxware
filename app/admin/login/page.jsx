'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '../../lib/admin-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await adminLogin(email, password);
      router.push('/admin/orders');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Tronixxware / Admin
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900">Admin sign in</h1>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Email
          </span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
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
            required
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
          className="w-full rounded-md bg-stone-900 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:bg-stone-400"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}