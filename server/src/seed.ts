import bcrypt from 'bcryptjs';
import { db } from './db.js';

if (db.prepare('SELECT COUNT(*) AS n FROM users').get() && (db.prepare('SELECT COUNT(*) AS n FROM users').get() as { n: number }).n > 0) {
  console.log('Database already has users — skipping seed.');
  process.exit(0);
}
const hash = bcrypt.hashSync('Password123!', 10);
const user = db.prepare('INSERT INTO users (role, full_name, phone, email, city, platforms, password_hash) VALUES (?,?,?,?,?,?,?)');
const owner = Number(user.run('owner', 'Thandi Mokoena', '+27821234567', 'thandi@example.com', 'Cape Town', '[]', hash).lastInsertRowid);
const owner2 = Number(user.run('owner', 'Pieter van Wyk', '+27837654321', null, 'Cape Town', '[]', hash).lastInsertRowid);
user.run('driver', 'Sipho Dlamini', '+27829876543', null, 'Cape Town', '["uber","bolt"]', hash);

const v = db.prepare(`INSERT INTO vehicles (owner_id, make, model, year, plate, color, seats, fuel, transmission, city, weekly_rate, deposit, platforms, description)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`);
const all = '["uber","indrive","bolt"]';
v.run(owner, 'Toyota', 'Corolla Quest', 2021, 'CA 123-456', 'White', 5, 'petrol', 'manual', 'Cape Town', 2800, 3000, all, 'Reliable and fuel-efficient, fully serviced. Meets Uber, inDrive and Bolt vehicle requirements.');
v.run(owner, 'Volkswagen', 'Polo Vivo', 2020, 'CA 234-567', 'Silver', 5, 'petrol', 'manual', 'Cape Town', 2500, 2500, all, 'Low running costs, aircon, Bluetooth. Great for city driving.');
v.run(owner, 'Hyundai', 'Accent', 2022, 'CA 345-678', 'Grey', 5, 'petrol', 'automatic', 'Cape Town', 3200, 4000, '["uber","bolt"]', 'Automatic and comfortable — ideal for long shifts.');
v.run(owner2, 'Toyota', 'Avanza', 2019, 'CA 456-789', 'Silver', 7, 'petrol', 'manual', 'Cape Town', 3000, 3500, all, '7-seater suited to Uber XL and group trips.');
v.run(owner2, 'Nissan', 'Almera', 2021, 'CA 567-890', 'Black', 5, 'petrol', 'manual', 'Cape Town', 2600, 2500, all, 'Spacious boot and back seat, regularly serviced.');
v.run(owner2, 'Honda', 'Civic', 2020, 'CA 678-901', 'Blue', 5, 'petrol', 'automatic', 'Cape Town', 3800, 5000, '["uber"]', 'Premium comfort for Uber Comfort rides.');
console.log('Seeded. Demo logins (password Password123!):\n  owner  0821234567\n  owner  0837654321\n  driver 0829876543');
