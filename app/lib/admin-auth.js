'use client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'tronixxware_admin_token';
const ROLE_KEY = 'tronixxware_admin_role';
const EMAIL_KEY = 'tronixxware_admin_email';

export function getAdminToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
}

// The admin's role ('superadmin' | 'product_uploader') — stored alongside
// the token at login so the UI can gate nav links and page access without
// having to decode the JWT on every render.
export function getAdminRole() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ROLE_KEY);
}

export function setAdminRole(role) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ROLE_KEY, role);
}

export function getAdminEmail() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(EMAIL_KEY);
}

export function setAdminEmail(email) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EMAIL_KEY, email);
}

export function isSuperAdmin() {
  return getAdminRole() === 'superadmin';
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(EMAIL_KEY);
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
  if (data.role) setAdminRole(data.role);
  if (data.email) setAdminEmail(data.email);
  return data;
}

export function adminLogout() {
  clearAdminToken();
}

// Wraps fetch with the admin Bearer token attached. Leaves Content-Type
// alone when the body is FormData (e.g. an image upload) — the browser
// needs to set its own multipart boundary, which a hardcoded
// "application/json" header would break.
export async function adminFetch(path, options = {}) {
  const token = getAdminToken();
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearAdminToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }

  return res;
}

// Uploads a single image file for a product and returns its hosted URL.
export async function adminUploadImage(file) {
  const formData = new FormData();
  formData.append('image', file);

  const res = await adminFetch('/api/products/upload-image', {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Image upload failed');
  return data.url;
}