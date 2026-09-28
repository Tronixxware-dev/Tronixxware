'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'tronixxware_admin_token';

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // worst case the admin just has to log in again next request
  }
}

export function clearAdminToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore
  }
}

export async function adminLogin(email, password) {
  const res = await fetch(`${API_URL}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setAdminToken(data.token);
  return data;
}

export function adminLogout() {
  clearAdminToken();
  if (typeof window !== 'undefined') {
    window.location.href = '/admin/login';
  }
}

// Wraps fetch for admin-only endpoints: attaches the bearer token, and
// bounces to the login page if it's missing, invalid, or expired.
export async function adminFetch(path, options = {}) {
  const token = getAdminToken();

  if (!token) {
    adminLogout();
    throw new Error('Not logged in');
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401 || res.status === 403) {
    adminLogout();
    throw new Error('Your admin session expired — please log in again');
  }

  return res;
}