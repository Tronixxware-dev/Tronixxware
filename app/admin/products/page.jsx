'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminFetch, isSuperAdmin } from '../../lib/admin-auth';
import { categories as categoryList } from '../../lib/products';

function formatNgn(amount) {
  if (typeof amount !== 'number') return null;
  return `₦${amount.toLocaleString('en-NG')}`;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Starts false and flips after mount (rather than reading localStorage
  // directly during render) so the server-rendered markup and the first
  // client render match — avoiding a hydration warning.
  const [showOrdersTab, setShowOrdersTab] = useState(false);

  useEffect(() => {
    loadProducts();
    setShowOrdersTab(isSuperAdmin());
  }, []);

  async function loadProducts() {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/api/products');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load products');
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Products per category, plus a bucket for anything without a recognized
  // category (e.g. an old product saved before categories existed).
  const categoryCounts = useMemo(() => {
    const counts = {};
    for (const p of products) {
      const key = p.category || 'uncategorized';
      counts[key] = (counts[key] || 0) + 1;
    }
    return counts;
  }, [products]);

  async function handleDelete(id, name) {
    if (!window.confirm(`Delete "${name}"? This can't be undone.`)) return;
    try {
      const res = await adminFetch(`/api/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-stone-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          + Add product
        </Link>
      </div>

      <nav className="mt-4 flex gap-4 border-b border-stone-200 pb-3 font-mono text-xs uppercase tracking-widest text-stone-500">
        <span className="text-stone-900">Products</span>
        {showOrdersTab && (
          <Link href="/admin/orders" className="hover:text-stone-900">
            Orders
          </Link>
        )}
      </nav>

      {!loading && !error && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-stone-900 px-3 py-1 font-mono text-xs font-semibold text-white">
            {products.length} total
          </span>
          {categoryList
            .filter((c) => c.id !== 'all')
            .map((c) => (
              <span
                key={c.id}
                className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 font-mono text-xs text-stone-600"
              >
                {c.label}: {categoryCounts[c.id] || 0}
              </span>
            ))}
          {categoryCounts.uncategorized > 0 && (
            <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 font-mono text-xs text-amber-700">
              Uncategorized: {categoryCounts.uncategorized}
            </span>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 font-mono text-sm text-stone-400">Loading…</p>
      ) : (
        <div className="mt-6 space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex flex-wrap items-center gap-4 rounded-md border border-stone-200 bg-white p-4"
            >
              <div className="relative h-14 w-14 flex-shrink-0 border border-stone-200 bg-stone-100">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-contain p-1"
                  sizes="56px"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-mono text-[11px] uppercase tracking-widest text-stone-400">
                  {product.brand}
                </p>
                <p className="truncate text-sm font-medium text-stone-900">{product.name}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {product.category && (
                    <span className="rounded border border-stone-300 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-stone-600">
                      {product.category}
                    </span>
                  )}
                  {product.condition && (
                    <span className="rounded border border-stone-300 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-stone-600">
                      {product.condition}
                    </span>
                  )}
                </div>
                <p className="mt-1 font-mono text-xs text-stone-500">id: {product.id}</p>
              </div>

              <div className="text-right">
                <p className="mono-tag font-mono text-sm font-semibold text-stone-900">
                  {formatNgn(Number(product.price))}
                </p>
                <p
                  className={`font-mono text-xs ${
                    product.unitStock > 0 ? 'text-stone-500' : 'text-red-600'
                  }`}
                >
                  {product.unitStock > 0 ? `${product.unitStock} in stock` : 'Out of stock'}
                </p>
              </div>

              <div className="flex gap-2">
                <Link
                  href={`/admin/products/${product.id}/edit`}
                  className="rounded-md border border-cyan-600 px-3 py-1.5 text-xs font-medium text-cyan-600 hover:bg-cyan-50"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id, product.name)}
                  className="rounded-md border border-red-600 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}

          {products.length === 0 && (
            <p className="font-mono text-sm text-stone-400">No products yet.</p>
          )}
        </div>
      )}
    </div>
  );
}