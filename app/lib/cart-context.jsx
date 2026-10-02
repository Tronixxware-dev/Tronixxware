'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'tronixxware-cart';

function loadCart() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items, hydrated]);

  function addItem(product, quantity) {
    setItems((prev) => {
      const lineId = `${product.id}::${product.colorOption || 'default'}`;
      const existing = prev.find((line) => line.lineId === lineId);
      const maxStock = product.unitStock;

      if (existing) {
        return prev.map((line) =>
          line.lineId === lineId
            ? { ...line, quantity: Math.min(maxStock, line.quantity + quantity) }
            : line
        );
      }

      return [
        ...prev,
        {
          lineId,
          id: product.id,
          name: product.name,
          brand: product.brand,
          image: product.image,
          price: product.price,
          colorName: product.colorOption || null,
          maxStock,
          quantity: Math.min(maxStock, quantity),
        },
      ];
    });
  }

  function updateQuantity(lineId, quantity) {
    setItems((prev) =>
      prev.map((line) =>
        line.lineId === lineId
          ? { ...line, quantity: Math.max(1, Math.min(line.maxStock, quantity)) }
          : line
      )
    );
  }

  function removeItem(lineId) {
    setItems((prev) => prev.filter((line) => line.lineId !== lineId));
  }

  function clearCart() {
    setItems([]);
  }

  const itemCount = items.reduce((sum, line) => sum + line.quantity, 0);

  const subtotal = items.reduce((sum, line) => sum + line.price * line.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, updateQuantity, removeItem, clearCart, itemCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return ctx;
}