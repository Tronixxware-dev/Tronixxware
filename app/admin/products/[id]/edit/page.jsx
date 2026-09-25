'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminProductForm from '../../../../components/AdminProductForm';
import { adminFetch } from '../../../../lib/admin-auth';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const res = await adminFetch(`/api/products/${params.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load product');
        setProduct(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  async function handleUpdate(payload) {
    const res = await adminFetch(`/api/products/${params.id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update product');
    }
    router.push('/admin/products');
  }

  if (loading) {
    return <p className="font-mono text-sm text-stone-400">Loading…</p>;
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">Edit product</h1>
      <div className="mt-6">
        <AdminProductForm initialData={product} onSubmit={handleUpdate} submitLabel="Save changes" />
      </div>
    </div>
  );
}