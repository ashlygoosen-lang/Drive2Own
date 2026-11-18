import express, { Router } from 'express';
import { db } from '../db.js';
import { requireAuth, requireRole } from '../auth.js';
import { HttpError } from '../errors.js';
import { buildCheckout, payfastEnabled, queryString, signature, validateUrl } from '../payfast.js';
import { notify } from '../notify.js';

export const payfastRouter = Router();

const siteUrl = () => (process.env.PUBLIC_SITE_URL ?? process.env.CLIENT_ORIGIN?.split(',')[0] ?? 'http://localhost:5173').replace(/\/$/, '');
const apiUrl = () => (process.env.PUBLIC_API_URL ?? `http://localhost:${process.env.PORT ?? 4000}`).replace(/\/$/, '');

interface PayRow {
  id: number; rental_id: number; kind: string; amount: number; status: string;
  driver_id: number; owner_id: number; make: string; model: string; driver_name: string; email: string | null;
}
const SELECT = `SELECT p.*, r.driver_id, v.owner_id, v.make, v.model, d.full_name AS driver_name, d.email
  FROM payments p JOIN rentals r ON r.id = p.rental_id JOIN vehicles v ON v.id = r.vehicle_id JOIN users d ON d.id = r.driver_id`;

// Driver starts an online payment: returns the signed form the browser submits to PayFast.
payfastRouter.post('/payments/:id/payfast', requireAuth, requireRole('driver'), (req, res) => {
  if (!payfastEnabled()) throw new HttpError(503, 'Online payments are not enabled');
  const p = db.prepare(`${SELECT} WHERE p.id = ?`).get(Number(req.params.id)) as PayRow | undefined;
  if (!p || p.driver_id !== req.user!.id) throw new HttpError(404, 'Payment not found');
  if (p.status !== 'pending') throw new HttpError(409, `Payment is already ${p.status}`);
  const checkout = buildCheckout(
    { paymentId: p.id, amount: p.amount, itemName: `${p.kind === 'deposit' ? 'Deposit' : 'Weekly rent'} - ${p.make} ${p.model}`, firstName: p.driver_name.split(' ')[0], email: p.email },
    { returnUrl: `${siteUrl()}/dashboard?paid=1`, cancelUrl: `${siteUrl()}/dashboard`, notifyUrl: `${apiUrl()}/api/payfast/itn` },
  );
  res.json(checkout);
});

// PayFast Instant Transaction Notification (server-to-server). Always answers 200 so PayFast stops retrying;
// the payment is only marked paid after every check below passes.
payfastRouter.post('/payfast/itn', express.urlencoded({ extended: false }), async (req, res) => {
  res.status(200).end();
  try {
    if (!payfastEnabled()) return;
    const entries = Object.entries(req.body as Record<string, string>);
    const received = entries.find(([k]) => k === 'signature')?.[1];
    const fields = entries.filter(([k]) => k !== 'signature') as [string, string][];
    const get = (k: string) => fields.find(([key]) => key === k)?.[1] ?? '';

    // 1. Signature
    if (!received || signature(fields, process.env.PAYFAST_PASSPHRASE) !== received) return console.warn('ITN: bad signature');
    // 2. Merchant
    if (get('merchant_id') !== process.env.PAYFAST_MERCHANT_ID) return console.warn('ITN: merchant mismatch');
    // 3. Payment exists and amount matches
    const p = db.prepare('SELECT * FROM payments WHERE id = ?').get(Number(get('m_payment_id'))) as
      { id: number; rental_id: number; amount: number; status: string } | undefined;
    if (!p) return console.warn('ITN: unknown payment');
    if (Math.abs(parseFloat(get('amount_gross')) - p.amount) > 0.01) return console.warn('ITN: amount mismatch');
    // 4. Server-side confirmation with PayFast
    const check = await fetch(validateUrl(), {
      method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: queryString(fields),
    });
    if ((await check.text()).trim() !== 'VALID') return console.warn('ITN: PayFast did not validate');

    if (get('payment_status') !== 'COMPLETE' || p.status !== 'pending') return;
    db.prepare(`UPDATE payments SET status='paid', paid_at=datetime('now'), paid_via='payfast', provider_ref=? WHERE id=?`)
      .run(get('pf_payment_id'), p.id);
    const info = db.prepare(`SELECT r.driver_id, v.owner_id FROM rentals r JOIN vehicles v ON v.id = r.vehicle_id WHERE r.id = ?`)
      .get(p.rental_id) as { driver_id: number; owner_id: number };
    notify(info.owner_id, { title: 'Payment received', body: `R ${p.amount.toLocaleString('en-ZA')} paid online`, link: '/dashboard' });
    notify(info.driver_id, { title: 'Payment confirmed', body: `R ${p.amount.toLocaleString('en-ZA')} received`, link: '/dashboard' });
  } catch (e) {
    console.error('ITN error', e);
  }
});
