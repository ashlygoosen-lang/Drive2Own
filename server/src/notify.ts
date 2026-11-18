import { db } from './db.js';

/** Sends an SMS through Twilio when configured; otherwise logs it (development). */
export async function sendSms(phone: string, text: string): Promise<void> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (!sid || !token || !from) {
    if (process.env.NODE_ENV !== 'production') console.log(`[sms:dev] to ${phone}: ${text}`);
    return;
  }
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: phone, From: from, Body: text }),
  });
  if (!res.ok) console.error('SMS failed', res.status, await res.text().catch(() => ''));
}

export const smsEnabled = () => !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);

/** Creates an in-app notification, and optionally an SMS for time-sensitive events. */
export function notify(userId: number, n: { title: string; body?: string; link?: string; sms?: boolean }): void {
  db.prepare('INSERT INTO notifications (user_id, title, body, link) VALUES (?,?,?,?)').run(userId, n.title, n.body ?? '', n.link ?? null);
  if (n.sms) {
    const u = db.prepare('SELECT phone FROM users WHERE id = ?').get(userId) as { phone: string } | undefined;
    if (u) sendSms(u.phone, `Drive2Own: ${n.title}${n.body ? ` — ${n.body}` : ''}`.slice(0, 300)).catch((e) => console.error('SMS error', e));
  }
}
