import { categories, getProducts } from '../lib/products';
import ShopClient from '../components/ShopClient';

export const metadata = {
  title: 'Shop | Tronixxware',
  description: 'Shop phones and laptops by the unit or in bulk.',
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-white px-4 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-xs uppercase tracking-widest text-stone-400">
          Tronixxware / Shop
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-stone-900 sm:text-3xl">
          All products
        </h1>

        <div className="mt-8">
          <ShopClient products={products} categories={categories} />
        </div>
      </div>
    </main>
  );
}