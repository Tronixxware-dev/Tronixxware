'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../lib/cart-context';
import { getCustomerToken } from '../../lib/customer-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function formatNgn(amount) {
  if (typeof amount !== 'number') return null;
  return `₦${amount.toLocaleString('en-NG')}`;
}

// Deterministic little confetti burst — no Math.random(), so there's
// nothing that can differ between renders, just a pleasant scatter.
const CONFETTI = Array.from({ length: 18 }, (_, i) => {
  const angle = (360 / 18) * i;
  const distance = 90 + ((i * 37) % 60);
  const delay = (i % 6) * 0.05;
  const colors = ['#10b981', '#f59e0b', '#0ea5e9', '#ef4444', '#8b5cf6'];
  return { angle, distance, delay, color: colors[i % colors.length] };
});

function CallbackContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const isLoggedIn = typeof window !== 'undefined' && Boolean(getCustomerToken());

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      setStatus('error');
      setError('No payment reference was found in the URL.');
      return;
    }

    let cancelled = false;

    fetch(`${API_URL}/api/payments/verify/${reference}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Payment verification failed');
        return data;
      })
      .then((data) => {
        if (cancelled) return;
        setOrder(data);
        clearCart();
        setStatus('success');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (status === 'verifying') {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-stone-200 border-t-stone-900" />
        <p className="mt-6 font-mono text-xs uppercase tracking-widest text-stone-400">
          Tronixxware / Checkout
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
          Confirming your payment…
        </h1>
        <p className="mt-3 text-sm text-stone-500">
          Please wait a moment while we confirm your payment with Paystack.
        </p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
          Tronixxware / Checkout
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
          We couldn&apos;t confirm your payment
        </h1>
        <p className="mt-3 text-sm text-red-600">{error}</p>
        <p className="mt-3 text-sm text-stone-500">
          If money was deducted from your account, don&apos;t worry — contact us with your
          reference and we&apos;ll sort it out. Otherwise, your cart is still saved and you can
          try again.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link
            href="/cart"
            className="rounded-md border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Back to cart
          </Link>
          <Link
            href="/checkout"
            className="rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl text-center">
      {/* Checkmark + confetti burst */}
      <div className="relative mx-auto flex h-28 w-28 items-center justify-center">
        {CONFETTI.map((c, i) => (
          <span
            key={i}
            className="confetti-piece"
            style={{
              '--angle': `${c.angle}deg`,
              '--distance': `${c.distance}px`,
              '--delay': `${c.delay}s`,
              backgroundColor: c.color,
            }}
          />
        ))}
        <svg viewBox="0 0 80 80" className="h-24 w-24">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="#10b981"
            strokeWidth="4"
            strokeLinecap="round"
            className="checkmark-circle"
          />
          <path
            d="M24 41 L35 52 L57 28"
            fill="none"
            stroke="#10b981"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="checkmark-tick"
          />
        </svg>
      </div>

      <p className="mt-4 font-mono text-xs uppercase tracking-widest text-stone-400 fade-in-up" style={{ animationDelay: '0.5s' }}>
        Tronixxware / Checkout
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl fade-in-up" style={{ animationDelay: '0.6s' }}>
        Payment successful!
      </h1>
      <p className="mt-3 text-sm text-stone-500 fade-in-up" style={{ animationDelay: '0.7s' }}>
        Thanks, {order.customer.fullName.split(' ')[0]}. Order{' '}
        <span className="font-mono font-medium text-stone-900">#{order.orderNumber}</span> is
        confirmed. We&apos;ll reach out at {order.customer.email} or {order.customer.phone} to
        arrange delivery.
      </p>

      {order.stockConflict && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800 fade-in-up" style={{ animationDelay: '0.75s' }}>
          We&apos;re just double-checking stock on one or more items — we&apos;ll reach out if
          anything needs adjusting.
        </p>
      )}

      {/* Purchased items */}
      <div className="mt-8 space-y-3 rounded-md border border-stone-200 bg-white p-4 text-left">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 fade-in-up"
            style={{ animationDelay: `${0.85 + idx * 0.1}s` }}
          >
            {item.image ? (
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-stone-100">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              </div>
            ) : (
              <div className="h-14 w-14 flex-shrink-0 rounded-md bg-stone-100" />
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
        <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-sm">
          <span className="text-stone-500">Total paid</span>
          <span className="mono-tag font-mono font-semibold text-stone-900">
            {formatNgn(order.amountPaidNgn)}
          </span>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3 fade-in-up" style={{ animationDelay: '1.3s' }}>
        {isLoggedIn ? (
          <Link
            href={`/account/orders/${order._id}`}
            className="rounded-md border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            View order details
          </Link>
        ) : (
          <Link
            href="/account/register"
            className="rounded-md border border-stone-300 px-6 py-3 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Create an account to track this order
          </Link>
        )}
        <Link
          href="/products"
          className="rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700"
        >
          Continue shopping
        </Link>
      </div>

      <style jsx>{`
        .checkmark-circle {
          stroke-dasharray: 226;
          stroke-dashoffset: 226;
          animation: draw-circle 0.6s ease-out forwards;
        }
        .checkmark-tick {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: draw-tick 0.35s ease-out forwards;
          animation-delay: 0.55s;
        }
        @keyframes draw-circle {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes draw-tick {
          to {
            stroke-dashoffset: 0;
          }
        }

        .confetti-piece {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          border-radius: 2px;
          opacity: 0;
          transform: translate(-50%, -50%);
          animation: burst 0.9s ease-out forwards;
          animation-delay: var(--delay);
        }
        @keyframes burst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(0) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(var(--distance)) scale(0.4);
          }
        }

        .fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.5s ease-out forwards;
        }
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <main className="min-h-screen bg-white px-4 py-16 sm:px-8 lg:px-12">
      <Suspense
        fallback={
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm text-stone-500">Loading…</p>
          </div>
        }
      >
        <CallbackContent />
      </Suspense>
    </main>
  );
}