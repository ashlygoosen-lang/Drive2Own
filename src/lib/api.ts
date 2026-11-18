const TOKEN_KEY = 'd2o_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

const BASE = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ?? '';

export async function api<T = unknown>(
  path: string,
  opts: { method?: string; body?: unknown; form?: FormData } = {},
): Promise<T> {
  const headers: Record<string, string> = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let body: BodyInit | undefined;
  if (opts.form) body = opts.form;
  else if (opts.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(opts.body);
  }
  const res = await fetch(`${BASE}/api${path}`, { method: opts.method ?? 'GET', headers, body });
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? 'Something went wrong');
  return data as T;
}

export const assetUrl = (u: string | null | undefined) => (u ? `${BASE}${u}` : null);

/** Fetch a private document with the auth header and open it in a new tab. */
export async function openDocument(id: number) {
  const res = await fetch(`${BASE}/api/documents/${id}/file`, { headers: { Authorization: `Bearer ${getToken()}` } });
  if (!res.ok) throw new ApiError(res.status, 'Could not open document');
  const url = URL.createObjectURL(await res.blob());
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export type Role = 'owner' | 'driver';
export type Platform = 'uber' | 'indrive' | 'bolt';
export const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'uber', label: 'Uber' },
  { id: 'indrive', label: 'inDrive' },
  { id: 'bolt', label: 'Bolt' },
];
export const platformLabel = (p: string) => PLATFORMS.find((x) => x.id === p)?.label ?? p;

export interface User {
  id: number; role: Role; fullName: string; phone: string; email: string | null;
  city: string; platforms: Platform[]; createdAt: string;
}
export interface Vehicle {
  id: number; ownerId: number; ownerName?: string; make: string; model: string; year: number; plate?: string;
  color: string; seats: number; fuel: string; transmission: string; city: string; weeklyRate: number;
  deposit: number; platforms: Platform[]; description: string; imageUrl: string | null;
  status: 'available' | 'rented' | 'hidden';
}
export type RentalStatus = 'pending' | 'approved' | 'declined' | 'active' | 'completed' | 'cancelled';
export interface Rental {
  id: number; status: RentalStatus; platform: Platform; startDate: string; weeks: number;
  weeklyRate: number; deposit: number; total: number; message: string; createdAt: string;
  vehicle: { id: number; make: string; model: string; year: number; color: string; imageUrl: string | null };
  owner: { id: number; name: string; phone: string | null };
  driver: { id: number; name: string; phone: string | null };
}
export interface Payment {
  id: number; rentalId: number; kind: 'deposit' | 'weekly'; amount: number; dueDate: string;
  status: 'pending' | 'paid' | 'overdue' | 'cancelled'; paidAt: string | null;
}
export interface Doc { id: number; type: string; name: string; size: number; mime: string; uploadedAt: string }
export interface DocType { type: string; label: string; required: boolean }

export const money = (n: number) => `R ${n.toLocaleString('en-ZA')}`;
