'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../lib/cart-context';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function CallbackContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

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
        <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
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
      <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
        Tronixxware / Checkout
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
        Order #{order.orderNumber} received
      </h1>
      <p className="mt-3 text-sm text-stone-500">
        Thanks, {order.customer.fullName.split(' ')[0]}. Your payment was successful and your
        order has been placed. We&apos;ll reach out at {order.customer.email} or{' '}
        {order.customer.phone} to arrange delivery.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-block rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700"
      >
        Continue shopping
      </Link>
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