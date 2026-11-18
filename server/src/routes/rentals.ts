import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';
import { HttpError } from '../errors.js';
import { PLATFORMS } from '../constants.js';
import { notify } from '../notify.js';
import { buildAgreement } from '../agreement.js';
import { platformName } from '../platforms.js';

export const rentalsRouter = Router();
rentalsRouter.use(requireAuth);

interface RentalRow {
  id: number; vehicle_id: number; driver_id: number; platform: string; start_date: string; weeks: number;
  weekly_rate: number; deposit: number; message: string; status: string; created_at: string; updated_at: string;
  make: string; model: string; year: number; color: string; image_url: string | null; owner_id: number;
  owner_name: string; owner_phone: string; driver_name: string; driver_phone: string;
  plate: string; agreement_text: string | null; owner_accepted_at: string | null; driver_accepted_at: string | null;
  insurance_confirmed: number;
}

const SELECT = `
  SELECT r.*, v.make, v.model, v.year, v.color, v.plate, v.image_url, v.owner_id,
         o.full_name AS owner_name, o.phone AS owner_phone,
         d.full_name AS driver_name, d.phone AS driver_phone
  FROM rentals r
  JOIN vehicles v ON v.id = r.vehicle_id
  JOIN users o ON o.id = v.owner_id
  JOIN users d ON d.id = r.driver_id`;

// Contact numbers are only shared once the owner has approved the request.
const dto = (r: RentalRow) => {
  const shared = ['approved', 'active', 'completed'].includes(r.status);
  return {
    id: r.id, status: r.status, platform: r.platform, startDate: r.start_date, weeks: r.weeks,
    weeklyRate: r.weekly_rate, deposit: r.deposit, total: r.weekly_rate * r.weeks, message: r.message,
    createdAt: r.created_at, updatedAt: r.updated_at,
    vehicle: { id: r.vehicle_id, make: r.make, model: r.model, year: r.year, color: r.color, imageUrl: r.image_url },
    agreement: {
      exists: !!r.agreement_text, ownerAccepted: !!r.owner_accepted_at, driverAccepted: !!r.driver_accepted_at,
      insuranceConfirmed: !!r.insurance_confirmed,
    },
    owner: { id: r.owner_id, name: r.owner_name, phone: shared ? r.owner_phone : null },
    driver: { id: r.driver_id, name: r.driver_name, phone: shared ? r.driver_phone : null },
  };
};

