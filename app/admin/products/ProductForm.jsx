'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminUploadImage } from '../../lib/admin-auth';
import { formatNaira } from '../../lib/useExchangeRate';
import { swatchFor } from '../../lib/colorSwatches';
import { generateProductDetails } from '../../lib/productDetails';
import { conditionLabel } from '../../lib/condition';

// Same six categories used across the storefront (nav, "Shop by category",
// and the /products filter bar) — see app/lib/products.js.
const CATEGORIES = [
  { value: 'phones', label: 'Phones' },
  { value: 'laptops', label: 'Laptops' },
  { value: 'watches', label: 'Watches' },
  { value: 'headphones', label: 'Headphones' },
  { value: 'gaming', label: 'Gaming' },
  { value: 'accessories', label: 'Accessories' },
  { value: 'powerbanks', label: 'Powerbanks' },
];

const CONDITIONS = ['New', 'Used', 'LLA', 'Refurbished'];
const STORAGE_OPTIONS = ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];
const CARD_SLOT_OPTIONS = ['Yes', 'No'];
const OS_OPTIONS = [
  'Android',
  'iOS',
  'Windows 10',
  'Windows 11',
  'macOS',
  'ChromeOS',
  'Linux',
  'watchOS',
  'Wear OS',
  'Other',
];

// Which of the extra spec fields make sense for each category — the form
// only shows the fields that apply, so adding a pair of headphones doesn't
// ask for a screen size, and adding a watch doesn't ask for a card slot.
const CATEGORY_FIELDS = {
  phones: ['storage', 'cardSlot', 'operatingSystem', 'colorOption'],
  laptops: ['storage', 'inches', 'operatingSystem', 'colorOption'],
  watches: ['storage', 'operatingSystem', 'colorOption'],
  headphones: ['colorOption'],
  gaming: ['storage', 'colorOption'],
  accessories: ['storage', 'colorOption'],
  powerbanks: ['colorOption'],
};

const FIELD_LABELS = {
  storage: 'Storage',
  cardSlot: 'Card Slot',
  inches: 'Inches',
  operatingSystem: 'Operating System',
};

// Brand choices per category, ordered roughly popular → less popular for
// the Nigerian market this store sells into. "Other…" always falls back to
// a free-text field so an uncommon brand is never blocked.
const OTHER_BRAND = '__other__';
const BRANDS_BY_CATEGORY = {
  phones: ['Apple', 'Samsung', 'Infinix', 'Tecno', 'itel', 'Xiaomi', 'Oppo', 'Vivo', 'OnePlus', 'Google', 'Huawei', 'Nokia', 'Realme', 'Sony'],
  laptops: ['Apple', 'HP', 'Dell', 'Lenovo', 'Asus', 'Acer', 'Microsoft', 'MSI', 'Samsung', 'LG', 'Razer', 'Toshiba'],
  watches: ['Apple', 'Samsung', 'Huawei', 'Garmin', 'Amazfit', 'Xiaomi', 'Fitbit', 'Fossil', 'Noise'],
  headphones: ['Apple', 'Sony', 'Samsung', 'JBL', 'Bose', 'Beats', 'Anker Soundcore', 'Xiaomi', 'Sennheiser', 'Skullcandy'],
  gaming: ['Sony', 'Microsoft', 'Nintendo', 'Logitech', 'Razer', 'SteelSeries', 'HyperX'],
  accessories: ['Anker', 'Baseus', 'Belkin', 'Spigen', 'UGREEN', 'Oraimo', 'Samsung', 'Apple', 'Xiaomi'],
  powerbanks: ['Anker', 'Oraimo', 'Baseus', 'Xiaomi', 'Romoss', 'UGREEN', 'Belkin', 'Samsung'],
};

function brandsFor(category) {
  return BRANDS_BY_CATEGORY[category] || [];
}

