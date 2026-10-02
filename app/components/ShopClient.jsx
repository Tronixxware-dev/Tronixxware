'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import CategoryFilterBar from './CategoryFilterBar';

export default function ShopClient({ products, categories }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [sort, setSort] = useState('featured');

  const searchParams = useSearchParams();
  const urlCategory = searchParams.get('category');
  const appliedUrlCategory = useRef(null);

  useEffect(() => {
    if (urlCategory && urlCategory !== appliedUrlCategory.current) {
      appliedUrlCategory.current = urlCategory;
      setActiveCategory(urlCategory);
    }
  }, [urlCategory]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }
    switch (sort) {
      case 'price-asc':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      default:
        break;
    }
    return list;
  }, [products, activeCategory, sort]);

  return (
    <div>
      <CategoryFilterBar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        sort={sort}
        onSortChange={setSort}
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