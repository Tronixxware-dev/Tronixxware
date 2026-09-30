import { Inter, IBM_Plex_Mono, Orbitron } from 'next/font/google';
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
// Eurostile Extended Bold is a commercial typeface with no free-license
// source, so Orbitron (a geometric, extended, heavy-weight sans with a
// similar squared/industrial feel) stands in for it on the logo and hero.
const eurostile = Orbitron({
  subsets: ['latin'],
  weight: ['700', '800', '900'],
  variable: '--font-eurostile',
});

export const metadata = {
  title: 'Tronixxware',
  description: 'Phones and laptops — by the unit or in bulk.',
};

export default async function RootLayout({ children }) {
  const products = await getProducts();

  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable} ${eurostile.variable}`}>
      <body className="bg-white font-sans text-stone-900 antialiased">
        <CartProvider>
          <Header products={products} />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}