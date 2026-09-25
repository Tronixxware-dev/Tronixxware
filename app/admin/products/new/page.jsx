'use client';

import { useRouter } from 'next/navigation';
import AdminProductForm from '../../../components/AdminProductForm';
import { adminFetch } from '../../../lib/admin-auth';

export default function NewProductPage() {
  const router = useRouter();

  async function handleCreate(payload) {
    const res = await adminFetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to create product');
    }
    router.push('/admin/products');
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">New product</h1>
      <div className="mt-6">
        <AdminProductForm onSubmit={handleCreate} submitLabel="Create product" />
      </div>
    </div>
  );
}