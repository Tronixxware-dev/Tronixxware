import Link from 'next/link';
import ScrollReveal from '../components/ScrollReveal';
import { COLOR_MAP, VALUE_PROPS } from '../lib/valueProps';

export const metadata = {
  title: 'About — Tronixxware',
  description: 'Who Tronixxware is and why people buy their phones and laptops from us.',
};

const TECH_DEPARTMENTS = [
  {
    title: 'Web & app development',
    desc: 'Full-stack web and mobile products, built end to end.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="m9 8-4 4 4 4" />
        <path d="m15 8 4 4-4 4" />
      </svg>
    ),
  },
  {
    title: 'Cybersecurity',
    desc: 'Securing systems, data and devices against real-world threats.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <path d="M12 2l8 3v6c0 5-3.4 8.5-8 11-4.6-2.5-8-6-8-11V5l8-3Z" />
        <rect x="9.5" y="11" width="5" height="4" rx="1" />
        <path d="M10.5 11V9.5a1.5 1.5 0 0 1 3 0V11" />
      </svg>
    ),
  },
  {
    title: 'Embedded systems & IoT',
    desc: 'Firmware and hardware design for connected devices.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <rect x="7" y="7" width="10" height="10" rx="1.5" />
        <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
      </svg>
    ),
  },
];

export default function AboutPage() {
  return (
    <main className="bg-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#02161a] via-[#010a0c] to-[#052128]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(34,211,238,0.18),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 bg-black/35" />
        <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 text-center sm:px-10 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-widest text-cyan-300">
            Tronixxware / About
          </p>
          <h1 className="mt-3 font-eurostile text-3xl font-bold leading-tight text-white sm:text-4xl">
            Genuine tech, straight from source to you.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-white/70 sm:text-base">
            Tronixxware started with a simple frustration: too many people get burned buying
            phones and laptops from sellers they can&apos;t trust. We set out to fix that — by
            the unit, or in bulk.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="font-mono text-xs uppercase tracking-widest text-stone-400">Our story</p>
          <h2 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
            Not just a gadget store.
          </h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-stone-600 sm:text-base">
            <p>
              Tronixxware started as a place to buy genuine phones and laptops — by the unit or
              in bulk — without the usual guesswork. Every device that comes through is checked
              and graded before it&apos;s listed, so what you see on the product page is what
              arrives at your door.
            </p>
            <p>
              But retail is only one part of what we do. Behind the storefront, the Tronixxware
              team works across web and app development, cybersecurity, and embedded
              systems/IoT — building and securing the kind of technology that powers the
              devices we sell, not just reselling them.
            </p>
            <p>
              We&apos;re also affiliated with a tech school, and regularly refer students there
              who want hands-on training in web development, cybersecurity, or embedded systems
              and IoT.
            </p>
          </div>
        </ScrollReveal>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
        <ScrollReveal>
          <p className="text-center font-mono text-xs uppercase tracking-widest text-stone-400">
            Beyond the store
          </p>
          <h2 className="mt-2 text-center text-2xl font-semibold text-stone-900 sm:text-3xl">
            Other tech departments we work in
          </h2>
        </ScrollReveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {TECH_DEPARTMENTS.map((dept, i) => (
            <ScrollReveal
              key={dept.title}
              delay={i * 100}
              className="rounded-2xl border border-stone-200 p-5"
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600">
                {dept.icon}
              </span>
              <p className="text-sm font-semibold text-stone-900">{dept.title}</p>
              <p className="mt-1 text-xs text-stone-500">{dept.desc}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section className="border-y border-stone-200 bg-stone-50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <ScrollReveal>
            <h2 className="text-center text-sm font-semibold uppercase tracking-wide text-stone-500">
              Why people shop with us
            </h2>
          </ScrollReveal>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {VALUE_PROPS.map((prop, i) => {
              const c = COLOR_MAP[prop.color];
              return (
                <ScrollReveal
                  key={prop.title}
                  delay={i * 100}
                  className="rounded-2xl border border-stone-200 bg-white p-4"
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
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <ScrollReveal>
          <h2 className="text-2xl font-semibold text-stone-900 sm:text-3xl">
            Ready to find your next device?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-stone-500 sm:text-base">
            Browse genuine phones and laptops, by the unit or in bulk.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-block rounded-full bg-stone-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-700"
          >
            Shop all products
          </Link>
        </ScrollReveal>
      </section>
    </main>
  );
}
