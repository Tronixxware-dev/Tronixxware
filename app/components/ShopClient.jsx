'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';
import CategoryFilterBar from './CategoryFilterBar';
import { conditionFilterOptions, normalizeCondition } from '../lib/condition';

export default function ShopClient({ products, categories }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeCondition, setActiveCondition] = useState('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
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

  const conditionOptions = useMemo(() => conditionFilterOptions(products), [products]);

  // Cheapest / priciest product in the whole catalogue — shown as the
  // placeholder hint in the Min / Max boxes.
  const priceBounds = useMemo(() => {
    const prices = products.map((p) => p.price).filter((n) => typeof n === 'number');
    if (prices.length === 0) return null;
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];

    if (activeCategory !== 'all') {
      list = list.filter((p) => p.category === activeCategory);
    }

    if (activeCondition !== 'all') {
      list = list.filter((p) => normalizeCondition(p.condition) === activeCondition);
    }

    const min = minPrice === '' ? null : Number(minPrice);
    const max = maxPrice === '' ? null : Number(maxPrice);
    if (min !== null && !Number.isNaN(min)) {
      list = list.filter((p) => p.price >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      list = list.filter((p) => p.price <= max);
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
  }, [products, activeCategory, activeCondition, minPrice, maxPrice, sort]);

  const hasActiveFilters =
    activeCategory !== 'all' || activeCondition !== 'all' || minPrice !== '' || maxPrice !== '';

  function clearFilters() {
    setActiveCategory('all');
    setActiveCondition('all');
    setMinPrice('');
    setMaxPrice('');
  }

  return (
    <div>
      <CategoryFilterBar
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        sort={sort}
        onSortChange={setSort}
        conditionOptions={conditionOptions}
        activeCondition={activeCondition}
        onConditionChange={setActiveCondition}
        minPrice={minPrice}
        maxPrice={maxPrice}
        onMinPriceChange={setMinPrice}
        onMaxPriceChange={setMaxPrice}
        priceBounds={priceBounds}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
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
