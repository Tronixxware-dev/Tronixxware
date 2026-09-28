'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminFetch } from '../../../lib/admin-auth';
import ProductForm from '../ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(payload) {
    setSubmitting(true);
    setError('');
    try {
      const res = await adminFetch('/api/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');
      router.push('/admin/products');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">Add product</h1>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-6">
        <ProductForm onSubmit={handleSubmit} submitting={submitting} submitLabel="Create product" />
      </div>
    </div>
  );
}