// Suggestion list for the Name field — all iPhone series plus popular
// laptop model names, matched by substring as the admin types.
const NAME_SUGGESTIONS = [
  'iPhone 17 Pro Max', 'iPhone 17 Pro', 'iPhone 17', 'iPhone Air',
  'iPhone 16 Pro Max', 'iPhone 16 Pro', 'iPhone 16 Plus', 'iPhone 16e', 'iPhone 16',
  'iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone 15',
  'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14 Plus', 'iPhone 14',
  'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'iPhone 13 mini',
  'iPhone 12 Pro Max', 'iPhone 12 Pro', 'iPhone 12', 'iPhone 12 mini',
  'iPhone 11 Pro Max', 'iPhone 11 Pro', 'iPhone 11',
  'iPhone XS Max', 'iPhone XS', 'iPhone XR', 'iPhone X',
  'iPhone SE (3rd generation)', 'iPhone SE (2nd generation)', 'iPhone SE',
  'iPhone 8 Plus', 'iPhone 8',
  'iPhone 7 Plus', 'iPhone 7',
  'iPhone 6s Plus', 'iPhone 6s',
  'iPhone 6 Plus', 'iPhone 6',
  'MacBook Air M3', 'MacBook Air M2', 'MacBook Air',
  'MacBook Pro 14"', 'MacBook Pro 16"', 'MacBook Pro 13"', 'MacBook',
  'Dell XPS 13', 'Dell XPS 15', 'Dell Inspiron', 'Dell Latitude', 'Dell Vostro',
  'HP Pavilion', 'HP Spectre x360', 'HP EliteBook', 'HP Envy', 'HP ProBook',
  'Lenovo ThinkPad X1 Carbon', 'Lenovo ThinkPad', 'Lenovo IdeaPad', 'Lenovo Legion', 'Lenovo Yoga',
  'Asus ZenBook', 'Asus VivoBook', 'Asus ROG Strix', 'Asus TUF Gaming',
  'Acer Aspire', 'Acer Swift', 'Acer Predator', 'Acer Nitro',
  'Microsoft Surface Laptop', 'Microsoft Surface Pro',
  'MSI GF63', 'MSI Modern', 'MSI Stealth',
  'Razer Blade',
  'Samsung Galaxy Book',
  'Toshiba Satellite',
];

function productToFormState(product) {
  const category = product?.category || 'phones';
  const rawBrand = product?.brand || '';
  const knownBrand = rawBrand && brandsFor(category).includes(rawBrand);

  return {
    name: product?.name || '',
    brand: rawBrand ? (knownBrand ? rawBrand : OTHER_BRAND) : '',
    brandCustom: rawBrand && !knownBrand ? rawBrand : '',
    image: product?.image || '',
    gallery: product?.gallery?.length ? [...product.gallery] : [],
    price: product?.price != null ? String(product.price) : '',
    unitStock: product?.unitStock != null ? String(product.unitStock) : '0',
    rating: product?.rating != null ? String(product.rating) : '',
    reviews: product?.reviews != null ? String(product.reviews) : '',
    category,
    condition: product?.condition || 'New',
    description: product?.description || '',
    storage: product?.storage || '',
    cardSlot: product?.cardSlot || '',
    inches: product?.inches || '',
    operatingSystem: product?.operatingSystem || '',
    colors: product?.colorOption
      ? product.colorOption.split(',').map((c) => c.trim()).filter(Boolean)
      : [],
    colorInput: '',
  };
}

