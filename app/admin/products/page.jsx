'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { adminFetch } from '../../lib/admin-auth';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProducts();
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
        <Link href="/admin/orders" className="hover:text-stone-900">
          Orders
        </Link>
        <span className="text-stone-900">Products</span>
      </nav>

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
              <div className="relative h-14 w-14 flex-shrink-0 bg-stone-100">
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
                <p className="mt-0.5 font-mono text-xs text-stone-500">id: {product.id}</p>
              </div>

              <div className="text-right">
                <p className="mono-tag font-mono text-sm font-semibold text-stone-900">
                  ${Number(product.price).toLocaleString()}
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
                  className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
                >
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(product.id, product.name)}
                  className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-500 hover:border-red-300 hover:text-red-600"
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