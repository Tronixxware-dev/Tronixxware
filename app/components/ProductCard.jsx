'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '../lib/cart-context';
import { formatNaira } from '../lib/useExchangeRate';
import { parseColors, swatchFor } from '../lib/colorSwatches';
import { conditionLabel, conditionBadgeClasses, conditionTextClasses } from '../lib/condition';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const [wishlisted, setWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Only the spec chips that actually apply to this product show up — a
  // pair of earbuds just won't have "Inches" or "Operating System" set.
  const specChips = [
    product.storage,
    product.inches,
    product.operatingSystem,
  ].filter(Boolean);

  const colors = parseColors(product.colorOption);

  function handleAddToCart() {
    addItem(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <div className="group relative">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square bg-stone-100">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />

          <div className="absolute left-3 top-3 flex flex-col gap-2">
            {product.condition && (
              <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider backdrop-blur ${conditionBadgeClasses(product.condition)}`}>
                {conditionLabel(product.condition)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setWishlisted((w) => !w);
            }}
            aria-label="Add to wishlist"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 bg-white/90 text-stone-500 backdrop-blur transition-colors hover:border-stone-900 hover:text-stone-900"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
              <path d="M12 20.727c-.483 0-.964-.178-1.339-.533C7.4 17.284 4 13.882 4 9.964 4 7.229 6.145 5 8.788 5c1.564 0 2.968.79 3.212 2.02C12.244 5.79 13.648 5 15.212 5 17.855 5 20 7.229 20 9.964c0 3.918-3.4 7.32-6.661 10.23-.375.355-.856.533-1.339.533z" />
            </svg>
          </button>
        </div>

        <div className="pt-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-stone-400">
            {product.brand}
          </p>
          <h3 className="mt-1 line-clamp-1 text-sm font-medium text-stone-900">
            {product.name}
          </h3>

          {product.condition && (
            <p className={`mt-1 flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide ${conditionTextClasses(product.condition).text}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${conditionTextClasses(product.condition).dot}`} />
              {conditionLabel(product.condition)}
            </p>
          )}

          {product.rating > 0 && (
            <div className="mt-1 flex items-center gap-1 text-xs text-stone-500">
              <span className="text-amber-500">★</span>
              <span className="mono-tag font-mono">{product.rating}</span>
              {product.reviews > 0 && <span>({product.reviews})</span>}
            </div>
          )}

          {specChips.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {specChips.map((s) => (
                <span key={s} className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-mono text-[10px] text-stone-500">
                  {s}
                </span>
              ))}
            </div>
          )}

          {colors.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5">
              {colors.slice(0, 6).map((c) => (
                <span
                  key={c}
                  title={c}
                  className="h-4 w-4 shrink-0 rounded-full border border-stone-200"
                  style={{ backgroundColor: swatchFor(c) }}
                />
              ))}
              {colors.length > 6 && (
                <span className="font-mono text-[10px] text-stone-400">+{colors.length - 6}</span>
              )}
            </div>
          )}

          <div className="mt-3 flex items-baseline gap-2">
            <span className="mono-tag font-mono text-lg font-semibold text-stone-900">
              {formatNaira(product.price)}
            </span>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        className={`mt-4 w-full rounded-md py-2.5 text-sm font-medium text-white transition-colors ${
          justAdded ? 'bg-emerald-700' : 'bg-stone-900 hover:bg-stone-700'
        }`}
      >
        {justAdded ? 'Added ✓' : 'Add to Cart'}
      </button>
    </div>
  );
}
