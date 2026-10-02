import Link from 'next/link';
import { categories } from '../lib/products';
import ScrollReveal from './ScrollReveal';

const SHOP_LINKS = categories.filter((c) => c.id !== 'all');

const ACCOUNT_LINKS = [
  { label: 'Log in', href: '/account/login' },
  { label: 'Create account', href: '/account/register' },
  { label: 'My orders', href: '/account/orders' },
  { label: 'Cart', href: '/cart' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <ScrollReveal as="footer" className="border-t border-stone-800 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 flex items-center sm:col-span-1">
            <span className="font-eurostile text-lg font-black tracking-tight text-white">
              TRONIXXWARE
            </span>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-stone-300">Shop</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/products" className="text-sm text-stone-400 transition hover:text-white">
                  All products
                </Link>
              </li>
              {SHOP_LINKS.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?category=${c.id}`}
                    className="text-sm text-stone-400 transition hover:text-white"
                  >
                    {c.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-stone-300">Account</p>
            <ul className="mt-3 space-y-2">
              {ACCOUNT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-stone-400 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-stone-300">Tronixxware</p>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/" className="text-sm text-stone-400 transition hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-stone-400 transition hover:text-white">
                  About
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-sm text-stone-400 transition hover:text-white">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-stone-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-stone-500">
            © {year} Tronixxware. All rights reserved.
          </p>
        </div>
      </div>
    </ScrollReveal>
  );
}
