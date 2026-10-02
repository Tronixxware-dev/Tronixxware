'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useCart } from '../lib/cart-context';
import { formatNaira } from '../lib/useExchangeRate';
import { parseColors, swatchFor } from '../lib/colorSwatches';

export default function ProductDetailClient({ product }) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  const images = [product.image, ...(product.gallery || [])].filter(Boolean);
  const [selectedImage, setSelectedImage] = useState(product.image);

  const colors = parseColors(product.colorOption);
  const [selectedColor, setSelectedColor] = useState(colors[0] || '');

  // Only the spec chips that actually apply to this product show up.
  const specChips = [
    product.storage,
    product.cardSlot,
    product.inches,
    product.operatingSystem,
  ].filter(Boolean);

  const lineTotal = product.price * quantity;

  function handleAddToCart() {
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
      <div>
        <div className="relative aspect-square bg-stone-100">
          <Image
            src={selectedImage}
            alt={product.name}
            fill
            className="object-contain p-10"
            sizes="(min-width: 1024px) 50vw, 100vw"
            priority
          />
        </div>

        {images.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedImage(img)}
                aria-label={`View photo ${idx + 1}`}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-stone-100 transition-colors ${
                  selectedImage === img ? 'border-stone-900' : 'border-transparent hover:border-stone-300'
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} photo ${idx + 1}`}
                  fill
                  className="object-contain p-1.5"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
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
          {product.rating > 0 && (
            <>
              <span className="inline-flex items-center gap-1">
                <span className="text-amber-500">★</span>
                <span className="mono-tag font-mono text-stone-900">{product.rating}</span>
                {product.reviews > 0 && <span className="text-stone-400">({product.reviews} reviews)</span>}
              </span>
              <span className="text-stone-300">·</span>
            </>
          )}
          <span className="font-mono text-xs uppercase tracking-wide text-stone-500">
            {product.condition}
          </span>
        </div>

        {specChips.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {specChips.map((s) => (
              <span key={s} className="rounded border border-stone-200 bg-stone-50 px-2 py-1 font-mono text-xs text-stone-600">
                {s}
              </span>
            ))}
          </div>
        )}

        {colors.length > 0 && (
          <div className="mt-5">
            <p className="text-sm text-stone-600">
              Color — <span className="font-medium text-stone-900">{selectedColor}</span>
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2.5">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  title={c}
                  aria-label={c}
                  aria-pressed={selectedColor === c}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
                    selectedColor === c
                      ? 'border-stone-900 ring-2 ring-stone-900 ring-offset-2'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  <span
                    className="h-6 w-6 rounded-full border border-black/5"
                    style={{ backgroundColor: swatchFor(c) }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-baseline gap-3 border-t border-stone-200 pt-6">
          <span className="mono-tag font-mono text-3xl font-semibold text-stone-900">
            {formatNaira(product.price)}
          </span>
        </div>

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
            {justAdded ? 'Added to cart ✓' : `Add to Cart — ${formatNaira(lineTotal)}`}
          </button>
        </div>

        <p className="mt-3 font-mono text-xs text-stone-400">
          {product.unitStock} in stock
        </p>
      </div>
    </div>
  );
}
