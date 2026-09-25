'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminToken, clearAdminToken } from '../lib/admin-auth';

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setChecked(true);
      return;
    }
    const token = getAdminToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }
    setChecked(true);
  }, [pathname, isLoginPage, router]);

  function handleLogout() {
    clearAdminToken();
    router.replace('/admin/login');
  }

  if (isLoginPage) {
    return <div className="min-h-screen bg-stone-50">{children}</div>;
  }

  if (!checked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-50">
        <p className="font-mono text-sm text-stone-400">Checking session…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 sm:px-8">
          <span className="font-mono text-sm font-semibold tracking-tight text-stone-900">
            TRONIXXWARE ADMIN
          </span>
          <nav className="flex items-center gap-5 font-mono text-xs uppercase tracking-widest text-stone-500">
            <Link href="/admin/products" className="hover:text-stone-900">
              Products
            </Link>
            <Link href="/admin/orders" className="hover:text-stone-900">
              Orders
            </Link>
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto font-mono text-xs uppercase tracking-widest text-stone-500 hover:text-red-600"
          >
            Log out
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}