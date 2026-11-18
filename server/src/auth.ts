import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { HttpError } from './errors.js';
import { db } from './db.js';
import type { Role } from './constants.js';

const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dev-only-secret-change-me');
if (!secret) throw new Error('JWT_SECRET must be set in production');

export interface AuthUser { id: number; role: Role }

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express { interface Request { user?: AuthUser } }
}

export const signToken = (u: AuthUser) => jwt.sign(u, secret, { expiresIn: '7d' });

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next(new HttpError(401, 'Please sign in'));
  try {
    const p = jwt.verify(header.slice(7), secret) as AuthUser;
    req.user = { id: p.id, role: p.role };
    next();
  } catch {
    next(new HttpError(401, 'Session expired, please sign in again'));
  }
}

export const requireRole = (role: Role) => (req: Request, _res: Response, next: NextFunction) =>
  req.user?.role === role ? next() : next(new HttpError(403, `Only ${role}s can do this`));

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const u = db.prepare('SELECT is_admin FROM users WHERE id = ?').get(req.user?.id ?? 0) as { is_admin: number } | undefined;
  u?.is_admin ? next() : next(new HttpError(403, 'Admins only'));
}
