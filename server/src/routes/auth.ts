import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth, signToken } from '../auth.js';
import { HttpError } from '../errors.js';
import { PLATFORMS, ROLES } from '../constants.js';

export const authRouter = Router();

export function normalizePhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('27')) return `+${d}`;
  if (d.startsWith('0')) return `+27${d.slice(1)}`;
  return `+27${d}`;
}

interface UserRow {
  id: number; role: 'owner' | 'driver'; full_name: string; phone: string;
  email: string | null; city: string; platforms: string; password_hash: string; created_at: string;
}

export const publicUser = (u: UserRow) => ({
  id: u.id, role: u.role, fullName: u.full_name, phone: u.phone, email: u.email,
  city: u.city, platforms: JSON.parse(u.platforms) as string[], createdAt: u.created_at,
});

const registerSchema = z.object({
  role: z.enum(ROLES),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(9).max(20),
  email: z.string().trim().email().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  city: z.string().trim().min(2).max(60).default('Cape Town'),
  platforms: z.array(z.enum(PLATFORMS)).default([]),
});

authRouter.post('/register', (req, res) => {
  const b = registerSchema.parse(req.body);
  const phone = normalizePhone(b.phone);
  if (!/^\+27\d{9}$/.test(phone)) throw new HttpError(400, 'Enter a valid South African phone number');
  if (db.prepare('SELECT 1 FROM users WHERE phone = ?').get(phone)) {
    throw new HttpError(409, 'An account with this phone number already exists');
  }
  const info = db.prepare(
    'INSERT INTO users (role, full_name, phone, email, city, platforms, password_hash) VALUES (?,?,?,?,?,?,?)',
  ).run(b.role, b.fullName, phone, b.email || null, b.city, JSON.stringify(b.platforms), bcrypt.hashSync(b.password, 10));
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid) as UserRow;
  res.status(201).json({ token: signToken({ id: user.id, role: user.role }), user: publicUser(user) });
});

authRouter.post('/login', (req, res) => {
  const b = z.object({ phone: z.string().min(5), password: z.string().min(1) }).parse(req.body);
  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(normalizePhone(b.phone)) as UserRow | undefined;
  if (!user || !bcrypt.compareSync(b.password, user.password_hash)) {
    throw new HttpError(401, 'Incorrect phone number or password');
  }
  res.json({ token: signToken({ id: user.id, role: user.role }), user: publicUser(user) });
});

authRouter.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as UserRow | undefined;
  if (!user) throw new HttpError(401, 'Account not found');
  res.json({ user: publicUser(user) });
});

authRouter.patch('/me', requireAuth, (req, res) => {
  const b = z.object({
    fullName: z.string().trim().min(2).max(100).optional(),
    email: z.string().trim().email().optional().or(z.literal('')),
    city: z.string().trim().min(2).max(60).optional(),
    platforms: z.array(z.enum(PLATFORMS)).optional(),
  }).parse(req.body);
  const cur = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as UserRow;
  db.prepare('UPDATE users SET full_name=?, email=?, city=?, platforms=? WHERE id=?').run(
    b.fullName ?? cur.full_name,
    b.email === undefined ? cur.email : b.email || null,
    b.city ?? cur.city,
    b.platforms ? JSON.stringify(b.platforms) : cur.platforms,
    cur.id,
  );
  res.json({ user: publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(cur.id) as UserRow) });
});
