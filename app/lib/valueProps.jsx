// Shared "why shop with us" content — used on the homepage and the About
// page so the two stay in sync instead of drifting apart as separate copies.

export const COLOR_MAP = {
  sky: { bg: 'bg-sky-500/15', text: 'text-sky-500', ring: 'ring-sky-400/30' },
  violet: { bg: 'bg-violet-500/15', text: 'text-violet-500', ring: 'ring-violet-400/30' },
  amber: { bg: 'bg-amber-500/15', text: 'text-amber-500', ring: 'ring-amber-400/30' },
  emerald: { bg: 'bg-emerald-500/15', text: 'text-emerald-500', ring: 'ring-emerald-400/30' },
  rose: { bg: 'bg-rose-500/15', text: 'text-rose-500', ring: 'ring-rose-400/30' },
  cyan: { bg: 'bg-cyan-500/15', text: 'text-cyan-500', ring: 'ring-cyan-400/30' },
};

export const VALUE_PROPS = [
  {
    title: 'Bulk pricing',
    desc: 'Better unit prices the more you buy',
    color: 'emerald',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M20.6 12.3L12.7 4.4a2 2 0 0 0-1.4-.6H5a2 2 0 0 0-2 2v6.3c0 .5.2 1 .6 1.4l7.9 7.9c.8.8 2 .8 2.8 0l6.3-6.3c.8-.8.8-2 0-2.8Z" />
        <circle cx="7.5" cy="7.5" r="1" />
      </svg>
    ),
  },
  {
    title: 'Verified condition',
    desc: 'Every unit checked & graded before listing',
    color: 'sky',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3Z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Fast delivery',
    desc: 'Quick dispatch, tracked every step',
    color: 'amber',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M13 3 4 14h6l-1 7 9-11h-6l1-7Z" />
      </svg>
    ),
  },
  {
    title: 'Secure payment',
    desc: 'Paystack checkout, protected & encrypted',
    color: 'cyan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="4" y="10" width="16" height="10" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    ),
  },
];
