import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '../db.js';
import { requireAuth, signToken } from '../auth.js';
import { HttpError } from '../errors.js';
import crypto from 'node:crypto';
import { EMPLOYMENT, ID_TYPES, INCOME_BANDS, INCOME_SOURCES, LEGAL_VERSION, PLATFORMS, PROVINCES, ROLES } from '../constants.js';
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

const hasProfile = (id: number) => !!db.prepare('SELECT 1 FROM user_profiles WHERE user_id = ?').get(id);

export const publicUser = (u: UserRow) => ({
  id: u.id, role: u.role, fullName: u.full_name, phone: u.phone, email: u.email,
  city: u.city, platforms: JSON.parse(u.platforms) as string[], createdAt: u.created_at, isAdmin: !!u.is_admin,
  profileComplete: hasProfile(u.id),
});

// ---- Identity checks ----
/** Validates a 13-digit South African ID number (date of birth + Luhn checksum). Returns the date of birth. */
export function parseSaId(id: string): string | null {
  if (!/^\d{13}$/.test(id)) return null;
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    let d = Number(id[12 - i]);
    if (i % 2 === 1) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
  }
  if (sum % 10 !== 0) return null;
  const yy = Number(id.slice(0, 2)), mm = Number(id.slice(2, 4)), dd = Number(id.slice(4, 6));
  const nowYY = new Date().getFullYear() % 100;
  const year = yy > nowYY ? 1900 + yy : 2000 + yy;
  const dt = new Date(Date.UTC(year, mm - 1, dd));
  if (dt.getUTCMonth() !== mm - 1 || dt.getUTCDate() !== dd) return null;
  return dt.toISOString().slice(0, 10);
}
const ageOn = (dob: string) => {
  const b = new Date(dob), n = new Date();
  return n.getFullYear() - b.getFullYear() - (n < new Date(n.getFullYear(), b.getMonth(), b.getDate()) ? 1 : 0);
};

const yes = z.literal(true, { errorMap: () => ({ message: 'This declaration is required' }) });
export const profileSchema = z.object({
  idType: z.enum(ID_TYPES),
  idNumber: z.string().trim().toUpperCase().min(6).max(20),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter your date of birth'),
  nationality: z.string().trim().min(2).max(60),
  workPermitNumber: z.string().trim().max(40).optional().or(z.literal('')),
  addressLine1: z.string().trim().min(3).max(120),
  addressLine2: z.string().trim().max(120).optional().or(z.literal('')),
  suburb: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(60),
  province: z.enum(PROVINCES),
  postalCode: z.string().trim().regex(/^\d{4}$/, 'Postal code must be 4 digits'),
  employmentStatus: z.enum(EMPLOYMENT),
  incomeSource: z.enum(INCOME_SOURCES),
  incomeSourceOther: z.string().trim().max(120).optional().or(z.literal('')),
  monthlyIncomeBand: z.enum(INCOME_BANDS),
  yearsDriving: z.coerce.number().int().min(0).max(60).optional(),
  companyName: z.string().trim().max(120).optional().or(z.literal('')),
  companyRegNumber: z.string().trim().max(30).optional().or(z.literal('')),
  taxNumber: z.string().trim().max(20).optional().or(z.literal('')),
  sourceOfFunds: z.string().trim().min(10, 'Briefly describe where the money you will use comes from').max(500),
  isPep: z.boolean(),
  pepDetails: z.string().trim().max(300).optional().or(z.literal('')),
  actingOnOwnBehalf: yes,
  consentVerification: yes,
  consentPopia: yes,
  declarationTrue: yes,
  acceptTerms: yes,
  consentMarketing: z.boolean().default(false),
});
export type ProfileInput = z.infer<typeof profileSchema>;

/** Business rules that need more than field validation. Throws a 400 with a clear message. */
export function checkProfile(p: ProfileInput, role: 'owner' | 'driver', userId?: number) {
  if (p.idType === 'sa_id') {
    const dob = parseSaId(p.idNumber);
    if (!dob) throw new HttpError(400, 'That South African ID number is not valid. Check the 13 digits.');
    if (dob !== p.dateOfBirth) throw new HttpError(400, 'Your date of birth does not match your ID number');
  } else if (!/^[A-Z0-9]{6,20}$/.test(p.idNumber)) {
    throw new HttpError(400, 'Enter a valid passport number (letters and numbers only)');
  }
  if (p.idType === 'passport' && role === 'driver' && !p.workPermitNumber) {
    throw new HttpError(400, 'Foreign nationals need a valid work permit to drive for e-hailing platforms. Enter your permit number.');
  }
  const age = ageOn(p.dateOfBirth);
  if (age < 18 || age > 100) throw new HttpError(400, 'You must be at least 18 years old to register');
  if (role === 'driver' && age < 21) throw new HttpError(400, 'Drivers must be at least 21 years old to hold a PrDP and drive for e-hailing platforms');
  if (p.incomeSource === 'other' && !p.incomeSourceOther) throw new HttpError(400, 'Tell us your other source of income');
  if (p.isPep && !p.pepDetails) throw new HttpError(400, 'Please give details of the public position held');
  const dup = db.prepare('SELECT user_id FROM user_profiles WHERE id_type = ? AND id_number = ?').get(p.idType, p.idNumber) as { user_id: number } | undefined;
  if (dup && dup.user_id !== userId) throw new HttpError(409, 'An account already exists for this ID or passport number');
}