function getRental(id: number, userId: number): RentalRow {
  const r = db.prepare(`${SELECT} WHERE r.id = ?`).get(id) as RentalRow | undefined;
  if (!r) throw new HttpError(404, 'Rental not found');
  if (r.driver_id !== userId && r.owner_id !== userId) throw new HttpError(403, 'Not your rental');
  return r;
}
const fresh = (id: number) => dto(db.prepare(`${SELECT} WHERE r.id = ?`).get(id) as RentalRow);
const touch = (id: number, status: string) =>
  db.prepare(`UPDATE rentals SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, id);

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (iso: string, n: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

const driverBusy = (driverId: number, exceptId = 0) =>
  db.prepare(`SELECT 1 FROM rentals WHERE driver_id = ? AND id != ? AND status IN ('approved','active')`).get(driverId, exceptId);

// Driver sends a rental request
rentalsRouter.post('/', requireRole('driver'), (req, res) => {
  const b = z.object({
    vehicleId: z.coerce.number().int(),
    platform: z.enum(PLATFORMS),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    weeks: z.coerce.number().int().min(1).max(52),
    message: z.string().trim().max(500).default(''),
  }).parse(req.body);
  const driverId = req.user!.id;

  if (b.startDate < today()) throw new HttpError(400, 'Start date cannot be in the past');
  const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(b.vehicleId) as
    { id: number; status: string; platforms: string; weekly_rate: number; deposit: number } | undefined;
  if (!vehicle || vehicle.status !== 'available') throw new HttpError(409, 'This vehicle is not available');
  if (!(JSON.parse(vehicle.platforms) as string[]).includes(b.platform)) {
    throw new HttpError(400, 'This vehicle is not approved for that platform');
  }

  const missing = ['id_document', 'drivers_license', 'prdp'].filter(
    (t) => !db.prepare('SELECT 1 FROM documents WHERE user_id = ? AND type = ?').get(driverId, t));
  if (missing.length) {
    throw new HttpError(400, 'Upload your ID, driver\'s licence and PrDP on the Documents page before requesting a vehicle');
  }
  if (driverBusy(driverId)) throw new HttpError(409, 'You already have an approved or active rental');
  if (db.prepare(`SELECT 1 FROM rentals WHERE driver_id = ? AND vehicle_id = ? AND status = 'pending'`).get(driverId, b.vehicleId)) {
    throw new HttpError(409, 'You already have a pending request for this vehicle');
  }

  const info = db.prepare(`INSERT INTO rentals (vehicle_id, driver_id, platform, start_date, weeks, weekly_rate, deposit, message)
    VALUES (?,?,?,?,?,?,?,?)`).run(b.vehicleId, driverId, b.platform, b.startDate, b.weeks, vehicle.weekly_rate, vehicle.deposit, b.message);
  const created = fresh(Number(info.lastInsertRowid));
  notify(created.owner.id, {
    title: 'New rental request',
    body: `${created.driver.name} wants your ${created.vehicle.make} ${created.vehicle.model} from ${b.startDate}`,
    link: '/dashboard', sms: true,
  });
  res.status(201).json({ rental: created });
});

// List my rentals (driver: requests I made, owner: requests on my vehicles)
rentalsRouter.get('/', (req, res) => {
  const col = req.user!.role === 'driver' ? 'r.driver_id' : 'v.owner_id';
  const rows = db.prepare(`${SELECT} WHERE ${col} = ? ORDER BY r.created_at DESC, r.id DESC`).all(req.user!.id) as RentalRow[];
  res.json({ rentals: rows.map(dto) });
});

rentalsRouter.get('/:id', (req, res) => {
  res.json({ rental: dto(getRental(Number(req.params.id), req.user!.id)) });
});

rentalsRouter.post('/:id/approve', requireRole('owner'), (req, res) => {
  const r = getRental(Number(req.params.id), req.user!.id);
  if (r.owner_id !== req.user!.id) throw new HttpError(403, 'Not your vehicle');
  if (r.status !== 'pending') throw new HttpError(409, `Request is already ${r.status}`);
  const v = db.prepare('SELECT status FROM vehicles WHERE id = ?').get(r.vehicle_id) as { status: string };
  if (v.status !== 'available') throw new HttpError(409, 'Vehicle is no longer available');
  if (driverBusy(r.driver_id, r.id)) throw new HttpError(409, 'This driver already has another approved or active rental');
  if (db.prepare(`SELECT 1 FROM rentals WHERE vehicle_id = ? AND status = 'approved' AND id != ?`).get(r.vehicle_id, r.id)) {
    throw new HttpError(409, 'Another driver is already approved for this vehicle');
  }
  const text = buildAgreement({
    ownerName: r.owner_name, driverName: r.driver_name, vehicle: `${r.year} ${r.make} ${r.model} (${r.color})`, plate: r.plate,
    platform: platformName(r.platform), startDate: r.start_date, weeks: r.weeks, weeklyRate: r.weekly_rate, deposit: r.deposit,
  });
  db.prepare('UPDATE rentals SET agreement_text = ?, owner_accepted_at = NULL, driver_accepted_at = NULL, insurance_confirmed = 0 WHERE id = ?').run(text, r.id);
  touch(r.id, 'approved');
  notify(r.driver_id, { title: 'Request approved', body: `${r.owner_name} approved your request. Review and accept the rental agreement.`, link: '/dashboard', sms: true });
  res.json({ rental: fresh(r.id) });
});

rentalsRouter.post('/:id/decline', requireRole('owner'), (req, res) => {
  const r = getRental(Number(req.params.id), req.user!.id);
  if (r.owner_id !== req.user!.id) throw new HttpError(403, 'Not your vehicle');
  if (!['pending', 'approved'].includes(r.status)) throw new HttpError(409, `Request is already ${r.status}`);
  touch(r.id, 'declined');
  notify(r.driver_id, { title: 'Request declined', body: `${r.owner_name} declined your request for the ${r.make} ${r.model}.`, link: '/vehicles' });
  res.json({ rental: fresh(r.id) });
});

rentalsRouter.post('/:id/cancel', (req, res) => {
  const r = getRental(Number(req.params.id), req.user!.id);
  if (r.driver_id !== req.user!.id) throw new HttpError(403, 'Only the driver can cancel their request');
  if (!['pending', 'approved'].includes(r.status)) throw new HttpError(409, `Request is already ${r.status}`);
  touch(r.id, 'cancelled');
  notify(r.owner_id, { title: 'Request cancelled', body: `${r.driver_name} cancelled their request for the ${r.make} ${r.model}.`, link: '/dashboard' });
  res.json({ rental: fresh(r.id) });
});

// Owner hands over the keys: rental becomes active, payment schedule is created
rentalsRouter.post('/:id/activate', requireRole('owner'), (req, res) => {
  const r = getRental(Number(req.params.id), req.user!.id);
  if (r.owner_id !== req.user!.id) throw new HttpError(403, 'Not your vehicle');
  if (r.status !== 'approved') throw new HttpError(409, 'Approve the request before handing over the vehicle');
  if (!r.owner_accepted_at || !r.driver_accepted_at) throw new HttpError(409, 'Both you and the driver must accept the rental agreement before handover');
  if (process.env.REQUIRE_VERIFIED_DOCS === '1') {
    const unverified = ['id_document', 'drivers_license', 'prdp'].filter(
      (t) => !db.prepare(`SELECT 1 FROM documents WHERE user_id = ? AND type = ? AND status = 'verified'`).get(r.driver_id, t));
    if (unverified.length) throw new HttpError(409, "The driver's documents have not all been verified yet");
  }
  const tx = db.transaction(() => {
    touch(r.id, 'active');
    db.prepare(`UPDATE vehicles SET status = 'rented' WHERE id = ?`).run(r.vehicle_id);
    db.prepare(`UPDATE rentals SET status = 'declined', updated_at = datetime('now')
                WHERE vehicle_id = ? AND id != ? AND status IN ('pending','approved')`).run(r.vehicle_id, r.id);
    const ins = db.prepare('INSERT INTO payments (rental_id, kind, amount, due_date) VALUES (?,?,?,?)');
    if (r.deposit > 0) ins.run(r.id, 'deposit', r.deposit, r.start_date);
    for (let i = 0; i < r.weeks; i++) ins.run(r.id, 'weekly', r.weekly_rate, addDays(r.start_date, i * 7));
  });
  tx();
  notify(r.driver_id, { title: 'Vehicle handed over', body: `Your ${r.make} ${r.model} rental is active. Check your payment schedule.`, link: '/dashboard' });
  res.json({ rental: fresh(r.id) });
});

rentalsRouter.post('/:id/complete', requireRole('owner'), (req, res) => {
  const r = getRental(Number(req.params.id), req.user!.id);
  if (r.owner_id !== req.user!.id) throw new HttpError(403, 'Not your vehicle');
  if (r.status !== 'active') throw new HttpError(409, 'Only active rentals can be completed');
  db.transaction(() => {
    touch(r.id, 'completed');
    db.prepare(`UPDATE vehicles SET status = 'available' WHERE id = ?`).run(r.vehicle_id);
    db.prepare(`UPDATE payments SET status = 'cancelled' WHERE rental_id = ? AND status = 'pending' AND due_date > ?`)
      .run(r.id, today());
  })();
  notify(r.driver_id, { title: 'Rental completed', body: `Your ${r.make} ${r.model} rental has ended.`, link: '/dashboard' });
  res.json({ rental: fresh(r.id) });
});

// ---- Rental agreement ----
rentalsRouter.get('/:id/agreement', (req, res) => {
  const r = getRental(Number(req.params.id), req.user!.id);
  if (!r.agreement_text) throw new HttpError(404, 'The agreement is created when the owner approves the request');
  res.json({
    text: r.agreement_text,
    ownerAcceptedAt: r.owner_accepted_at, driverAcceptedAt: r.driver_accepted_at, insuranceConfirmed: !!r.insurance_confirmed,
  });
});

rentalsRouter.post('/:id/agreement/accept', (req, res) => {
  const r = getRental(Number(req.params.id), req.user!.id);
  if (r.status !== 'approved') throw new HttpError(409, 'The agreement can only be accepted while the request is approved');
  if (!r.agreement_text) throw new HttpError(409, 'No agreement to accept');
  const isOwner = r.owner_id === req.user!.id;
  if (isOwner) {
    const { insuranceConfirmed } = z.object({ insuranceConfirmed: z.literal(true, { errorMap: () => ({ message: 'Confirm the vehicle is insured for e-hailing use' }) }) }).parse(req.body);
    void insuranceConfirmed;
    db.prepare(`UPDATE rentals SET owner_accepted_at = COALESCE(owner_accepted_at, datetime('now')), insurance_confirmed = 1 WHERE id = ?`).run(r.id);
  } else {
    db.prepare(`UPDATE rentals SET driver_accepted_at = COALESCE(driver_accepted_at, datetime('now')) WHERE id = ?`).run(r.id);
  }
  const other = isOwner ? r.driver_id : r.owner_id;
  notify(other, { title: 'Agreement accepted', body: `${isOwner ? r.owner_name : r.driver_name} accepted the rental agreement.`, link: '/dashboard' });
  res.json({ rental: fresh(r.id) });
});

interface PaymentRow { id: number; rental_id: number; kind: string; amount: number; due_date: string; status: string; paid_at: string | null; paid_via: string | null }
const paymentDto = (p: PaymentRow) => ({
  id: p.id, rentalId: p.rental_id, kind: p.kind, amount: p.amount, dueDate: p.due_date,
  status: p.status === 'pending' && p.due_date < today() ? 'overdue' : p.status, paidAt: p.paid_at, paidVia: p.paid_via,
});

rentalsRouter.get('/:id/payments', (req, res) => {
  const r = getRental(Number(req.params.id), req.user!.id);
  const rows = db.prepare('SELECT * FROM payments WHERE rental_id = ? ORDER BY due_date, id').all(r.id) as PaymentRow[];
  res.json({ payments: rows.map(paymentDto) });
});

// Owner confirms they received a payment
rentalsRouter.post('/:id/payments/:paymentId/paid', requireRole('owner'), (req, res) => {
  const r = getRental(Number(req.params.id), req.user!.id);
  if (r.owner_id !== req.user!.id) throw new HttpError(403, 'Not your vehicle');
  const p = db.prepare('SELECT * FROM payments WHERE id = ? AND rental_id = ?').get(Number(req.params.paymentId), r.id) as PaymentRow | undefined;
  if (!p) throw new HttpError(404, 'Payment not found');
  if (p.status !== 'pending') throw new HttpError(409, `Payment is already ${p.status}`);
  db.prepare(`UPDATE payments SET status = 'paid', paid_at = datetime('now') WHERE id = ?`).run(p.id);
  notify(r.driver_id, { title: 'Payment confirmed', body: `${r.owner_name} confirmed your R ${p.amount.toLocaleString('en-ZA')} payment.`, link: '/dashboard' });
  res.json({ payment: paymentDto(db.prepare('SELECT * FROM payments WHERE id = ?').get(p.id) as PaymentRow) });
});
