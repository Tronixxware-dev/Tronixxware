'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { getAdminToken } from '../lib/admin-auth';

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
    if (!getAdminToken()) {
      router.replace('/admin/login');
      return;
    }
    setChecked(true);
  }, [isLoginPage, router]);

  if (!checked) return null;

  return children;
}