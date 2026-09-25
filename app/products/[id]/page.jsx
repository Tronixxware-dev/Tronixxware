import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductById, getProducts } from '../../lib/products';
import ProductCard from '../../components/ProductCard';
import ProductDetailClient from '../../components/ProductDetailClient';

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return {};
  return {
    title: `${product.name} | Tronixxware`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <nav className="mb-6 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-stone-400">
          <Link href="/" className="hover:text-stone-900">
            Home
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-stone-900">
            Shop
          </Link>
          <span>/</span>
          <span className="normal-case tracking-normal text-stone-600">
            {product.name}
          </span>
        </nav>

        <ProductDetailClient product={product} />

        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="text-xl font-semibold text-stone-900">
              You might also like
            </h2>
            <div className="mt-6 grid grid-cols-2 gap-6 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}