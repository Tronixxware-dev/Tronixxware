const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const categories = [
  { id: 'all', label: 'All' },
  { id: 'phones', label: 'Phones' },
  { id: 'laptops', label: 'Laptops' },
  { id: 'watches', label: 'Watches' },
  { id: 'headphones', label: 'Headphones' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'accessories', label: 'Accessories' },
  { id: 'powerbanks', label: 'Powerbanks' },
];

export async function getProducts() {
  const res = await fetch(`${API_URL}/api/products`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch products from the backend');
  }
  return res.json();
}

export async function getProductById(id) {
  const res = await fetch(`${API_URL}/api/products/${id}`, { cache: 'no-store' });
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error('Failed to fetch product from the backend');
  }
  return res.json();
}