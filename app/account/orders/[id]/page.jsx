'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getCustomerToken, customerFetch } from '../../../lib/customer-auth';

function formatNgn(amount) {
  if (typeof amount !== 'number') return null;
  return `₦${amount.toLocaleString('en-NG')}`;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getCustomerToken()) {
      router.replace(`/account/login?redirect=/account/orders/${params.id}`);
      return;
    }
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  async function loadOrder() {
    setLoading(true);
    setError('');
    try {
      const res = await customerFetch(`/api/my-orders/${params.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Order not found');
      setOrder(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-white px-4 py-16 sm:px-8">
        <p className="text-center font-mono text-sm text-stone-400">Loading order…</p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-white px-4 py-16 sm:px-8">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-sm text-red-600">{error || 'Order not found'}</p>
          <Link href="/account/orders" className="mt-6 inline-block text-sm font-medium text-stone-900 underline">
            Back to order history
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-3xl">
        <Link href="/account/orders" className="font-mono text-xs uppercase tracking-widest text-stone-400 hover:text-stone-700">
          ← Order history
        </Link>
        <h1 className="mt-3 text-2xl font-semibold text-stone-900 sm:text-3xl">
          Order {order.orderNumber}
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Placed{' '}
          {new Date(order.createdAt).toLocaleString('en-NG', { dateStyle: 'long', timeStyle: 'short' })}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-stone-100 px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider text-stone-700">
            {order.status}
          </span>
          <span
            className={`rounded-full px-3 py-1 font-mono text-xs font-semibold uppercase tracking-wider ${
              order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
            }`}
          >
            {order.paymentStatus}
          </span>
        </div>

        <div className="mt-8 divide-y divide-stone-200 rounded-md border border-stone-200">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-4 p-4">
              {item.image ? (
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-stone-100">
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
              ) : (
                <div className="h-16 w-16 flex-shrink-0 rounded-md bg-stone-100" />
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-stone-900">{item.name}</p>
                <p className="text-xs text-stone-400">
                  {item.colorName ? `${item.colorName} · ` : ''}Qty {item.quantity}
                </p>
              </div>
              <p className="mono-tag flex-shrink-0 font-mono text-sm text-stone-900">
                ${item.lineTotal.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-md border border-stone-200 p-5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-stone-500">
              Shipping address
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              {order.customer.fullName}
              <br />
              {order.shippingAddress.address}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </p>
          </div>
          <div className="rounded-md border border-stone-200 p-5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-stone-500">
              Payment
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              Total paid: {formatNgn(order.amountPaidNgn) || '—'}
              <br />
              Reference: <span className="font-mono text-xs">{order.paymentReference}</span>
              <br />
              Contact: {order.customer.email} · {order.customer.phone}
            </p>
          </div>
        </div>

        {order.notes && (
          <p className="mt-6 text-sm italic text-stone-500">Note: {order.notes}</p>
        )}
      </div>
    </main>
  );
}