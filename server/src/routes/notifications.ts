import { Router } from 'express';
import { db } from '../db.js';
import { requireAuth } from '../auth.js';

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

interface N { id: number; title: string; body: string; link: string | null; read_at: string | null; created_at: string }

notificationsRouter.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC LIMIT 50').all(req.user!.id) as N[];
  const unread = (db.prepare('SELECT COUNT(*) AS n FROM notifications WHERE user_id = ? AND read_at IS NULL').get(req.user!.id) as { n: number }).n;
  res.json({
    unread,
    notifications: rows.map((n) => ({ id: n.id, title: n.title, body: n.body, link: n.link, read: !!n.read_at, createdAt: n.created_at })),
  });
});

notificationsRouter.post('/read-all', (req, res) => {
  db.prepare(`UPDATE notifications SET read_at = datetime('now') WHERE user_id = ? AND read_at IS NULL`).run(req.user!.id);
  res.status(204).end();
});

notificationsRouter.post('/:id/read', (req, res) => {
  db.prepare(`UPDATE notifications SET read_at = datetime('now') WHERE id = ? AND user_id = ?`).run(Number(req.params.id), req.user!.id);
  res.status(204).end();
});
