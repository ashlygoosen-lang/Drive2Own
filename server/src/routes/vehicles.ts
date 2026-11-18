import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import fs from 'node:fs';
import { z } from 'zod';
import { db, VEHICLE_IMG_DIR } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';
import { HttpError } from '../errors.js';
import { PLATFORMS } from '../constants.js';
import { signatureMatches } from '../files.js';

export const vehiclesRouter = Router();

interface VehicleRow {
  id: number; owner_id: number; make: string; model: string; year: number; plate: string; color: string;
  seats: number; fuel: string; transmission: string; city: string; weekly_rate: number; deposit: number;
  platforms: string; description: string; image_url: string | null; status: string; created_at: string;
  owner_name?: string;
}

export const vehicleDto = (v: VehicleRow, includePlate = false) => ({
  id: v.id, ownerId: v.owner_id, ownerName: v.owner_name, make: v.make, model: v.model, year: v.year,
  ...(includePlate ? { plate: v.plate } : {}),
  color: v.color, seats: v.seats, fuel: v.fuel, transmission: v.transmission, city: v.city,
  weeklyRate: v.weekly_rate, deposit: v.deposit, platforms: JSON.parse(v.platforms) as string[],
  description: v.description, imageUrl: v.image_url, status: v.status, createdAt: v.created_at,
});

const SELECT = `SELECT v.*, u.full_name AS owner_name FROM vehicles v JOIN users u ON u.id = v.owner_id`;

const vehicleSchema = z.object({
  make: z.string().trim().min(2).max(40),
  model: z.string().trim().min(1).max(40),
  year: z.coerce.number().int().min(2005).max(new Date().getFullYear() + 1),
  plate: z.string().trim().toUpperCase().min(3).max(15),
  color: z.string().trim().min(2).max(30),
  seats: z.coerce.number().int().min(2).max(9).default(5),
  fuel: z.enum(['petrol', 'diesel', 'hybrid', 'electric']).default('petrol'),
  transmission: z.enum(['manual', 'automatic']).default('manual'),
  city: z.string().trim().min(2).max(60).default('Cape Town'),
  weeklyRate: z.coerce.number().int().min(100).max(50000),
  deposit: z.coerce.number().int().min(0).max(200000).default(0),
  platforms: z.array(z.enum(PLATFORMS)).min(1, 'Pick at least one platform'),
  description: z.string().trim().max(1000).default(''),
});

// Public browse
vehiclesRouter.get('/', (req, res) => {
  const q = z.object({
    platform: z.enum(PLATFORMS).optional(),
    city: z.string().trim().optional(),
    q: z.string().trim().optional(),
    minRate: z.coerce.number().optional(),
    maxRate: z.coerce.number().optional(),
    sort: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
    limit: z.coerce.number().int().min(1).max(100).default(60),
  }).parse(req.query);

  const where = [`v.status = 'available'`];
  const args: (string | number)[] = [];
  if (q.platform) { where.push(`v.platforms LIKE ?`); args.push(`%"${q.platform}"%`); }
  if (q.city) { where.push(`LOWER(v.city) = LOWER(?)`); args.push(q.city); }
  if (q.q) { where.push(`(v.make LIKE ? OR v.model LIKE ?)`); args.push(`%${q.q}%`, `%${q.q}%`); }
  if (q.minRate !== undefined) { where.push(`v.weekly_rate >= ?`); args.push(q.minRate); }
  if (q.maxRate !== undefined) { where.push(`v.weekly_rate <= ?`); args.push(q.maxRate); }
  const order = { newest: 'v.created_at DESC, v.id DESC', price_asc: 'v.weekly_rate ASC', price_desc: 'v.weekly_rate DESC' }[q.sort];
  const rows = db.prepare(`${SELECT} WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT ?`).all(...args, q.limit) as VehicleRow[];
  res.json({ vehicles: rows.map((r) => vehicleDto(r)) });
});

vehiclesRouter.get('/mine', requireAuth, requireRole('owner'), (req, res) => {
  const rows = db.prepare(`${SELECT} WHERE v.owner_id = ? ORDER BY v.created_at DESC`).all(req.user!.id) as VehicleRow[];
  res.json({ vehicles: rows.map((r) => vehicleDto(r, true)) });
});

vehiclesRouter.get('/:id', (req, res) => {
  const v = db.prepare(`${SELECT} WHERE v.id = ?`).get(Number(req.params.id)) as VehicleRow | undefined;
  if (!v) throw new HttpError(404, 'Vehicle not found');
  if (v.status === 'hidden') throw new HttpError(404, 'Vehicle not found'); // owners use /:id/manage
  res.json({ vehicle: vehicleDto(v, false) });
});

