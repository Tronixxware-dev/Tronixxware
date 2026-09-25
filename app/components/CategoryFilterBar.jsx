'use client';

export default function CategoryFilterBar({
  categories,
  activeCategory,
  onCategoryChange,
  sort,
  onSortChange,
  bulkOnly,
  onBulkOnlyChange,
}) {
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
          <label className="flex items-center gap-2 font-mono text-xs text-stone-500">
            <input
              type="checkbox"
              checked={bulkOnly}
              onChange={(e) => onBulkOnlyChange(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-stone-300 text-stone-900 focus:ring-stone-900"
            />
            Bulk pricing only
          </label>

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
    </div>
  );
}