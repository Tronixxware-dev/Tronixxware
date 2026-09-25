'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../lib/cart-context';

export default function Header({ products }) {
  const router = useRouter();
  const { itemCount } = useCart();
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

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
    router.push(`/products/${id}`);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="font-mono text-lg font-semibold tracking-tight text-stone-900">
          TRONIXXWARE
        </Link>

        <nav className="hidden items-center gap-6 font-mono text-xs uppercase tracking-widest text-stone-500 sm:flex">
          <Link href="/products" className="hover:text-stone-900">
            Shop
          </Link>
        </nav>

        <div className="relative ml-auto flex flex-1 items-center justify-end gap-3 sm:flex-none">
          <div className="relative w-full max-w-xs sm:w-64">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Search products..."
              className="w-full rounded-full border border-stone-200 bg-stone-50 px-4 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:border-stone-400 focus:outline-none"
            />

            {searchOpen && results.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-2 overflow-hidden rounded-md border border-stone-200 bg-white shadow-lg">
                {results.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onMouseDown={() => handleSelect(p.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-stone-50"
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
              <div className="absolute left-0 right-0 top-full mt-2 rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-400 shadow-lg">
                No products match &quot;{query}&quot;.
              </div>
            )}
          </div>

          <Link
            href="/cart"
            aria-label="Cart"
            className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-stone-200 text-stone-600 hover:border-stone-900 hover:text-stone-900"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 font-mono text-[10px] text-white">
              {itemCount}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}