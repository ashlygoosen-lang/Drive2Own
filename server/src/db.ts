import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

export const DATA_DIR = path.resolve(process.env.DATA_DIR ?? './data');
export const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
export const DOC_DIR = path.join(UPLOAD_DIR, 'documents'); // private, never served statically
export const VEHICLE_IMG_DIR = path.join(UPLOAD_DIR, 'vehicles'); // public
fs.mkdirSync(DOC_DIR, { recursive: true });
fs.mkdirSync(VEHICLE_IMG_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, 'drive2own.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  role TEXT NOT NULL CHECK (role IN ('owner','driver')),
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  city TEXT NOT NULL DEFAULT 'Cape Town',
  platforms TEXT NOT NULL DEFAULT '[]',
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vehicles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER NOT NULL,
  plate TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL,
  seats INTEGER NOT NULL DEFAULT 5,
  fuel TEXT NOT NULL DEFAULT 'petrol',
  transmission TEXT NOT NULL DEFAULT 'manual',
  city TEXT NOT NULL DEFAULT 'Cape Town',
  weekly_rate INTEGER NOT NULL,
  deposit INTEGER NOT NULL DEFAULT 0,
  platforms TEXT NOT NULL DEFAULT '[]',
  description TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available','rented','hidden')),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS rentals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vehicle_id INTEGER NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  start_date TEXT NOT NULL,
  weeks INTEGER NOT NULL,
  weekly_rate INTEGER NOT NULL,
  deposit INTEGER NOT NULL DEFAULT 0,
  message TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','approved','declined','active','completed','cancelled')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rental_id INTEGER NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('deposit','weekly')),
  amount INTEGER NOT NULL,
  due_date TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','cancelled')),
  paid_at TEXT
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL,
  mime TEXT NOT NULL,
  size INTEGER NOT NULL,
  uploaded_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE (user_id, type)
);

CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_rentals_vehicle ON rentals(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rentals_driver ON rentals(driver_id);
CREATE INDEX IF NOT EXISTS idx_payments_rental ON payments(rental_id);
`);

// ---- Idempotent migrations (safe on both fresh and existing databases) ----
function addColumn(table: string, column: string, definition: string) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[];
  if (!cols.some((c) => c.name === column)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}
addColumn('users', 'is_admin', 'INTEGER NOT NULL DEFAULT 0');
addColumn('documents', 'status', "TEXT NOT NULL DEFAULT 'uploaded'");
addColumn('documents', 'review_note', 'TEXT');
addColumn('documents', 'reviewed_at', 'TEXT');
addColumn('rentals', 'agreement_text', 'TEXT');
addColumn('rentals', 'owner_accepted_at', 'TEXT');
addColumn('rentals', 'driver_accepted_at', 'TEXT');
addColumn('rentals', 'insurance_confirmed', 'INTEGER NOT NULL DEFAULT 0');
addColumn('payments', 'paid_via', 'TEXT');
addColumn('payments', 'provider_ref', 'TEXT');

db.exec(`
CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  link TEXT,
  read_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read_at);

CREATE TABLE IF NOT EXISTS password_resets (
  user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);
`);
