'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../lib/cart-context';
import { useExchangeRate, formatNaira } from '../lib/useExchangeRate';

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const rate = useExchangeRate();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-white px-4 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
            Tronixxware / Cart
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
            Your cart is empty
          </h1>
          <p className="mt-3 text-sm text-stone-500">
            Browse the shop and add a few products to get started.
          </p>
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
          Tronixxware / Cart
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
          Your cart
        </h1>

        <div className="mt-8 grid gap-10 lg:grid-cols-3 lg:gap-16">
          <div className="lg:col-span-2">
            <ul className="divide-y divide-stone-200 border-y border-stone-200">
              {items.map((line) => {
                const isBulk = Boolean(line.bulk) && line.quantity >= line.bulk.minQty;
                const unitPrice = isBulk ? line.bulk.pricePerUnit : line.price;
                const lineTotal = unitPrice * line.quantity;

                return (
                  <li key={line.lineId} className="flex gap-4 py-5">
                    <div className="relative h-24 w-24 flex-shrink-0 bg-stone-100">
                      <Image
                        src={line.image}
                        alt={line.name}
                        fill
                        className="object-contain p-2"
                        sizes="96px"
                      />
                    </div>

                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-widest text-stone-400">
                            {line.brand}
                          </p>
                          <Link
                            href={`/products/${line.id}`}
                            className="text-sm font-medium text-stone-900 hover:underline"
                          >
                            {line.name}
                          </Link>
                          {line.colorName && (
                            <p className="mt-1 text-xs text-stone-500">Color: {line.colorName}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItem(line.lineId)}
                          className="font-mono text-xs text-stone-400 hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="mt-auto flex items-end justify-between pt-3">
                        <div className="flex items-center rounded-md border border-stone-300">
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.lineId, line.quantity - 1)}
                            className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-50"
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-mono text-sm text-stone-900">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(line.lineId, line.quantity + 1)}
                            className="flex h-8 w-8 items-center justify-center text-stone-600 hover:bg-stone-50"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          {isBulk && (
                            <p className="font-mono text-[11px] font-medium text-emerald-700">
                              Bulk price applied
                            </p>
                          )}
                          <p className="mono-tag font-mono text-sm font-semibold text-stone-900">
                            {formatNaira(lineTotal, rate)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <Link
              href="/products"
              className="mt-6 inline-block font-mono text-xs uppercase tracking-widest text-stone-500 hover:text-stone-900"
            >
              ← Continue shopping
            </Link>
          </div>

          <div className="h-fit rounded-md border border-stone-200 bg-stone-50 p-6">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-500">
              Order summary
            </h2>

            <div className="mt-4 flex items-center justify-between text-sm text-stone-600">
              <span>Subtotal</span>
              <span className="mono-tag font-mono">{formatNaira(subtotal, rate)}</span>
            </div>
            <p className="mt-1 text-xs text-stone-400">
              Taxes and shipping calculated at checkout.
            </p>

            <Link
              href="/checkout"
              className="mt-6 block w-full rounded-md bg-stone-900 py-3 text-center text-sm font-medium text-white hover:bg-stone-700"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}