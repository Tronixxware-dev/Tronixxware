'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getAdminToken, getAdminRole, clearAdminToken } from '../lib/admin-auth';

// NOTE: this file and app/admin/layout.jsx are duplicates of the same route
// segment — only one of them is actually used by Next.js, and which one
// depends on build resolution order. Keeping both files in sync (rather
// than deleting one) means the admin shell renders correctly either way.
// It's worth deleting one of the two yourself to remove the ambiguity.

// Routes only a superadmin may view — a non-superadmin landing on one of
// these (by URL, bookmark, or a stale link) is bounced to Products instead.
const SUPERADMIN_ONLY_PATHS = ['/admin/orders', '/admin/staff'];

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

    const role = getAdminRole();
    const isRestrictedPath = SUPERADMIN_ONLY_PATHS.some((p) => pathname.startsWith(p));
    if (role !== 'superadmin' && isRestrictedPath) {
      router.replace('/admin/products');
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

  const isSuperAdmin = getAdminRole() === 'superadmin';

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="border-b border-cyan-950 bg-cyan-900">
        <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-4 sm:px-8">
          <span className="font-mono text-sm font-semibold tracking-tight text-white">
            TRONIXXWARE ADMIN
          </span>
          <nav className="flex items-center gap-5 font-mono text-xs uppercase tracking-widest text-cyan-200">
            <Link href="/admin/products" className="hover:text-white">
              Products
            </Link>
            {isSuperAdmin && (
              <Link href="/admin/orders" className="hover:text-white">
                Orders
              </Link>
            )}
            {isSuperAdmin && (
              <Link href="/admin/staff" className="hover:text-white">
                Staff
              </Link>
            )}
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="ml-auto font-mono text-xs uppercase tracking-widest text-cyan-200 hover:text-red-300"
          >
            Log out
          </button>
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
    </div>
  );
}
