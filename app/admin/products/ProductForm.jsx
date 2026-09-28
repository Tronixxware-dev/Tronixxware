'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminUploadImage } from '../../lib/admin-auth';
import { useExchangeRate, formatNaira } from '../../lib/useExchangeRate';

const CONDITIONS = ['New', 'Refurbished', 'Used'];

function productToFormState(product) {
  return {
    name: product?.name || '',
    brand: product?.brand || '',
    image: product?.image || '',
    price: product?.price != null ? String(product.price) : '',
    compareAtPrice: product?.compareAtPrice != null ? String(product.compareAtPrice) : '',
    unitStock: product?.unitStock != null ? String(product.unitStock) : '0',
    condition: product?.condition || 'New',
    description: product?.description || '',
    rating: product?.rating != null ? String(product.rating) : '',
    reviews: product?.reviews != null ? String(product.reviews) : '',
    specs: product?.specs?.length ? [...product.specs] : [''],
    colors: product?.colors?.length ? product.colors.map((c) => ({ ...c })) : [],
    bulkEnabled: !!product?.bulk,
    bulkMinQty: product?.bulk?.minQty != null ? String(product.bulk.minQty) : '',
    bulkPricePerUnit: product?.bulk?.pricePerUnit != null ? String(product.bulk.pricePerUnit) : '',
  };
}

function formStateToPayload(form) {
  const payload = {
    name: form.name.trim(),
    brand: form.brand.trim(),
    image: form.image.trim(),
    price: Number(form.price),
    unitStock: Number(form.unitStock),
    condition: form.condition,
    description: form.description.trim(),
    specs: form.specs.map((s) => s.trim()).filter(Boolean),
    colors: form.colors
      .filter((c) => c.name.trim())
      .map((c) => ({ name: c.name.trim(), hex: c.hex })),
  };

  payload.compareAtPrice = form.compareAtPrice.trim() ? Number(form.compareAtPrice) : null;

  // rating/reviews have no "unset" path on the backend (unlike
  // compareAtPrice/colors/bulk) — Number(null) is 0, not NaN, so sending
  // null here would silently save a rating of 0 instead of leaving it
  // alone. Omit the key entirely when the field is blank instead.
  if (form.rating.trim()) payload.rating = Number(form.rating);
  if (form.reviews.trim()) payload.reviews = Number(form.reviews);

  payload.bulk =
    form.bulkEnabled && form.bulkMinQty.trim() && form.bulkPricePerUnit.trim()
      ? { minQty: Number(form.bulkMinQty), pricePerUnit: Number(form.bulkPricePerUnit) }
      : null;

  return payload;
}

