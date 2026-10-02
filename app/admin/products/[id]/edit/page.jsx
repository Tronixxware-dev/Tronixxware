'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminFetch } from '../../../../lib/admin-auth';
import ProductForm from '../../ProductForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function loadProduct() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/products/${id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load product');
      setProduct(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(payload) {
    setSubmitting(true);
    setError('');
    try {
      const res = await adminFetch(`/api/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update product');
      router.push('/admin/products');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className="mx-auto max-w-2xl">
        <h1 className="text-2xl font-semibold text-stone-900">Edit product</h1>
        <p className="mt-1 text-sm text-stone-500">Update details, pricing, and specs.</p>
      </div>

      {error && (
        <div className="mx-auto mt-4 max-w-2xl rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 text-center font-mono text-sm text-stone-400">Loading…</p>
      ) : (
        product && (
          <div className="mt-6">
            <ProductForm
              product={product}
              onSubmit={handleSubmit}
              submitLabel="Save changes"
            />
          </div>
        )
      )}
    </div>
  );
}