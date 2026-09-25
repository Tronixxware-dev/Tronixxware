'use client';

import { useState } from 'react';

function parseColors(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, hex] = line.split('|').map((part) => part.trim());
      return { name, hex };
    })
    .filter((c) => c.name && c.hex);
}

function colorsToText(colors) {
  return (colors || []).map((c) => `${c.name}|${c.hex}`).join('\n');
}

export default function AdminProductForm({ initialData, onSubmit, submitLabel = 'Save' }) {
  const isEdit = Boolean(initialData);
  const [form, setForm] = useState({
    id: initialData?.id || '',
    category: initialData?.category || 'phones',
    brand: initialData?.brand || '',
    name: initialData?.name || '',
    specs: initialData?.specs?.join(', ') || '',
    condition: initialData?.condition || 'New',
    description: initialData?.description || '',
    image: initialData?.image || '',
    colorsText: colorsToText(initialData?.colors),
    price: initialData?.price ?? '',
    compareAtPrice: initialData?.compareAtPrice ?? '',
    rating: initialData?.rating ?? '',
    reviews: initialData?.reviews ?? '',
    unitStock: initialData?.unitStock ?? '',
    bulkEnabled: Boolean(initialData?.bulk),
    bulkMinQty: initialData?.bulk?.minQty ?? '',
    bulkPricePerUnit: initialData?.bulk?.pricePerUnit ?? '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.id.trim() || !form.name.trim() || !form.brand.trim() || !form.image.trim()) {
      setError('Id, name, brand, and image are required');
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError('Price must be greater than 0');
      return;
    }

    const payload = {
      id: form.id.trim(),
      category: form.category,
      brand: form.brand.trim(),
      name: form.name.trim(),
      specs: form.specs
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      condition: form.condition,
      description: form.description.trim(),
      image: form.image.trim(),
      colors: parseColors(form.colorsText),
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : null,
      rating: form.rating ? Number(form.rating) : 0,
      reviews: form.reviews ? Number(form.reviews) : 0,
      unitStock: Number(form.unitStock) || 0,
      bulk: form.bulkEnabled
        ? { minQty: Number(form.bulkMinQty), pricePerUnit: Number(form.bulkPricePerUnit) }
        : null,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Product ID (slug)
          </span>
          <input
            type="text"
            value={form.id}
            onChange={(e) => update('id', e.target.value)}
            disabled={isEdit}
            placeholder="p-example-product"
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none disabled:bg-stone-100 disabled:text-stone-400"
          />
        </label>

        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Category
          </span>
          <select
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          >
            <option value="phones">Phones</option>
            <option value="laptops">Laptops</option>
            <option value="accessories">Accessories</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Brand
          </span>
          <input
            type="text"
            value={form.brand}
            onChange={(e) => update('brand', e.target.value)}
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Name
          </span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm sm:col-span-2">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Specs (comma-separated)
          </span>
          <input
            type="text"
            value={form.specs}
            onChange={(e) => update('specs', e.target.value)}
            placeholder="256GB, Titanium, 5G"
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Condition
          </span>
          <select
            value={form.condition}
            onChange={(e) => update('condition', e.target.value)}
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          >
            <option value="New">New</option>
            <option value="Refurbished">Refurbished</option>
            <option value="Open-box">Open-box</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Image path
          </span>
          <input
            type="text"
            value={form.image}
            onChange={(e) => update('image', e.target.value)}
            placeholder="/products/example.png"
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
          Description
        </span>
        <textarea
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
        />
      </label>

      <label className="block text-sm">
        <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
          Colors (one per line, Name|hex)
        </span>
        <textarea
          value={form.colorsText}
          onChange={(e) => update('colorsText', e.target.value)}
          rows={3}
          placeholder={'Natural Titanium|#8a8a86\nBlack Titanium|#1c1c1e'}
          className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-4">
        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Price ($)
          </span>
          <input
            type="number"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Compare-at price
          </span>
          <input
            type="number"
            value={form.compareAtPrice}
            onChange={(e) => update('compareAtPrice', e.target.value)}
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Rating
          </span>
          <input
            type="number"
            step="0.1"
            value={form.rating}
            onChange={(e) => update('rating', e.target.value)}
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          />
        </label>

        <label className="block text-sm">
          <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
            Reviews
          </span>
          <input
            type="number"
            value={form.reviews}
            onChange={(e) => update('reviews', e.target.value)}
            className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
          Unit stock
        </span>
        <input
          type="number"
          value={form.unitStock}
          onChange={(e) => update('unitStock', e.target.value)}
          className="mt-1.5 w-full max-w-xs rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
        />
      </label>

      <div className="rounded-md border border-stone-200 bg-stone-50 p-4">
        <label className="flex items-center gap-2 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={form.bulkEnabled}
            onChange={(e) => update('bulkEnabled', e.target.checked)}
          />
          Enable bulk pricing
        </label>

        {form.bulkEnabled && (
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
                Min quantity
              </span>
              <input
                type="number"
                value={form.bulkMinQty}
                onChange={(e) => update('bulkMinQty', e.target.value)}
                className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
              />
            </label>
            <label className="block text-sm">
              <span className="text-xs font-medium uppercase tracking-widest text-stone-500">
                Price per unit ($)
              </span>
              <input
                type="number"
                value={form.bulkPricePerUnit}
                onChange={(e) => update('bulkPricePerUnit', e.target.value)}
                className="mt-1.5 w-full rounded-md border border-stone-300 px-3 py-2 text-sm text-stone-900 focus:border-stone-500 focus:outline-none"
              />
            </label>
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-stone-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
      >
        {submitting ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}