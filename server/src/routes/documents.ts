import { Router } from 'express';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { db, DOC_DIR } from '../db.js';
import { requireAuth } from '../auth.js';
import { HttpError } from '../errors.js';
import { ALL_DOCUMENT_TYPES, DOCUMENT_TYPES } from '../constants.js';

export const documentsRouter = Router();
documentsRouter.use(requireAuth);

interface DocRow {
  id: number; user_id: number; type: string; original_name: string; stored_name: string;
  mime: string; size: number; uploaded_at: string;
}
const dto = (d: DocRow) => ({ id: d.id, type: d.type, name: d.original_name, size: d.size, mime: d.mime, uploadedAt: d.uploaded_at });

const MIME_EXT: Record<string, string> = { 'application/pdf': '.pdf', 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

const upload = multer({
  storage: multer.diskStorage({
    destination: DOC_DIR,
    filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${MIME_EXT[file.mimetype] ?? ''}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) =>
    MIME_EXT[file.mimetype] ? cb(null, true) : cb(new HttpError(400, 'Only PDF, JPG, PNG or WebP files are allowed')),
});

documentsRouter.get('/types', (req, res) => {
  res.json({ types: DOCUMENT_TYPES[req.user!.role] });
});

documentsRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC').all(req.user!.id) as DocRow[];
  res.json({ documents: rows.map(dto) });
});

// Replaces any existing document of the same type
documentsRouter.post('/', upload.single('file'), (req, res) => {
  const file = req.file;
  if (!file) throw new HttpError(400, 'No file uploaded');
  try {
    const { type } = z.object({ type: z.enum(ALL_DOCUMENT_TYPES) }).parse(req.body);
    const allowed = DOCUMENT_TYPES[req.user!.role].map((d) => d.type as string);
    if (!allowed.includes(type)) throw new HttpError(400, 'That document type is not needed for your account');
    const old = db.prepare('SELECT * FROM documents WHERE user_id = ? AND type = ?').get(req.user!.id, type) as DocRow | undefined;
    db.transaction(() => {
      if (old) db.prepare('DELETE FROM documents WHERE id = ?').run(old.id);
      db.prepare('INSERT INTO documents (user_id, type, original_name, stored_name, mime, size) VALUES (?,?,?,?,?,?)')
        .run(req.user!.id, type, file.originalname.slice(0, 200), file.filename, file.mimetype, file.size);
    })();
    if (old) fs.rmSync(path.join(DOC_DIR, old.stored_name), { force: true });
    const row = db.prepare('SELECT * FROM documents WHERE user_id = ? AND type = ?').get(req.user!.id, type) as DocRow;
    res.status(201).json({ document: dto(row) });
  } catch (e) {
    fs.rmSync(file.path, { force: true });
    throw e;
  }
});

documentsRouter.delete('/:id', (req, res) => {
  const d = db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?').get(Number(req.params.id), req.user!.id) as DocRow | undefined;
  if (!d) throw new HttpError(404, 'Document not found');
  db.prepare('DELETE FROM documents WHERE id = ?').run(d.id);
  fs.rmSync(path.join(DOC_DIR, d.stored_name), { force: true });
  res.status(204).end();
});

// Download: the uploader, or the owner of a vehicle the uploader has an approved/active/completed
// rental on (so owners can review the driver they are handing keys to) or a pending request.
documentsRouter.get('/:id/file', (req, res) => {
  const d = db.prepare('SELECT * FROM documents WHERE id = ?').get(Number(req.params.id)) as DocRow | undefined;
  if (!d) throw new HttpError(404, 'Document not found');
  const me = req.user!.id;
  const allowed = d.user_id === me || !!db.prepare(`
    SELECT 1 FROM rentals r JOIN vehicles v ON v.id = r.vehicle_id
    WHERE r.driver_id = ? AND v.owner_id = ? AND r.status IN ('pending','approved','active','completed')`).get(d.user_id, me);
  if (!allowed) throw new HttpError(403, 'You do not have access to this document');
  res.setHeader('Content-Type', d.mime);
  res.setHeader('Content-Disposition', `inline; filename="${d.type}${MIME_EXT[d.mime] ?? ''}"`);
  res.setHeader('Cache-Control', 'private, no-store');
  res.sendFile(path.join(DOC_DIR, d.stored_name));
});

// Owner: list a driver's documents for a rental request on one of their vehicles
documentsRouter.get('/driver/:driverId', (req, res) => {
  const driverId = Number(req.params.driverId);
  const ok = db.prepare(`SELECT 1 FROM rentals r JOIN vehicles v ON v.id = r.vehicle_id
    WHERE r.driver_id = ? AND v.owner_id = ? AND r.status IN ('pending','approved','active','completed')`).get(driverId, req.user!.id);
  if (!ok) throw new HttpError(403, 'You do not have access to this driver\'s documents');
  const rows = db.prepare('SELECT * FROM documents WHERE user_id = ?').all(driverId) as DocRow[];
  res.json({ documents: rows.map(dto) });
});
