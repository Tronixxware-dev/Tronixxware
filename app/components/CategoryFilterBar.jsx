'use client';

export default function CategoryFilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  sort,
  onSortChange,
  conditionOptions,
  activeCondition,
  onConditionChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  priceBounds,
  hasActiveFilters,
  onClearFilters,
}) {
  const priceInputClass =
    'w-28 rounded-md border border-stone-200 bg-white px-3 py-1.5 font-mono text-xs text-stone-700 placeholder:text-stone-400 focus:border-stone-900 focus:outline-none';

  return (
    <div className="sticky top-0 z-20 -mx-4 border-b border-stone-200 bg-white/90 px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-lg sm:border sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === cat.id
                  ? 'bg-stone-900 text-white'
                  : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value)}
            className="rounded-md border border-stone-200 bg-white px-3 py-1.5 font-mono text-xs text-stone-600 focus:border-stone-900 focus:outline-none"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-stone-100 pt-3">
        {/* Condition */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-stone-400">
            Condition
          </span>
          {conditionOptions.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => onConditionChange(opt.id)}
              className={`rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
                activeCondition === opt.id
                  ? 'bg-stone-900 text-white'
                  : 'border border-stone-200 bg-white text-stone-600 hover:border-stone-400 hover:text-stone-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Price range (₦) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-widest text-stone-400">
            Price (₦)
          </span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={minPrice}
            onChange={(e) => onMinPriceChange(e.target.value)}
            placeholder={priceBounds ? `Min ${priceBounds.min.toLocaleString('en-NG')}` : 'Min'}
            aria-label="Minimum price"
            className={priceInputClass}
          />
          <span className="text-stone-300">–</span>
          <input
            type="number"
            inputMode="numeric"
            min="0"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(e.target.value)}
            placeholder={priceBounds ? `Max ${priceBounds.max.toLocaleString('en-NG')}` : 'Max'}
            aria-label="Maximum price"
            className={priceInputClass}
          />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="font-mono text-xs uppercase tracking-widest text-stone-500 underline-offset-4 hover:text-stone-900 hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
