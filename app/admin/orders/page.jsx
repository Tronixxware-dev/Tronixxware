'use client';

import { useEffect, useState } from 'react';
import { adminFetch } from '../../lib/admin-auth';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function formatNgn(amount) {
  if (typeof amount !== 'number') return null;
  return `₦${amount.toLocaleString('en-NG')}`;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/api/orders');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load orders');
      setOrders(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId, status) {
    try {
      const res = await adminFetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status');
      setOrders((prev) => prev.map((o) => (o._id === orderId ? data : o)));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">Orders</h1>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="mt-6 font-mono text-sm text-stone-400">Loading…</p>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => {
            const ngnAmount = formatNgn(order.amountPaidNgn);
            const isPaid = order.paymentStatus === 'paid';

            return (
              <div key={order._id} className="rounded-md border border-stone-200 bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-semibold text-stone-900">
                        {order.orderNumber}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${
                          isPaid
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-stone-100 text-stone-500'
                        }`}
                      >
                        {order.paymentStatus || 'unpaid'}
                      </span>
                      {order.paymentProvider && (
                        <span className="font-mono text-[10px] uppercase tracking-wider text-stone-400">
                          via {order.paymentProvider}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-stone-600">
                      {order.customer.fullName} · {order.customer.email} · {order.customer.phone}
                    </p>
                    <p className="mt-1 text-xs text-stone-400">
                      {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state}, {order.shippingAddress.country}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="mono-tag font-mono text-lg font-semibold text-stone-900">
                      ${order.subtotal.toLocaleString()}
                    </p>
                    {ngnAmount && (
                      <p className="mono-tag font-mono text-xs text-emerald-700">
                        {ngnAmount} paid
                        {order.exchangeRateUsed
                          ? ` (rate: ₦${Math.round(order.exchangeRateUsed).toLocaleString('en-NG')}/$)`
                          : ''}
                      </p>
                    )}
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      className="mt-2 rounded-md border border-stone-300 px-2 py-1.5 text-xs font-mono uppercase tracking-widest text-stone-700 focus:border-stone-500 focus:outline-none"
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <ul className="mt-4 space-y-1 border-t border-stone-100 pt-3">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between text-sm text-stone-600">
                      <span>
                        {item.name}
                        {item.colorName ? ` — ${item.colorName}` : ''}
                        <span className="ml-1 font-mono text-xs text-stone-400">× {item.quantity}</span>
                      </span>
                      <span className="mono-tag font-mono text-stone-900">
                        ${item.lineTotal.toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>

                {order.notes && (
                  <p className="mt-3 text-xs italic text-stone-400">Note: {order.notes}</p>
                )}
              </div>
            );
          })}

          {orders.length === 0 && (
            <p className="font-mono text-sm text-stone-400">No orders yet.</p>
          )}
        </div>
      )}
    </div>
  );
}