vehiclesRouter.post('/', requireAuth, requireRole('owner'), (req, res) => {
  const b = vehicleSchema.parse(req.body);
  if (db.prepare('SELECT 1 FROM vehicles WHERE plate = ?').get(b.plate)) {
    throw new HttpError(409, 'A vehicle with this registration plate is already listed');
  }
  const info = db.prepare(`INSERT INTO vehicles
    (owner_id, make, model, year, plate, color, seats, fuel, transmission, city, weekly_rate, deposit, platforms, description)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`).run(
    req.user!.id, b.make, b.model, b.year, b.plate, b.color, b.seats, b.fuel, b.transmission, b.city,
    b.weeklyRate, b.deposit, JSON.stringify(b.platforms), b.description);
  const v = db.prepare(`${SELECT} WHERE v.id = ?`).get(info.lastInsertRowid) as VehicleRow;
  res.status(201).json({ vehicle: vehicleDto(v, true) });
});

function ownVehicle(id: number, userId: number): VehicleRow {
  const v = db.prepare(`${SELECT} WHERE v.id = ?`).get(id) as VehicleRow | undefined;
  if (!v) throw new HttpError(404, 'Vehicle not found');
  if (v.owner_id !== userId) throw new HttpError(403, 'This is not your vehicle');
  return v;
}

vehiclesRouter.get('/:id/manage', requireAuth, requireRole('owner'), (req, res) => {
  res.json({ vehicle: vehicleDto(ownVehicle(Number(req.params.id), req.user!.id), true) });
});

vehiclesRouter.put('/:id', requireAuth, requireRole('owner'), (req, res) => {
  const cur = ownVehicle(Number(req.params.id), req.user!.id);
  const b = vehicleSchema.parse(req.body);
  if (db.prepare('SELECT 1 FROM vehicles WHERE plate = ? AND id != ?').get(b.plate, cur.id)) {
    throw new HttpError(409, 'A vehicle with this registration plate is already listed');
  }
  db.prepare(`UPDATE vehicles SET make=?, model=?, year=?, plate=?, color=?, seats=?, fuel=?, transmission=?,
    city=?, weekly_rate=?, deposit=?, platforms=?, description=? WHERE id=?`).run(
    b.make, b.model, b.year, b.plate, b.color, b.seats, b.fuel, b.transmission, b.city,
    b.weeklyRate, b.deposit, JSON.stringify(b.platforms), b.description, cur.id);
  res.json({ vehicle: vehicleDto(ownVehicle(cur.id, req.user!.id), true) });
});

// Owner can hide/unhide a listing (not while rented)
vehiclesRouter.patch('/:id/visibility', requireAuth, requireRole('owner'), (req, res) => {
  const cur = ownVehicle(Number(req.params.id), req.user!.id);
  const { hidden } = z.object({ hidden: z.boolean() }).parse(req.body);
  if (cur.status === 'rented') throw new HttpError(409, 'This vehicle is currently rented out');
  db.prepare('UPDATE vehicles SET status = ? WHERE id = ?').run(hidden ? 'hidden' : 'available', cur.id);
  res.json({ vehicle: vehicleDto(ownVehicle(cur.id, req.user!.id), true) });
});

vehiclesRouter.delete('/:id', requireAuth, requireRole('owner'), (req, res) => {
  const cur = ownVehicle(Number(req.params.id), req.user!.id);
  const busy = db.prepare(`SELECT 1 FROM rentals WHERE vehicle_id = ? AND status IN ('approved','active')`).get(cur.id);
  if (busy) throw new HttpError(409, 'Cannot delete a vehicle with an approved or active rental');
  db.prepare('DELETE FROM vehicles WHERE id = ?').run(cur.id);
  res.status(204).end();
});

const imageUpload = multer({
  storage: multer.diskStorage({
    destination: VEHICLE_IMG_DIR,
    filename: (_req, file, cb) => {
      const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[file.mimetype] ?? '';
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
      ? cb(null, true) : cb(new HttpError(400, 'Only JPG, PNG or WebP images are allowed')),
});

vehiclesRouter.post('/:id/image', requireAuth, requireRole('owner'), imageUpload.single('image'), (req, res) => {
  const file = req.file;
  if (!file) throw new HttpError(400, 'No image uploaded');
  try {
    if (!signatureMatches(file.path, file.mimetype)) throw new HttpError(400, 'That file is not a valid image');
    const cur = ownVehicle(Number(req.params.id), req.user!.id);
    if (cur.image_url) fs.rmSync(path.join(VEHICLE_IMG_DIR, path.basename(cur.image_url)), { force: true });
    db.prepare('UPDATE vehicles SET image_url = ? WHERE id = ?').run(`/uploads/vehicles/${file.filename}`, cur.id);
    res.json({ vehicle: vehicleDto(ownVehicle(cur.id, req.user!.id), true) });
  } catch (e) {
    fs.rmSync(file.path, { force: true });
    throw e;
  }
});
