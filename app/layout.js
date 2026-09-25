import { Inter, IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import Header from './components/Header';
import { CartProvider } from './lib/cart-context';
import { getProducts } from './lib/products';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
});

export const metadata = {
  title: 'Tronixxware',
  description: 'Phones and laptops — by the unit or in bulk.',
};

export default async function RootLayout({ children }) {
  const products = await getProducts();

  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body className="bg-white font-sans text-stone-900 antialiased">
        <CartProvider>
          <Header products={products} />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}