export function saveProfile(userId: number, p: ProfileInput, ip: string | undefined) {
  db.prepare(`INSERT INTO user_profiles (user_id, id_type, id_number, date_of_birth, nationality, work_permit_number,
      address_line1, address_line2, suburb, city, province, postal_code, employment_status, income_source, income_source_other,
      monthly_income_band, years_driving, company_name, company_reg_number, tax_number, source_of_funds, is_pep, pep_details,
      acting_on_own_behalf, consent_verification, consent_popia, consent_marketing, declaration_true, legal_version, accepted_at, accepted_ip)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,datetime('now'),?)
    ON CONFLICT(user_id) DO UPDATE SET id_type=excluded.id_type, id_number=excluded.id_number, date_of_birth=excluded.date_of_birth,
      nationality=excluded.nationality, work_permit_number=excluded.work_permit_number, address_line1=excluded.address_line1,
      address_line2=excluded.address_line2, suburb=excluded.suburb, city=excluded.city, province=excluded.province,
      postal_code=excluded.postal_code, employment_status=excluded.employment_status, income_source=excluded.income_source,
      income_source_other=excluded.income_source_other, monthly_income_band=excluded.monthly_income_band,
      years_driving=excluded.years_driving, company_name=excluded.company_name, company_reg_number=excluded.company_reg_number,
      tax_number=excluded.tax_number, source_of_funds=excluded.source_of_funds, is_pep=excluded.is_pep, pep_details=excluded.pep_details,
      acting_on_own_behalf=excluded.acting_on_own_behalf, consent_verification=excluded.consent_verification,
      consent_popia=excluded.consent_popia, consent_marketing=excluded.consent_marketing, declaration_true=excluded.declaration_true,
      legal_version=excluded.legal_version, accepted_at=excluded.accepted_at, accepted_ip=excluded.accepted_ip`)
    .run(userId, p.idType, p.idNumber, p.dateOfBirth, p.nationality, p.workPermitNumber || null,
      p.addressLine1, p.addressLine2 || null, p.suburb, p.city, p.province, p.postalCode, p.employmentStatus, p.incomeSource,
      p.incomeSourceOther || null, p.monthlyIncomeBand, p.yearsDriving ?? null, p.companyName || null, p.companyRegNumber || null,
      p.taxNumber || null, p.sourceOfFunds, p.isPep ? 1 : 0, p.pepDetails || null, 1, 1, 1, p.consentMarketing ? 1 : 0, 1,
      LEGAL_VERSION, ip ?? null);
}

const registerSchema = z.object({
  role: z.enum(ROLES),
  fullName: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(9).max(20),
  email: z.string().trim().email().optional().or(z.literal('')),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  city: z.string().trim().min(2).max(60).default('Cape Town'),
  platforms: z.array(z.enum(PLATFORMS)).default([]),
  profile: profileSchema,
});

authRouter.post('/register', (req, res) => {
  const b = registerSchema.parse(req.body);
  if (b.role === 'driver' && b.platforms.length === 0) throw new HttpError(400, 'Choose at least one platform you drive on');
  const phone = normalizePhone(b.phone);
  if (!/^\+27\d{9}$/.test(phone)) throw new HttpError(400, 'Enter a valid South African phone number');
  if (db.prepare('SELECT 1 FROM users WHERE phone = ?').get(phone)) {
    throw new HttpError(409, 'An account with this phone number already exists');
  }
  checkProfile(b.profile, b.role);
  const id = db.transaction(() => {
    const info = db.prepare(
      'INSERT INTO users (role, full_name, phone, email, city, platforms, password_hash) VALUES (?,?,?,?,?,?,?)',
    ).run(b.role, b.fullName, phone, b.email || null, b.profile.city, JSON.stringify(b.platforms), bcrypt.hashSync(b.password, 10));
    saveProfile(Number(info.lastInsertRowid), b.profile, req.ip);
    return Number(info.lastInsertRowid);
  })();
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow;
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

// Profile for accounts created before full sign-up details were required (or to update them).
authRouter.get('/profile', requireAuth, (req, res) => {
  const p = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(req.user!.id) as Record<string, unknown> | undefined;
  res.json({ profile: p ?? null });
});
authRouter.put('/profile', requireAuth, (req, res) => {
  const p = profileSchema.parse(req.body);
  checkProfile(p, req.user!.role, req.user!.id);
  saveProfile(req.user!.id, p, req.ip);
  db.prepare('UPDATE users SET city = ? WHERE id = ?').run(p.city, req.user!.id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user!.id) as UserRow;
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
