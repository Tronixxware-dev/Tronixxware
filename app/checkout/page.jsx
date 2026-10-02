'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '../lib/cart-context';
import { formatNaira } from '../lib/useExchangeRate';
import { getCustomerToken, getStoredCustomer, customerFetch, clearCustomerSession } from '../lib/customer-auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

function Field({ label, name, value, onChange, error, type = 'text', full = false }) {
  return (
    <label className={`block text-sm ${full ? 'sm:col-span-2' : ''}`}>
      <span className="text-xs font-medium uppercase tracking-widest text-stone-500">{label}</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1.5 w-full rounded-md border px-3 py-2 text-sm text-stone-900 focus:outline-none ${
          error ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-stone-500'
        }`}
      />
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

export default function CheckoutPage() {
  const { items, subtotal } = useCart();
  const [account, setAccount] = useState(null); // logged-in customer, or null for guest
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // If the customer is already logged in, prefill their contact details so
  // they don't have to retype them — still fully editable, and a guest can
  // just fill the form as before.
  useEffect(() => {
    const stored = getStoredCustomer();
    if (!stored) return;
    setAccount(stored);
    setForm((f) => ({
      ...f,
      fullName: f.fullName || stored.fullName || '',
      email: f.email || stored.email || '',
      phone: f.phone || stored.phone || '',
    }));
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleLogout() {
    clearCustomerSession();
    setAccount(null);
  }

  function validate() {
    const required = ['fullName', 'email', 'phone', 'address', 'city', 'state', 'postalCode', 'country'];
    const next = {};
    required.forEach((field) => {
      if (!form[field].trim()) next[field] = 'Required';
    });
    if (form.email && !/^\S+@\S+\.\S+$/.test(form.email)) {
      next.email = 'Enter a valid email';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      // customerFetch attaches the logged-in customer's token automatically
      // (so the order gets linked to their account for order history) and
      // works exactly like a normal fetch for a guest with no token at all.
      const res = await customerFetch('/api/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({
          items: items.map((line) => ({
            productId: line.id,
            quantity: line.quantity,
            colorName: line.colorName,
          })),
          customer: {
            fullName: form.fullName,
            email: form.email,
            phone: form.phone,
          },
          shippingAddress: {
            address: form.address,
            city: form.city,
            state: form.state,
            postalCode: form.postalCode,
            country: form.country,
          },
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong starting payment');
      }

      // We deliberately do NOT clear the cart here — if the customer
      // abandons the Paystack page, their cart should still be here when
      // they come back. It's cleared once payment is confirmed on the
      // /checkout/callback page.
      window.location.href = data.authorization_url;
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white px-4 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
            Tronixxware / Checkout
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
            Your cart is empty
          </h1>
          <p className="mt-3 text-sm text-stone-500">Add a few products before checking out.</p>
          <Link
            href="/products"
            className="mt-8 inline-block rounded-md bg-stone-900 px-6 py-3 text-sm font-medium text-white hover:bg-stone-700"
          >
            Continue shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
          Tronixxware / Checkout
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">Checkout</h1>

        {account ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            <span>
              Checking out as <span className="font-medium text-stone-900">{account.email || account.phone}</span>
            </span>
            <button type="button" onClick={handleLogout} className="font-mono text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900">
              Not you? Log out
            </button>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
            <Link href="/account/login?redirect=/checkout" className="font-medium text-stone-900 underline">
              Log in
            </Link>{' '}
            for faster checkout, or{' '}
            <Link href="/account/register?redirect=/checkout" className="font-medium text-stone-900 underline">
              create an account
            </Link>{' '}
            to track this order later. Guest checkout works too — no account needed.
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-16">
          <div className="space-y-6 lg:col-span-2">
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-500">
                Contact
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Full name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} />
                <Field label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
                <Field label="Phone" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-500">
                Delivery address
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <Field label="Street address" name="address" value={form.address} onChange={handleChange} error={errors.address} full />
                <Field label="City" name="city" value={form.city} onChange={handleChange} error={errors.city} />
                <Field label="State / Province" name="state" value={form.state} onChange={handleChange} error={errors.state} />
                <Field label="Postal code" name="postalCode" value={form.postalCode} onChange={handleChange} error={errors.postalCode} />
                <Field label="Country" name="country" value={form.country} onChange={handleChange} error={errors.country} />
              </div>
            </section>

            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-500">
                Order notes (optional)
              </h2>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={3}
                className="mt-3 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
                placeholder="Delivery instructions, preferred contact time, etc."
              />
            </section>

            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800">
              You&apos;ll be redirected to Paystack to complete payment securely. Your order is
              only placed once payment succeeds.
            </div>

            {submitError && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}
          </div>

          <div className="h-fit rounded-md border border-stone-200 bg-stone-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-500">
              Order summary
            </h2>
            <ul className="mt-4 space-y-3">
              {items.map((line) => (
                <li key={line.lineId} className="flex items-start justify-between gap-3 text-sm">
                  <span className="text-stone-600">
                    {line.name}
                    <span className="ml-1 font-mono text-xs text-stone-400">× {line.quantity}</span>
                  </span>
                  <span className="mono-tag flex-shrink-0 font-mono text-stone-900">
                    {formatNaira(line.price * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4 text-sm text-stone-600">
              <span>Subtotal</span>
              <span className="mono-tag font-mono">{formatNaira(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-stone-400">Taxes and shipping calculated at delivery.</p>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full rounded-md bg-stone-900 py-3 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
            >
              {submitting ? 'Redirecting to Paystack…' : `Pay ${formatNaira(subtotal)} with Paystack`}
            </button>

            <Link
              href="/cart"
              className="mt-3 block text-center font-mono text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900"
            >
              ← Back to cart
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
}