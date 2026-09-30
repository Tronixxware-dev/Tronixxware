'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'tronixxware-customer-token';
const CUSTOMER_KEY = 'tronixxware-customer';

export function getCustomerToken() {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function getStoredCustomer() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CUSTOMER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setSession(token, customer) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
}

export function clearCustomerSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(CUSTOMER_KEY);
}

export async function customerRegister({ identifier, password, fullName }) {
  const res = await fetch(`${API_URL}/api/customers/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password, fullName }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create account');
  setSession(data.token, data.customer);
  return data.customer;
}

export async function customerLogin({ identifier, password }) {
  const res = await fetch(`${API_URL}/api/customers/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to log in');
  setSession(data.token, data.customer);
  return data.customer;
}

export function customerLogout() {
  clearCustomerSession();
}

// Drop-in replacement for fetch() that talks to the API, attaches the
// customer's token when one exists, and clears a stale/expired session on
// a 401 so the UI can fall back to "log in again" instead of looping.
export async function customerFetch(path, options = {}) {
  const token = getCustomerToken();
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (res.status === 401) {
    clearCustomerSession();
  }
  return res;
}