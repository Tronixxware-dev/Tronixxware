const TOKEN_KEY = 'tronixxware-admin-token';

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
    // ignore storage errors
  }
}

export function clearAdminToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {
    // ignore storage errors
  }
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function adminFetch(path, options = {}) {
  const token = getAdminToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  return res;
}