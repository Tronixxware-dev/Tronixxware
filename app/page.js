import { Suspense } from 'react';
import Link from 'next/link';
import { categories, getProducts } from './lib/products';
import ShopClient from './components/ShopClient';
import HeroVisual from './components/HeroVisual';
import ScrollReveal from './components/ScrollReveal';
import { COLOR_MAP, VALUE_PROPS } from './lib/valueProps';

// The homepage only teases the catalog — capped at 12 items — since the
// full, filterable listing now lives on its own page at /products.
const HOMEPAGE_PRODUCT_LIMIT = 12;

import {
  phoneImage,
  laptopImage,
  earbudsImage,
  watchImage,
  macbookImage,
  ps5Image,
  vrImage,
  speaker1Image,
  speaker2Image,
  speaker3Image,
} from './lib/heroImages';
import {
  phonesCategoryImage,
  laptopsCategoryImage,
  watchesCategoryImage,
  headphonesCategoryImage,
  gamingCategoryImage,
  powerbanksCategoryImage,
} from './lib/categoryImages';

const HERO_IMAGES = [
  phoneImage,
  laptopImage,
  earbudsImage,
  watchImage,
  macbookImage,
  ps5Image,
  vrImage,
  speaker1Image,
  speaker2Image,
  speaker3Image,
];
const CATEGORY_TILES = [
  {
    name: 'Phones',
    desc: 'Flagship & budget smartphones',
    href: '/products?category=phones',
    color: 'sky',
    image: phonesCategoryImage,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="7" y="2" width="10" height="20" rx="2.5" />
        <line x1="11" y1="18" x2="13" y2="18" />
      </svg>
    ),
  },
  {
    name: 'Laptops',
    desc: 'Work, gaming & everyday laptops',
    href: '/products?category=laptops',
    color: 'violet',
    image: laptopsCategoryImage,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="4" width="18" height="12" rx="1.5" />
        <path d="M2 19h20" />
      </svg>
    ),
  },
  {
    name: 'Watches',
    desc: 'Smartwatches & wearables',
    href: '/products?category=watches',
    color: 'amber',
    image: watchesCategoryImage,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <circle cx="12" cy="12" r="6" />
        <path d="M12 9v3l2 1.5" />
        <path d="M9 3h6M9 21h6" />
      </svg>
    ),
  },
  {
    name: 'Headphones',
    desc: 'Earbuds, over-ear & gaming audio',
    href: '/products?category=headphones',
    color: 'cyan',
    image: headphonesCategoryImage,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
        <rect x="2" y="14" width="5" height="7" rx="1.5" />
        <rect x="17" y="14" width="5" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    name: 'Gaming',
    desc: 'Consoles & gaming gear',
    href: '/products?category=gaming',
    color: 'violet',
    image: gamingCategoryImage,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="2" y="7" width="20" height="11" rx="4" />
        <path d="M7 11v3M5.5 12.5h3" />
        <circle cx="15.5" cy="10.5" r="1" />
        <circle cx="18" cy="13" r="1" />
      </svg>
    ),
  },
  {
    name: 'Powerbanks',
    desc: 'Chargers & portable power',
    href: '/products?category=powerbanks',
    color: 'emerald',
    image: powerbanksCategoryImage,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <path d="M4 13a8 8 0 0 1 16 0" />
        <rect x="2" y="13" width="4" height="6" rx="1.5" />
        <rect x="18" y="13" width="4" height="6" rx="1.5" />
      </svg>
    ),
  },
];

const BRANDS = ['Apple', 'Samsung', 'Google', 'Dell', 'Lenovo', 'HP', 'Infinix', 'Tecno', 'Asus', 'Xiaomi'];

