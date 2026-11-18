import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'node:path';
import fs from 'node:fs';
import { ZodError } from 'zod';
import multer from 'multer';
import { UPLOAD_DIR } from './db.js';
import { HttpError } from './errors.js';
import { PLATFORMS } from './constants.js';
import { authRouter } from './routes/auth.js';
import { vehiclesRouter } from './routes/vehicles.js';
import { rentalsRouter } from './routes/rentals.js';
import { documentsRouter } from './routes/documents.js';

const app = express();
const PORT = Number(process.env.PORT ?? 4000);

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: (process.env.CLIENT_ORIGIN ?? 'http://localhost:5173').split(','), credentials: false }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.get('/api/meta', (_req, res) => res.json({ platforms: PLATFORMS }));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 50, standardHeaders: true, legacyHeaders: false }), authRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/rentals', rentalsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Not found')));

// Only vehicle photos are public; identity documents are never served statically.
app.use('/uploads/vehicles', express.static(path.join(UPLOAD_DIR, 'vehicles'), { maxAge: '7d' }));

app.use('/uploads', (_req, res) => res.status(404).end());

// Optionally serve the built frontend (single-deploy setup)
const staticDir = path.resolve(process.env.STATIC_DIR ?? '../dist');
if (fs.existsSync(path.join(staticDir, 'index.html'))) {
  app.use(express.static(staticDir));
  app.get('*', (_req, res) => res.sendFile(path.join(staticDir, 'index.html')));
}

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) return void res.status(err.status).json({ error: err.message });
  if (err instanceof ZodError) {
    return void res.status(400).json({ error: err.issues[0]?.message ?? 'Invalid input', issues: err.issues });
  }
  if (err instanceof multer.MulterError) {
    return void res.status(400).json({ error: err.code === 'LIMIT_FILE_SIZE' ? 'File is too large' : err.message });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => console.log(`Drive2Own API listening on http://localhost:${PORT}`));
