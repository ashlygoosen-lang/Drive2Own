import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth, signToken } from '../auth.js';
import { HttpError } from '../errors.js';
import crypto from 'node:crypto';
import { PLATFORMS, ROLES } from '../constants.js';
import { notify, sendSms, smsEnabled } from '../notify.js';

export const authRouter = Router();

export function normalizePhone(raw: string): string {
  const d = raw.replace(/\D/g, '');
  if (d.startsWith('27')) return `+${d}`;
  if (d.startsWith('0')) return `+27${d.slice(1)}`;
  return `+27${d}`;
}

interface UserRow {
  id: number; role: 'owner' | 'driver'; full_name: string; phone: string;
  email: string | null; city: string; platforms: string; password_hash: string; created_at: string; is_admin: number;
}

export const publicUser = (u: UserRow) => ({
  id: u.id, role: u.role, fullName: u.full_name, phone: u.phone, email: u.email,
  city: u.city, platforms: JSON.parse(u.platforms) as string[], createdAt: u.created_at, isAdmin: !!u.is_admin,
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

// ---- Password reset (6-digit code sent by SMS, valid 15 minutes, 5 attempts) ----
const hashCode = (userId: number, code: string) =>
  crypto.createHash('sha256').update(`${userId}:${code}:${process.env.JWT_SECRET ?? 'dev'}`).digest('hex');

authRouter.post('/forgot', async (req, res) => {
  const { phone } = z.object({ phone: z.string().min(5) }).parse(req.body);
  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(normalizePhone(phone)) as UserRow | undefined;
  let devCode: string | undefined;
  if (user) {
    const code = String(crypto.randomInt(100000, 1000000));
    db.prepare(`INSERT INTO password_resets (user_id, code_hash, expires_at, attempts) VALUES (?,?,?,0)
      ON CONFLICT(user_id) DO UPDATE SET code_hash=excluded.code_hash, expires_at=excluded.expires_at, attempts=0`)
      .run(user.id, hashCode(user.id, code), Date.now() + 15 * 60 * 1000);
    await sendSms(user.phone, `Your Drive2Own reset code is ${code}. It expires in 15 minutes.`).catch(() => {});
    // Only exposed when no SMS provider is configured outside production, so local development works.
    if (!smsEnabled() && process.env.NODE_ENV !== 'production') devCode = code;
  }
  // Same response whether or not the account exists, so phone numbers can't be probed.
  res.json({ ok: true, ...(devCode ? { devCode } : {}) });
});

authRouter.post('/reset', (req, res) => {
  const b = z.object({ phone: z.string().min(5), code: z.string().length(6), password: z.string().min(8).max(100) }).parse(req.body);
  const user = db.prepare('SELECT * FROM users WHERE phone = ?').get(normalizePhone(b.phone)) as UserRow | undefined;
  const bad = new HttpError(400, 'Invalid or expired code');
  if (!user) throw bad;
  const r = db.prepare('SELECT * FROM password_resets WHERE user_id = ?').get(user.id) as { code_hash: string; expires_at: number; attempts: number } | undefined;
  if (!r || r.expires_at < Date.now() || r.attempts >= 5) throw bad;
  if (hashCode(user.id, b.code) !== r.code_hash) {
    db.prepare('UPDATE password_resets SET attempts = attempts + 1 WHERE user_id = ?').run(user.id);
    throw bad;
  }
  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(bcrypt.hashSync(b.password, 10), user.id);
  db.prepare('DELETE FROM password_resets WHERE user_id = ?').run(user.id);
  notify(user.id, { title: 'Your password was changed', body: 'If this was not you, reset it again and contact support.' });
  res.json({ ok: true });
});
