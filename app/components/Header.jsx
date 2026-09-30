'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../lib/cart-context';
import { getStoredCustomer, getCustomerToken, clearCustomerSession } from '../lib/customer-auth';

// Small hand-drawn icon set — no icon library needed, keeps the bundle
// light and every icon inherits currentColor so it matches its label.
const iconProps = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' };

function IconStore(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M4 9v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V9" />
      <path d="M9 20v-6h6v6" />
    </svg>
  );
}
function IconPhone(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="6" y="2" width="12" height="20" rx="2.5" />
      <path d="M11 18h2" />
    </svg>
  );
}
function IconLaptop(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="4" y="4" width="16" height="11" rx="1.5" />
      <path d="M2 19h20" />
    </svg>
  );
}
function IconHeadphones(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M3 13a9 9 0 0 1 18 0" />
      <rect x="3" y="13" width="5" height="7" rx="1.5" />
      <rect x="16" y="13" width="5" height="7" rx="1.5" />
    </svg>
  );
}
function IconSearch(props) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </svg>
  );
}
function IconCart(props) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}
function IconUser(props) {
  return (
    <svg {...iconProps} {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
    </svg>
  );
}
function IconOrders(props) {
  return (
    <svg {...iconProps} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <path d="M8 9h8M8 13h8M8 17h4" />
    </svg>
  );
}
function IconLogout(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" />
      <path d="M15 16l4-4-4-4" />
      <path d="M19 12H9" />
    </svg>
  );
}
function IconMenu(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
function IconClose(props) {
  return (
    <svg {...iconProps} {...props}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}
function IconSparkle(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2c.9 3.6 2.1 4.8 5.7 5.7-3.6.9-4.8 2.1-5.7 5.7-.9-3.6-2.1-4.8-5.7-5.7C9.9 6.8 11.1 5.6 12 2z" />
    </svg>
  );
}

const CATEGORIES = [
  { label: 'All products', href: '/products', icon: IconStore },
  { label: 'Phones', href: '/products?category=phones', icon: IconPhone },
  { label: 'Laptops', href: '/products?category=laptops', icon: IconLaptop },
  { label: 'Accessories', href: '/products?category=accessories', icon: IconHeadphones },
];

export default function Header({ products }) {
  const router = useRouter();
  const { itemCount } = useCart();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [account, setAccount] = useState(null);
  const accountRef = useRef(null);

  useEffect(() => {
    setAccount(getStoredCustomer());
  }, []);

  // Close the account dropdown on an outside click.
  useEffect(() => {
    function handleClick(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q))
      .slice(0, 6);
  }, [query, products]);

  function handleSelect(id) {
    setQuery('');
    setSearchOpen(false);
    setMobileOpen(false);
    router.push(`/products/${id}`);
  }

  function handleLogout() {
    clearCustomerSession();
    setAccount(null);
    setAccountMenuOpen(false);
    setMobileOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-800 bg-black">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-8 lg:px-12">
        {/* Hamburger — mobile only */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-stone-200 transition hover:scale-105 hover:bg-white/10 hover:text-white active:scale-95 sm:hidden"
        >
          <IconMenu />
        </button>

        <Link href="/" className="group relative flex items-center pr-3 transition hover:scale-105">
          <span className="font-eurostile text-lg font-black tracking-tight text-white">
            TRONIXXWARE
          </span>
        </Link>

        {/* Desktop nav — icon + label pills */}
        <nav className="hidden items-center gap-1 sm:flex">
          {CATEGORIES.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-1.5 rounded-full px-3 py-2 font-mono text-xs uppercase tracking-widest text-stone-200 transition hover:scale-105 hover:bg-white/10 hover:text-white active:scale-95"
            >
              <Icon width={15} height={15} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="relative ml-auto flex flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-3">
          {/* Search — pill shaped */}
          <div className="relative hidden w-full max-w-xs sm:block sm:w-64">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" width={16} height={16} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Search products..."
              className="w-full rounded-full border border-stone-700 bg-stone-900 py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-stone-400 transition focus:border-white focus:bg-stone-800 focus:outline-none"
            />

            {searchOpen && results.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-lg">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={() => handleSelect(p.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-stone-50"
                  >
                    <span>
                      <span className="text-stone-900">{p.name}</span>
                      <span className="ml-2 font-mono text-xs text-stone-400">{p.brand}</span>
                    </span>
                    <span className="mono-tag font-mono text-xs text-stone-500">${p.price.toLocaleString()}</span>
                  </button>
                ))}
              </div>
            )}

            {searchOpen && query.trim() && results.length === 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-400 shadow-lg">
                No products match &quot;{query}&quot;.
              </div>
            )}
          </div>

          {/* Search icon — mobile only, opens the hamburger menu on its search tab */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Search"
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-stone-200 transition hover:scale-105 hover:bg-white/10 hover:text-white active:scale-95 sm:hidden"
          >
            <IconSearch />
          </button>

          {/* Account */}
          <div ref={accountRef} className="relative hidden sm:block">
            {account ? (
              <>
                <button
                  type="button"
                  onClick={() => setAccountMenuOpen((v) => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-mono text-xs font-semibold text-stone-900 transition hover:scale-105 active:scale-95"
                  aria-label="Account menu"
                >
                  {(account.fullName || account.email || account.phone || '?').charAt(0).toUpperCase()}
                </button>
                {accountMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-2xl border border-stone-200 bg-white py-1.5 shadow-lg">
                    <p className="truncate px-4 py-2 text-xs text-stone-400">
                      {account.email || account.phone}
                    </p>
                    <Link
                      href="/account/orders"
                      onClick={() => setAccountMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-700 transition hover:bg-stone-50"
                    >
                      <IconOrders width={16} height={16} />
                      My orders
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-stone-700 transition hover:bg-stone-50"
                    >
                      <IconLogout width={16} height={16} />
                      Log out
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/account/login"
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 font-mono text-xs uppercase tracking-widest text-stone-200 transition hover:scale-105 hover:bg-white/10 hover:text-white active:scale-95"
                >
                  <IconUser width={15} height={15} />
                  Log in
                </Link>
                <Link
                  href="/account/register"
                  className="rounded-full bg-white px-4 py-2 font-mono text-xs font-semibold uppercase tracking-widest text-stone-900 transition hover:scale-105 hover:bg-stone-200 active:scale-95"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>

          {/* Cart */}
          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-stone-700 text-stone-200 transition hover:scale-105 hover:border-white hover:text-white active:scale-95"
          >
            <IconCart />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-white font-mono text-[10px] font-semibold text-stone-900">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute inset-0 bg-black/60 animate-fade-in"
          />
          <div className="absolute inset-x-0 top-0 max-h-[100dvh] overflow-y-auto rounded-b-3xl bg-black p-5 shadow-xl animate-slide-down">
            <div className="flex items-center justify-between">
              <span className="font-eurostile text-base font-black tracking-tight text-white">
                TRONIXXWARE
              </span>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-full text-stone-200 transition hover:bg-white/10 hover:text-white active:scale-95"
              >
                <IconClose />
              </button>
            </div>

            <div className="relative mt-5">
              <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-300" width={16} height={16} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                autoFocus
                className="w-full rounded-full border border-stone-700 bg-stone-900 py-3 pl-9 pr-4 text-sm text-white placeholder:text-stone-400 focus:border-white focus:outline-none"
              />
            </div>

            {query.trim() && (
              <div className="mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-white">
                {results.length > 0 ? (
                  results.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleSelect(p.id)}
                      className="flex w-full items-center justify-between gap-3 border-b border-stone-100 px-4 py-3 text-left text-sm last:border-0"
                    >
                      <span>
                        <span className="text-stone-900">{p.name}</span>
                        <span className="ml-2 font-mono text-xs text-stone-400">{p.brand}</span>
                      </span>
                      <span className="font-mono text-xs text-stone-500">${p.price.toLocaleString()}</span>
                    </button>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-stone-400">No products match &quot;{query}&quot;.</p>
                )}
              </div>
            )}

            <div className="mt-6 space-y-1">
              <p className="px-2 font-mono text-[11px] uppercase tracking-widest text-stone-300">
                Shop by category
              </p>
              {CATEGORIES.map(({ label, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white transition active:scale-[0.98] active:bg-white/10"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
                    <Icon width={17} height={17} />
                  </span>
                  {label}
                </Link>
              ))}
            </div>

            <div className="mt-6 space-y-1 border-t border-stone-800 pt-4">
              {account ? (
                <>
                  <p className="px-3 pb-1 text-xs text-stone-300">{account.email || account.phone}</p>
                  <Link
                    href="/account/orders"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white transition active:scale-[0.98] active:bg-white/10"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
                      <IconOrders width={17} height={17} />
                    </span>
                    My orders
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium text-white transition active:scale-[0.98] active:bg-white/10"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
                      <IconLogout width={17} height={17} />
                    </span>
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/account/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-white transition active:scale-[0.98] active:bg-white/10"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white">
                      <IconUser width={17} height={17} />
                    </span>
                    Log in
                  </Link>
                  <Link
                    href="/account/register"
                    onClick={() => setMobileOpen(false)}
                    className="mt-2 flex items-center justify-center gap-2 rounded-full bg-white px-4 py-3 text-sm font-semibold text-stone-900 transition active:scale-95"
                  >
                    Create an account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sparkle-logo {
          display: inline-block;
          animation: glow-pulse 2.6s ease-in-out infinite;
        }
        @keyframes glow-pulse {
          0%,
          100% {
            text-shadow: 0 0 0px rgba(255, 255, 255, 0);
          }
          50% {
            text-shadow: 0 0 6px rgba(255, 255, 255, 0.85), 0 0 14px rgba(255, 255, 255, 0.45);
          }
        }
        .sparkle-twinkle {
          animation: twinkle 1.8s ease-in-out infinite;
        }
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.15;
            transform: scale(0.6);
          }
          50% {
            opacity: 1;
            transform: scale(1.15);
          }
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-down {
          from {
            transform: translateY(-16px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
        .animate-slide-down {
          animation: slide-down 0.25s ease-out forwards;
        }
      `}</style>
    </header>
  );
}