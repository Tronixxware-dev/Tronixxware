// Shared helpers for the product "condition" field. The admin form stores
// 'New' | 'Refurbished' | 'Used' | 'LLA'; shoppers should see "Brand new"
// instead of the bare word "New", and "Grade A (used)" instead of "Used".

// Collapse whatever was saved on older products ("New", "new", "Brand New",
// "brand-new", " USED ", "LL/A"...) into one of:
// 'new' | 'used' | 'refurbished' | 'lla' | ''.
export function normalizeCondition(condition) {
  const c = String(condition || '')
    .toLowerCase()
    .replace(/[-_]/g, ' ')
    .trim();
  if (!c) return '';
  if (c === 'new' || c === 'brand new') return 'new';
  if (c.startsWith('refurb')) return 'refurbished';
  if (c === 'lla' || c === 'll/a' || c === 'll a') return 'lla';
  if (c === 'used' || c === 'second hand' || c === 'secondhand' || c === 'fairly used') return 'used';
  return c;
}

export function conditionLabel(condition) {
  const c = normalizeCondition(condition);
  if (!c) return '';
  if (c === 'new') return 'Brand new';
  if (c === 'used') return 'Grade A (used)';
  if (c === 'refurbished') return 'Refurbished';
  if (c === 'lla') return 'LLA';
  return condition;
}

// Small text colour + dot colour for the condition line in the product grid.
export function conditionTextClasses(condition) {
  const c = normalizeCondition(condition);
  if (c === 'new') return { text: 'text-emerald-700', dot: 'bg-emerald-500' };
  if (c === 'refurbished') return { text: 'text-violet-700', dot: 'bg-violet-500' };
  if (c === 'lla') return { text: 'text-indigo-700', dot: 'bg-indigo-500' };
  // Grade A (used) — dark cyan
  return { text: 'text-cyan-800', dot: 'bg-cyan-700' };
}

// Badge colours so brand-new and used items are told apart at a glance.
export function conditionBadgeClasses(condition) {
  const c = normalizeCondition(condition);
  if (c === 'new') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (c === 'refurbished') return 'border-violet-200 bg-violet-50 text-violet-700';
  if (c === 'lla') return 'border-indigo-200 bg-indigo-50 text-indigo-700';
  // Grade A (used) — dark cyan
  return 'border-cyan-300 bg-cyan-50 text-cyan-800';
}

// Filter chips shown on the shop page. "LLA" is always offered next to Brand
// new and Grade A; "Refurbished" only appears when at least one product
// actually uses it.
export function conditionFilterOptions(products) {
  const options = [
    { id: 'all', label: 'All' },
    { id: 'new', label: 'Brand new' },
    { id: 'used', label: 'Grade A (used)' },
    { id: 'lla', label: 'LLA' },
  ];
  if (products.some((p) => normalizeCondition(p.condition) === 'refurbished')) {
    options.push({ id: 'refurbished', label: 'Refurbished' });
  }
  return options;
}
