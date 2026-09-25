'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../lib/cart-context';
import { useExchangeRate, formatNaira } from '../lib/useExchangeRate';

export default function ProductDetailClient({ product }) {
  const { addItem } = useCart();
  const rate = useExchangeRate();
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const discount = product.compareAtPrice
    ? Math.round(100 - (product.price / product.compareAtPrice) * 100)
    : null;

  const isBulkQty = Boolean(product.bulk) && quantity >= product.bulk.minQty;
  const unitPrice = isBulkQty ? product.bulk.pricePerUnit : product.price;
  const lineTotal = unitPrice * quantity;

  function handleAddToCart() {
    addItem(product, quantity, selectedColor);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div className="relative aspect-square bg-stone-100">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-contain p-10"
          sizes="(min-width: 1024px) 50vw, 100vw"
          priority
        />
        {discount && (
          <span className="absolute left-4 top-4 rounded-full bg-red-600 px-3 py-1 font-mono text-xs font-semibold text-white">
            -{discount}%
          </span>
        )}
      </div>

      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
          {product.brand}
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
          {product.name}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-stone-500">
          <span className="text-amber-500">★</span>
          <span className="mono-tag font-mono">{product.rating}</span>
          <span>({product.reviews} reviews)</span>
          <span className="text-stone-300">|</span>
          <span className="font-mono text-xs uppercase tracking-wide text-stone-500">
            {product.condition}
          </span>
        </div>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {product.specs.map((s) => (
            <span key={s} className="rounded border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-xs text-stone-600">
              {s}
            </span>
          ))}
        </div>

        {product.description && (
          <p className="mt-5 text-sm leading-relaxed text-stone-600">
            {product.description}
          </p>
        )}

        {product.colors && (
          <div className="mt-6">
            <p className="text-xs font-medium uppercase tracking-widest text-stone-500">
              Color — <span className="text-stone-900">{selectedColor?.name}</span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              {product.colors.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  aria-label={c.name}
                  className={`h-7 w-7 rounded-full border-2 transition-all ${
                    selectedColor?.name === c.name
                      ? 'border-stone-900'
                      : 'border-transparent ring-1 ring-stone-300'
                  }`}
                  style={{ backgroundColor: c.hex }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-baseline gap-3 border-t border-stone-200 pt-6">
          <span className="mono-tag font-mono text-3xl font-semibold text-stone-900">
            {formatNaira(unitPrice, rate)}
          </span>
          {product.compareAtPrice && !isBulkQty && (
            <span className="mono-tag font-mono text-base text-stone-400 line-through">
              {formatNaira(product.compareAtPrice, rate)}
            </span>
          )}
          {isBulkQty && (
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 font-mono text-xs font-medium text-emerald-700">
              Bulk price applied
            </span>
          )}
        </div>

        {product.bulk && (
          <div className="mt-3 rounded-md border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="font-mono text-xs text-stone-600">
              Buy {product.bulk.minQty}+ units at{' '}
              <span className="font-semibold text-emerald-700">
                {formatNaira(product.bulk.pricePerUnit, rate)}/unit
              </span>{' '}
              — save{' '}
              {formatNaira((product.price - product.bulk.pricePerUnit) * product.bulk.minQty, rate)}{' '}
              on a {product.bulk.minQty}-unit order.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center gap-3">
          <div className="flex items-center rounded-md border border-stone-300">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="flex h-11 w-11 items-center justify-center text-stone-600 hover:bg-stone-50"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-10 text-center font-mono text-sm text-stone-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(product.unitStock, q + 1))}
              className="flex h-11 w-11 items-center justify-center text-stone-600 hover:bg-stone-50"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 rounded-md py-3 text-sm font-medium text-white transition-colors ${
              justAdded ? 'bg-emerald-700' : 'bg-stone-900 hover:bg-stone-700'
            }`}
          >
            {justAdded ? 'Added to cart ✓' : `Add to Cart — ${formatNaira(lineTotal, rate)}`}
          </button>
        </div>

        <p className="mt-3 font-mono text-xs text-stone-400">
          {product.unitStock} in stock
        </p>
      </div>
    </div>
  );
}