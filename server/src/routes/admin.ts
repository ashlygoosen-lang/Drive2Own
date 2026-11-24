import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAdmin, requireAuth } from '../auth.js';
import { HttpError } from '../errors.js';
import { notify } from '../notify.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get('/stats', (_req, res) => {
  const n = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  res.json({
    owners: n(`SELECT COUNT(*) n FROM users WHERE role='owner'`),
    drivers: n(`SELECT COUNT(*) n FROM users WHERE role='driver'`),
    vehicles: n('SELECT COUNT(*) n FROM vehicles'),
    activeRentals: n(`SELECT COUNT(*) n FROM rentals WHERE status='active'`),
    documentsToReview: n(`SELECT COUNT(*) n FROM documents WHERE status='uploaded'`),
  });
});

interface Row {
  id: number; user_id: number; type: string; original_name: string; status: string; review_note: string | null;
  uploaded_at: string; full_name: string; phone: string; role: string;
}

adminRouter.get('/documents', (req, res) => {
  const { status } = z.object({ status: z.enum(['uploaded', 'verified', 'rejected', 'all']).default('uploaded') }).parse(req.query);
  const rows = db.prepare(`SELECT d.*, u.full_name, u.phone, u.role FROM documents d JOIN users u ON u.id = d.user_id
    ${status === 'all' ? '' : 'WHERE d.status = ?'} ORDER BY d.uploaded_at ASC LIMIT 200`).all(...(status === 'all' ? [] : [status])) as Row[];
  res.json({
    documents: rows.map((d) => ({
      id: d.id, type: d.type, name: d.original_name, status: d.status, note: d.review_note, uploadedAt: d.uploaded_at,
      user: { id: d.user_id, name: d.full_name, phone: d.phone, role: d.role },
    })),
  });
});

adminRouter.get('/users/:id/profile', (req, res) => {
  const u = db.prepare('SELECT id, role, full_name, phone, email, created_at FROM users WHERE id = ?').get(Number(req.params.id));
  if (!u) throw new HttpError(404, 'User not found');
  const p = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(Number(req.params.id));
  res.json({ user: u, profile: p ?? null });
});

adminRouter.post('/documents/:id/review', (req, res) => {
  const b = z.object({ status: z.enum(['verified', 'rejected']), note: z.string().trim().max(300).optional() }).parse(req.body);
  if (b.status === 'rejected' && !b.note) throw new HttpError(400, 'Add a short reason so the user can fix it');
  const d = db.prepare('SELECT user_id, type FROM documents WHERE id = ?').get(Number(req.params.id)) as { user_id: number; type: string } | undefined;
  if (!d) throw new HttpError(404, 'Document not found');
  db.prepare(`UPDATE documents SET status=?, review_note=?, reviewed_at=datetime('now') WHERE id=?`).run(b.status, b.note ?? null, Number(req.params.id));
  const label = d.type.replace(/_/g, ' ');
  notify(d.user_id, b.status === 'verified'
    ? { title: `Your ${label} was verified`, link: '/documents' }
    : { title: `Your ${label} was rejected`, body: b.note, link: '/documents', sms: true });
  res.status(204).end();
});