export default function ProductForm({ product, onSubmit, submitLabel = 'Save product' }) {
  const router = useRouter();
  const rate = useExchangeRate();
  const [form, setForm] = useState(() => productToFormState(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [localPreview, setLocalPreview] = useState(null);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setLocalPreview(URL.createObjectURL(file));

    setUploading(true);
    try {
      const url = await adminUploadImage(file);
      update('image', url);
    } catch (err) {
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function updateSpec(idx, value) {
    setForm((prev) => {
      const specs = [...prev.specs];
      specs[idx] = value;
      return { ...prev, specs };
    });
  }

  function addSpec() {
    setForm((prev) => ({ ...prev, specs: [...prev.specs, ''] }));
  }

  function removeSpec(idx) {
    setForm((prev) => ({ ...prev, specs: prev.specs.filter((_, i) => i !== idx) }));
  }

  function updateColor(idx, field, value) {
    setForm((prev) => {
      const colors = [...prev.colors];
      colors[idx] = { ...colors[idx], [field]: value };
      return { ...prev, colors };
    });
  }

  function addColor() {
    setForm((prev) => ({ ...prev, colors: [...prev.colors, { name: '', hex: '#000000' }] }));
  }

  function removeColor(idx) {
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.image.trim()) {
      setError('Upload a product image before saving.');
      return;
    }

    if (form.bulkEnabled && form.bulkMinQty.trim() && Number(form.bulkMinQty) < 2) {
      setError('Bulk minimum quantity must be at least 2.');
      return;
    }

    setSaving(true);
    try {
      await onSubmit(formStateToPayload(form));
    } catch (err) {
      setError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  }

  const priceNum = Number(form.price);
  const compareNum = Number(form.compareAtPrice);

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-stone-700">Product image</label>
        <div className="mt-2 flex items-center gap-4">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-md border border-stone-200 bg-stone-50">
            {localPreview || form.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={localPreview || form.image}
                alt="Product preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="font-mono text-[10px] text-stone-400">No image</span>
            )}
          </div>
          <div className="flex-1">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/avif"
              onChange={handleImageSelect}
              disabled={uploading}
              className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-stone-700"
            />
            {uploading && <p className="mt-1 font-mono text-xs text-stone-400">Uploading…</p>}
            {uploadError && <p className="mt-1 text-xs text-red-600">{uploadError}</p>}
            {form.image && !uploading && (
              <p className="mt-1 truncate font-mono text-[11px] text-emerald-700">{form.image}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Name</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => update('name', e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Brand</label>
          <input
            type="text"
            required
            value={form.brand}
            onChange={(e) => update('brand', e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Price (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            required
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
          {Number.isFinite(priceNum) && form.price.trim() !== '' && (
            <p className="mt-1 font-mono text-xs text-stone-400">{formatNaira(priceNum, rate)}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Compare-at price (USD)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.compareAtPrice}
            onChange={(e) => update('compareAtPrice', e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
          {Number.isFinite(compareNum) && form.compareAtPrice.trim() !== '' && (
            <p className="mt-1 font-mono text-xs text-stone-400">{formatNaira(compareNum, rate)}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Stock (units)</label>
          <input
            type="number"
            step="1"
            min="0"
            required
            value={form.unitStock}
            onChange={(e) => update('unitStock', e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Condition</label>
          <select
            value={form.condition}
            onChange={(e) => update('condition', e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          >
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700">Rating (optional)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="5"
            value={form.rating}
            onChange={(e) => update('rating', e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">Review count (optional)</label>
          <input
            type="number"
            step="1"
            min="0"
            value={form.reviews}
            onChange={(e) => update('reviews', e.target.value)}
            className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">Description</label>
        <textarea
          rows={4}
          value={form.description}
          onChange={(e) => update('description', e.target.value)}
          className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-stone-700">Specs</label>
          <button type="button" onClick={addSpec} className="text-xs font-medium text-stone-600 hover:text-stone-900">
            + Add spec
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {form.specs.map((spec, idx) => (
            <div key={idx} className="flex gap-2">
              <input
                type="text"
                value={spec}
                onChange={(e) => updateSpec(idx, e.target.value)}
                placeholder="e.g. 256GB storage"
                className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeSpec(idx)}
                className="rounded-md border border-stone-200 px-2 text-xs text-stone-400 hover:border-red-200 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-stone-700">Colors</label>
          <button type="button" onClick={addColor} className="text-xs font-medium text-stone-600 hover:text-stone-900">
            + Add color
          </button>
        </div>
        <div className="mt-2 space-y-2">
          {form.colors.map((color, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                type="color"
                value={color.hex || '#000000'}
                onChange={(e) => updateColor(idx, 'hex', e.target.value)}
                className="h-9 w-9 rounded-md border border-stone-300"
              />
              <input
                type="text"
                value={color.name}
                onChange={(e) => updateColor(idx, 'name', e.target.value)}
                placeholder="Color name, e.g. Midnight"
                className="flex-1 rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => removeColor(idx)}
                className="rounded-md border border-stone-200 px-2 py-2 text-xs text-stone-400 hover:border-red-200 hover:text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          {form.colors.length === 0 && (
            <p className="font-mono text-xs text-stone-400">No color variants added.</p>
          )}
        </div>
      </div>

      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
          <input
            type="checkbox"
            checked={form.bulkEnabled}
            onChange={(e) => update('bulkEnabled', e.target.checked)}
          />
          Enable bulk pricing
        </label>
        {form.bulkEnabled && (
          <div className="mt-2 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-stone-500">Minimum quantity (2+)</label>
              <input
                type="number"
                step="1"
                min="2"
                value={form.bulkMinQty}
                onChange={(e) => update('bulkMinQty', e.target.value)}
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500">Price per unit (USD)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.bulkPricePerUnit}
                onChange={(e) => update('bulkPricePerUnit', e.target.value)}
                className="mt-1 w-full rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 border-t border-stone-100 pt-6">
        <button
          type="submit"
          disabled={saving || uploading}
          className="rounded-md bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="text-sm text-stone-500 hover:text-stone-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}