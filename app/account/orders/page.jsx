'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCustomerToken, customerFetch } from '../../lib/customer-auth';

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-blue-50 text-blue-700',
  shipped: 'bg-indigo-50 text-indigo-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-stone-100 text-stone-500',
};

function formatNgn(amount) {
  if (typeof amount !== 'number') return null;
  return `₦${amount.toLocaleString('en-NG')}`;
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getCustomerToken()) {
      router.replace('/account/login?redirect=/account/orders');
      return;
    }
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await customerFetch('/api/my-orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load your orders');
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
          Tronixxware / Account
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">Order history</h1>

        {error && (
          <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <p className="mt-8 font-mono text-sm text-stone-400">Loading your orders…</p>
        ) : orders.length === 0 ? (
          <div className="mt-10 text-center">
            <p className="text-sm text-stone-500">You haven&apos;t placed any orders yet.</p>
            <Link
              href="/products"
              className="mt-6 inline-block rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700"
            >
              Start shopping
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/account/orders/${order._id}`}
                className="block rounded-md border border-stone-200 bg-white p-5 transition hover:border-stone-400"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-sm font-semibold text-stone-900">
                        {order.orderNumber}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                          STATUS_STYLES[order.status] || STATUS_STYLES.pending
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.paymentStatus !== 'paid' && (
                        <span className="rounded-full bg-red-50 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-red-600">
                          {order.paymentStatus}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleString('en-NG', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </p>
                    <p className="mt-2 text-sm text-stone-600">
                      {order.items.map((item) => item.name).join(', ')}
                    </p>
                  </div>
                  <p className="mono-tag flex-shrink-0 font-mono text-lg font-semibold text-stone-900">
                    {formatNgn(order.amountPaidNgn) || `$${order.subtotal.toLocaleString()}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}