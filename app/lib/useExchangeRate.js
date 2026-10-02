'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

let cachedRate = null;
let inFlight = null;

async function fetchRate() {
  if (cachedRate) return cachedRate;
  if (!inFlight) {
    inFlight = fetch(`${API_URL}/api/exchange-rate`)
      .then((res) => res.json())
      .then((data) => {
        cachedRate = data.usdToNgn || null;
        return cachedRate;
      })
      .catch(() => null)
      .finally(() => {
        inFlight = null;
      });
  }
  return inFlight;
}

// Shared across every component that needs a Naira price: the first
// component to mount kicks off the fetch, everyone else reuses the same
// in-flight promise or the cached result, so we never hit the backend
// more than once per page load.
export function useExchangeRate() {
  const [rate, setRate] = useState(cachedRate);

  useEffect(() => {
    let mounted = true;
    if (cachedRate) {
      setRate(cachedRate);
      return;
    }
    fetchRate().then((r) => {
      if (mounted) setRate(r);
    });
    return () => {
      mounted = false;
    };
  }, []);

  return rate; // null while the rate is still loading
}

// Prices are stored directly in Naira now (no USD + live-rate conversion),
// so this just formats the number — no rate needed or used.
export function formatNaira(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '···';
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}