export default async function Home() {
  const allProducts = await getProducts();
  const products = allProducts.slice(0, HOMEPAGE_PRODUCT_LIMIT);

  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02161a] via-[#010a0c] to-[#052128]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,0.18),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-black/35" />
        <div className="relative z-10">
          <div className="mx-auto max-w-7xl px-6 pt-4 sm:px-10 sm:pt-6">
            <div className="mx-auto max-w-xl text-center">
              <h1 className="hero-sparkle font-eurostile text-3xl font-bold leading-tight text-white sm:text-4xl">
                Genuine devices. Zero regrets.
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-white/70 sm:text-base">
                Every phone and laptop checked for condition before it&apos;s listed.
              </p>
            </div>
          </div>
          <div className="relative mt-2 h-[320px] w-full sm:mt-3 sm:h-[420px]">
            <HeroVisual images={HERO_IMAGES} />
          </div>
          <div className="mx-auto max-w-7xl px-6 pb-4 sm:px-10 sm:pb-6">
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/products"
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-cyan-300"
              >
                Shop all products
              </Link>
              <Link
                href="/products?category=phones"
                className="rounded-full border border-cyan-300/50 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-cyan-300/80 hover:bg-cyan-400/10"
              >
                Browse phones
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-stone-500">Shop by category</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3">
          {CATEGORY_TILES.map((tile) => {
            const c = COLOR_MAP[tile.color];
            if (tile.image) {
              return (
                <Link
                  key={tile.name}
                  href={tile.href}
                  className="group relative h-[190px] w-full overflow-hidden rounded-3xl sm:h-[300px]"
                >
                  <img
                    src={tile.image}
                    alt={tile.name}
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 via-45% to-black/0 transition duration-500 group-hover:from-black" />
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100" style={{ boxShadow: 'inset 0 0 0 1.5px rgba(34,211,238,0.6), 0 0 24px rgba(34,211,238,0.35)' }} />
                  <div className="relative flex h-full flex-col justify-end gap-1 p-4">
                    <p className="text-sm font-semibold text-white sm:text-base" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.95), 0 1px 14px rgba(0,0,0,0.7)' }}>{tile.name}</p>
                    <p className="text-xs text-white/90 transition duration-500 group-hover:text-white sm:text-sm" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.95), 0 1px 14px rgba(0,0,0,0.7)' }}>{tile.desc}</p>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-cyan-300 opacity-0 transition duration-300 group-hover:opacity-100" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
                      Shop now
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 transition group-hover:translate-x-0.5">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </span>
                  </div>
                </Link>
              );
            }
            return (
              <Link
                key={tile.name}
                href={tile.href}
                className="group flex w-full flex-col items-start gap-3 rounded-3xl border border-stone-200 bg-stone-50 p-4 transition hover:border-stone-300 hover:shadow-md"
              >
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${c.bg} ${c.text} ring-1 ${c.ring}`}>
                  {tile.icon}
                </span>
                <div>
                  <p className="text-sm font-semibold text-stone-900">{tile.name}</p>
                  <p className="text-xs text-stone-500">{tile.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-6 border-y border-stone-800 bg-black py-4">
        <div className="marquee-track">
          <div className="marquee-scroll flex items-center gap-10 px-6">
            {[...BRANDS, ...BRANDS].map((brand, i) => (
              <span key={`${brand}-${i}`} className="whitespace-nowrap text-sm font-semibold uppercase tracking-wide text-white">
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="shop" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Suspense fallback={null}>
          <ShopClient
            products={products}
            categories={categories.filter((c) => c.id !== 'all')}
          />
        </Suspense>

        <div className="mt-8 flex justify-center">
          <Link
            href="/products"
            className="rounded-full border border-stone-300 px-6 py-2.5 text-sm font-semibold text-stone-900 transition hover:border-stone-900"
          >
            View all products
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {VALUE_PROPS.map((prop, i) => {
            const c = COLOR_MAP[prop.color];
            return (
              <ScrollReveal
                key={prop.title}
                delay={i * 100}
                className="rounded-2xl border border-stone-200 p-4"
              >
                <span className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${c.bg} ${c.text}`}>
                  {prop.icon}
                </span>
                <p className="text-sm font-semibold text-stone-900">{prop.title}</p>
                <p className="mt-1 text-xs text-stone-500">{prop.desc}</p>
              </ScrollReveal>
            );
          })}
        </div>
      </section>

      <style>{`
        .hero-sparkle { animation: glow-pulse 2.6s ease-in-out infinite; }
        @keyframes glow-pulse {
          0%, 100% { text-shadow: 0 0 0px rgba(34,211,238,0); }
          50% { text-shadow: 0 0 8px rgba(34,211,238,0.9), 0 0 18px rgba(34,211,238,0.5); }
        }
        .twinkle { animation: twinkle 1.8s ease-in-out infinite; }
        @keyframes twinkle {
          0%, 100% { opacity: 0.15; transform: scale(0.6); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        .cyan-glow { box-shadow: 0 0 30px rgba(34,211,238,0.2); }
        .float-slow { animation: float-slow 5s ease-in-out infinite; }
        .float-slower { animation: float-slower 7s ease-in-out infinite; }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }
        .marquee-track { overflow: hidden; }
        .marquee-scroll { animation: marquee-scroll 22s linear infinite; width: max-content; }
        .marquee-track:hover .marquee-scroll { animation-play-state: paused; }
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </main>
  );
}