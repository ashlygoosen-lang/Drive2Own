import { db } from './db.js';
import { normalizePhone } from './routes/auth.js';

const raw = process.argv[2];
if (!raw) { console.error('Usage: npm run make-admin -- <phone>'); process.exit(1); }
const info = db.prepare('UPDATE users SET is_admin = 1 WHERE phone = ?').run(normalizePhone(raw));
console.log(info.changes ? `${normalizePhone(raw)} is now an admin.` : 'No user with that phone number. Register first.');
