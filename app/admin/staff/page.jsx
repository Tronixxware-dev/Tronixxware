'use client';

import { useEffect, useState } from 'react';
import { adminFetch, getAdminEmail } from '../../lib/admin-auth';

// Keep in sync with the ROLES list on the backend (controllers/adminController.js).
const ROLES = [
  { value: 'superadmin', label: 'Superadmin — full access' },
  { value: 'product_uploader', label: 'Product Uploader — manage products only' },
];

function roleLabel(role) {
  return ROLES.find((r) => r.value === role)?.label || role;
}

const inputClass =
  'mt-1.5 w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-900 shadow-sm transition focus:border-stone-900 focus:outline-none focus:ring-4 focus:ring-stone-900/5';
const labelClass = 'block text-sm font-medium text-stone-700';

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('product_uploader');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState('');

  const myEmail = getAdminEmail();

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/api/admin/staff');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load staff accounts');
      setStaff(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setFormError('');
    setCreating(true);
    try {
      const res = await adminFetch('/api/admin/staff', {
        method: 'POST',
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create staff account');
      setStaff((prev) => [data, ...prev]);
      setEmail('');
      setPassword('');
      setRole('product_uploader');
    } catch (err) {
      setFormError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id, accountEmail) {
    if (!window.confirm(`Remove staff account "${accountEmail}"? This can't be undone.`)) return;
    try {
      const res = await adminFetch(`/api/admin/staff/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to remove staff account');
      setStaff((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-stone-900">Staff</h1>
      <p className="mt-1 text-sm text-stone-500">
        Create limited-access logins for people helping you run the store.
      </p>

      <form
        onSubmit={handleCreate}
        className="mt-6 grid gap-4 rounded-2xl border border-stone-200 bg-white p-6 sm:grid-cols-3"
      >
        <div>
          <label className={labelClass}>Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="staff@example.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Role</label>
          <select value={role} onChange={(e) => setRole(e.target.value)} className={inputClass}>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 sm:col-span-3">
            {formError}
          </div>
        )}

        <div className="sm:col-span-3">
          <button
            type="submit"
            disabled={creating}
            className="rounded-xl bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:opacity-50"
          >
            {creating ? 'Creating…' : 'Create staff account'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="mt-8">
        {loading ? (
          <p className="font-mono text-sm text-stone-400">Loading…</p>
        ) : (
          <div className="space-y-3">
            {staff.map((s) => (
              <div
                key={s._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4"
              >
                <div>
                  <p className="text-sm font-medium text-stone-900">
                    {s.email}
                    {s.email === myEmail && (
                      <span className="ml-2 font-mono text-[10px] uppercase tracking-wider text-stone-400">
                        (you)
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 font-mono text-xs uppercase tracking-wider text-stone-500">
                    {roleLabel(s.role)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(s._id, s.email)}
                  disabled={s.email === myEmail}
                  className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-500 hover:border-red-300 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Remove
                </button>
              </div>
            ))}

            {staff.length === 0 && (
              <p className="font-mono text-sm text-stone-400">No staff accounts yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
