'use client';

import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import CategoryFilterBar from './CategoryFilterBar';

export default function ShopClient({ products, categories }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState('featured');
  const [bulkOnly, setBulkOnly] = useState(false);

  const filtered = useMemo(() => {
    let list = [...products];

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (bulkOnly) {
      list = list.filter((p) => Boolean(p.bulk));
    }
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      default:
        break;
    }
    return list;
  }, [products, activeCategory, sort, bulkOnly]);

  return (
    <div>
      <CategoryFilterBar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        sort={sort}
        onSortChange={setSort}
        bulkOnly={bulkOnly}
        onBulkOnlyChange={setBulkOnly}
      />

      <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="mt-16 text-center font-mono text-sm text-stone-400">
          No products match these filters.
        </p>
      )}
    </div>
  );
}