function formStateToPayload(form) {
  const visibleFields = CATEGORY_FIELDS[form.category] || [];

  const payload = {
    name: form.name.trim(),
    brand: (form.brand === OTHER_BRAND ? form.brandCustom : form.brand).trim(),
    image: form.image.trim(),
    gallery: form.gallery,
    price: Number(form.price),
    unitStock: Number(form.unitStock),
    rating: form.rating.trim() !== '' ? Number(form.rating) : 0,
    reviews: form.reviews.trim() !== '' ? Number(form.reviews) : 0,
    category: form.category,
    condition: form.condition,
    description: form.description.trim(),
  };

  ['storage', 'cardSlot', 'inches', 'operatingSystem'].forEach((key) => {
    payload[key] = visibleFields.includes(key) ? form[key].trim() : '';
  });

  payload.colorOption = visibleFields.includes('colorOption') ? form.colors.join(', ') : '';

  return payload;
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 shadow-sm transition focus:border-stone-900 focus:outline-none focus:ring-4 focus:ring-stone-900/5';
const labelClass = 'block text-sm font-medium text-stone-700';
const sectionClass = 'space-y-5 border-t border-stone-100 pt-7 first:border-t-0 first:pt-0';
const sectionTitleClass = 'text-xs font-semibold uppercase tracking-widest text-stone-400';

export default function ProductForm({ product, onSubmit, submitLabel = 'Save product' }) {
  const router = useRouter();
  const [form, setForm] = useState(() => productToFormState(product));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [localPreview, setLocalPreview] = useState(null);
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryError, setGalleryError] = useState('');
  const [nameFocused, setNameFocused] = useState(false);

  // The edit page fetches the product asynchronously, so it may still be
  // loading (or a cold-starting Render backend may take a while) when this
  // form first mounts. We sync once per actual product — tracked by id —
  // rather than on every prop change, so this never clobbers edits you've
  // already made once the real data has loaded.
  const loadedProductKey = useRef(null);
  useEffect(() => {
    const key = product?.id ?? product?._id ?? null;
    if (key && key !== loadedProductKey.current) {
      loadedProductKey.current = key;
      setForm(productToFormState(product));
    }
  }, [product]);

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  // --- Auto-generated product details (phones + laptops) -----------------
  // Build the description from whatever has been picked so far. It keeps
  // itself up to date (new model, storage, colours, condition...) only while
  // the Product details box is empty or still holds the last auto-generated
  // text — as soon as you type your own wording into it, auto-fill stops
  // touching it. The "Auto-generate" button always overwrites on demand.
  const lastAutoDescription = useRef('');

  function buildGeneratedDetails(f) {
    return generateProductDetails({
      name: f.name,
      brand: f.brand === OTHER_BRAND ? f.brandCustom : f.brand,
      category: f.category,
      condition: f.condition,
      storage: f.storage,
      inches: f.inches,
      operatingSystem: f.operatingSystem,
      colors: f.colors,
    });
  }

  useEffect(() => {
    const generated = buildGeneratedDetails(form);
    setForm((prev) => {
      const untouched = prev.description === '' || prev.description === lastAutoDescription.current;
      lastAutoDescription.current = generated;
      if (!untouched || prev.description === generated) return prev;
      return { ...prev, description: generated };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    form.name,
    form.brand,
    form.brandCustom,
    form.category,
    form.condition,
    form.storage,
    form.inches,
    form.operatingSystem,
    form.colors,
  ]);

  function handleAutoGenerate() {
    const generated = buildGeneratedDetails(form);
    if (!generated) return;
    lastAutoDescription.current = generated;
    update('description', generated);
  }

  const canAutoGenerate = Boolean(buildGeneratedDetails(form));

  function addColorChip() {
    const name = form.colorInput.trim();
    if (!name) return;
    setForm((prev) =>
      prev.colors.includes(name)
        ? { ...prev, colorInput: '' }
        : { ...prev, colors: [...prev.colors, name], colorInput: '' }
    );
  }

  function removeColorChip(name) {
    setForm((prev) => ({ ...prev, colors: prev.colors.filter((c) => c !== name) }));
  }

  function handleColorKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addColorChip();
    }
  }

  async function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setImageLoadFailed(false);
    setLocalPreview(URL.createObjectURL(file));

    setUploading(true);
    try {
      const url = await adminUploadImage(file);
      update('image', url);
      // Switch over to the real hosted URL now that it exists — holding
      // onto the local blob preview past this point is what made the
      // thumbnail occasionally go blank even though the upload succeeded.
      setLocalPreview(null);
    } catch (err) {
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  async function handleGallerySelect(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setGalleryError('');
    setGalleryUploading(true);
    try {
      const uploadedUrls = await Promise.all(files.map((file) => adminUploadImage(file)));
      setForm((prev) => ({ ...prev, gallery: [...prev.gallery, ...uploadedUrls] }));
    } catch (err) {
      setGalleryError(err.message || 'One or more gallery images failed to upload');
    } finally {
      setGalleryUploading(false);
      e.target.value = '';
    }
  }

  function removeGalleryImage(idx) {
    setForm((prev) => ({ ...prev, gallery: prev.gallery.filter((_, i) => i !== idx) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!form.image.trim()) {
      setError('Upload a product image before saving.');
      return;
    }

    if (form.brand === OTHER_BRAND && !form.brandCustom.trim()) {
      setError('Enter the brand name.');
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
  const visibleFields = CATEGORY_FIELDS[form.category] || [];
  const specFields = visibleFields.filter((f) => f !== 'colorOption');

  const nameQuery = form.name.trim().toLowerCase();
  const nameSuggestions = nameQuery
    ? NAME_SUGGESTIONS.filter((n) => n.toLowerCase().includes(nameQuery)).slice(0, 8)
    : [];

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-2xl space-y-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm sm:p-10"
    >
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className={sectionClass}>
        <p className={sectionTitleClass}>Photos</p>

        <div>
          <label className={labelClass}>Product image (cover)</label>
          <div className="mt-2 flex items-center gap-4">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-stone-200 bg-stone-50">
              {(localPreview || form.image) && !imageLoadFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={localPreview || form.image}
                  alt="Product preview"
                  className="h-full w-full object-cover"
                  onError={() => setImageLoadFailed(true)}
                  onLoad={() => setImageLoadFailed(false)}
                />
              ) : (
                <span className="px-1 text-center font-mono text-[10px] text-stone-400">
                  {imageLoadFailed ? 'Image failed to load' : 'No image'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <label
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 text-xs font-medium text-white transition ${
                  uploading ? 'bg-stone-400' : 'bg-stone-900 hover:bg-stone-700'
                }`}
              >
                {uploading ? 'Uploading…' : 'Choose file'}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  onChange={handleImageSelect}
                  disabled={uploading}
                  className="hidden"
                />
              </label>

              <p className="mt-2 text-xs">
                {uploading ? (
                  <span className="font-mono text-stone-400">Uploading…</span>
                ) : uploadError ? (
                  <span className="text-red-600">{uploadError}</span>
                ) : form.image ? (
                  <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    Photo uploaded
                  </span>
                ) : (
                  <span className="text-stone-400">No photo selected yet</span>
                )}
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className={labelClass}>Gallery (additional photos)</label>
          <div className="mt-2 flex flex-wrap gap-3">
            {form.gallery.map((url, idx) => (
              <div
                key={idx}
                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-stone-200 bg-stone-50"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Gallery ${idx + 1}`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeGalleryImage(idx)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-stone-900 text-[10px] text-white hover:bg-red-600"
                  aria-label="Remove gallery image"
                >
                  ×
                </button>
              </div>
            ))}
            <label className="flex h-20 w-20 shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 text-center text-[10px] text-stone-400 hover:border-stone-400 hover:text-stone-600">
              + Add
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple
                onChange={handleGallerySelect}
                disabled={galleryUploading}
                className="hidden"
              />
            </label>
          </div>
          {galleryUploading && <p className="mt-1 font-mono text-xs text-stone-400">Uploading…</p>}
          {galleryError && <p className="mt-1 text-xs text-red-600">{galleryError}</p>}
        </div>
      </div>

      <div className={sectionClass}>
        <p className={sectionTitleClass}>Basic details</p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="relative">
            <label className={labelClass}>Name</label>
            <input
              type="text"
              required
              autoComplete="off"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setTimeout(() => setNameFocused(false), 150)}
              placeholder="e.g. iPhone 15 Pro Max"
              className={inputClass}
            />
            {nameFocused && nameSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 top-full z-10 mt-1.5 max-h-56 overflow-y-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg">
                {nameSuggestions.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => {
                      update('name', s);
                      setNameFocused(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className={labelClass}>Brand</label>
            <select
              required
              value={form.brand}
              onChange={(e) => update('brand', e.target.value)}
              className={inputClass}
            >
              <option value="" disabled>
                Select brand
              </option>
              {brandsFor(form.category).map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value={OTHER_BRAND}>Other…</option>
            </select>
            {form.brand === OTHER_BRAND && (
              <input
                type="text"
                required
                value={form.brandCustom}
                onChange={(e) => update('brandCustom', e.target.value)}
                placeholder="Type the brand name"
                className={inputClass}
              />
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Category</label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className={inputClass}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Condition</label>
            <select
              value={form.condition}
              onChange={(e) => update('condition', e.target.value)}
              className={inputClass}
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {conditionLabel(c)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <label className={labelClass}>
              Product details <span className="font-normal text-stone-400">(optional)</span>
            </label>
            {canAutoGenerate && (
              <button
                type="button"
                onClick={handleAutoGenerate}
                className="mt-1.5 rounded-full border border-stone-200 px-3 py-1 text-xs font-medium text-stone-600 transition hover:border-stone-900 hover:text-stone-900"
              >
                Auto-generate
              </button>
            )}
          </div>
          <textarea
            rows={5}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder={'Describe the product — battery health, what\'s in the box, warranty, any scratches, etc.\nPress Enter for a new line.'}
            className={`${inputClass} resize-y`}
          />
          <p className="mt-1 text-xs text-stone-400">
            {canAutoGenerate
              ? 'Auto-filled from the model, condition, storage and colours you pick — review it, then edit freely. Once you change the text, it stops auto-updating (use Auto-generate to rebuild it).'
              : 'Shown on the product page under the price and stock. Auto-fill works for phones and laptops once you enter a name.'}
          </p>
        </div>
      </div>

      <div className={sectionClass}>
        <p className={sectionTitleClass}>Pricing &amp; inventory</p>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Price (₦)</label>
            <input
              type="number"
              step="1"
              min="0"
              required
              value={form.price}
              onChange={(e) => update('price', e.target.value)}
              className={inputClass}
            />
            {Number.isFinite(priceNum) && form.price.trim() !== '' && (
              <p className="mt-1.5 font-mono text-xs text-stone-400">{formatNaira(priceNum)}</p>
            )}
          </div>
          <div>
            <label className={labelClass}>Stock (units)</label>
            <input
              type="number"
              step="1"
              min="0"
              required
              value={form.unitStock}
              onChange={(e) => update('unitStock', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Rating (0–5)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="5"
              placeholder="e.g. 4.5"
              value={form.rating}
              onChange={(e) => update('rating', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Review count</label>
            <input
              type="number"
              step="1"
              min="0"
              placeholder="e.g. 128"
              value={form.reviews}
              onChange={(e) => update('reviews', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {visibleFields.length > 0 && (
        <div className={sectionClass}>
          <p className={sectionTitleClass}>Specifications</p>

          {specFields.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2">
              {specFields.map((key) => (
                <div key={key}>
                  <label className={labelClass}>{FIELD_LABELS[key]}</label>
                  {key === 'storage' && (
                    <select value={form.storage} onChange={(e) => update('storage', e.target.value)} className={inputClass}>
                      <option value="">Select storage</option>
                      {STORAGE_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  )}
                  {key === 'cardSlot' && (
                    <select value={form.cardSlot} onChange={(e) => update('cardSlot', e.target.value)} className={inputClass}>
                      <option value="">Select</option>
                      {CARD_SLOT_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  )}
                  {key === 'operatingSystem' && (
                    <select
                      value={form.operatingSystem}
                      onChange={(e) => update('operatingSystem', e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select OS</option>
                      {OS_OPTIONS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  )}
                  {key === 'inches' && (
                    <input
                      type="text"
                      value={form.inches}
                      onChange={(e) => update('inches', e.target.value)}
                      placeholder='e.g. 15.6"'
                      className={inputClass}
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {visibleFields.includes('colorOption') && (
            <div>
              <label className={labelClass}>Color Option</label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  value={form.colorInput}
                  onChange={(e) => update('colorInput', e.target.value)}
                  onKeyDown={handleColorKeyDown}
                  placeholder="Type a color, e.g. Space Grey, then press Enter"
                  className={inputClass + ' mt-0'}
                />
                <button
                  type="button"
                  onClick={addColorChip}
                  className="shrink-0 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100"
                >
                  Add
                </button>
              </div>

              {form.colors.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {form.colors.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white py-1.5 pl-1.5 pr-3 text-xs font-medium text-stone-700 shadow-sm"
                    >
                      <span
                        className="h-5 w-5 rounded-full border border-stone-300"
                        style={{ backgroundColor: swatchFor(c) }}
                      />
                      {c}
                      <button
                        type="button"
                        onClick={() => removeColorChip(c)}
                        aria-label={`Remove ${c}`}
                        className="ml-0.5 text-stone-400 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 font-mono text-xs text-stone-400">No color options added yet.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 border-t border-stone-100 pt-7">
        <button
          type="submit"
          disabled={saving || uploading || galleryUploading}
          className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 active:scale-[0.98] disabled:opacity-50"
        >
          {saving ? 'Saving…' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/products')}
          className="text-sm font-medium text-stone-500 hover:text-stone-900"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
