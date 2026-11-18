import crypto from 'node:crypto';

const sandbox = () => process.env.PAYFAST_SANDBOX === '1';
export const payfastEnabled = () => !!(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY);

const processUrl = () => (sandbox() ? 'https://sandbox.payfast.co.za/eng/process' : 'https://www.payfast.co.za/eng/process');
export const validateUrl = () =>
  process.env.PAYFAST_VALIDATE_URL ?? (sandbox() ? 'https://sandbox.payfast.co.za/eng/query/validate' : 'https://www.payfast.co.za/eng/query/validate');

/** PHP-style urlencode with uppercase hex, as PayFast requires for signatures. */
export function pfEncode(v: string): string {
  return encodeURIComponent(v.trim())
    .replace(/[!'()*~]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`)
    .replace(/%20/g, '+');
}

export function signature(fields: [string, string][], passphrase?: string): string {
  let str = fields.filter(([, v]) => v !== '').map(([k, v]) => `${k}=${pfEncode(v)}`).join('&');
  if (passphrase) str += `&passphrase=${pfEncode(passphrase)}`;
  return crypto.createHash('md5').update(str).digest('hex');
}

export const queryString = (fields: [string, string][]) =>
  fields.filter(([, v]) => v !== '').map(([k, v]) => `${k}=${pfEncode(v)}`).join('&');

export interface PayInput { paymentId: number; amount: number; itemName: string; firstName: string; email?: string | null }

/** Builds the signed form fields the browser POSTs to PayFast. Field order matters for the signature. */
export function buildCheckout(p: PayInput, urls: { returnUrl: string; cancelUrl: string; notifyUrl: string }) {
  const fields: [string, string][] = [
    ['merchant_id', process.env.PAYFAST_MERCHANT_ID!],
    ['merchant_key', process.env.PAYFAST_MERCHANT_KEY!],
    ['return_url', urls.returnUrl],
    ['cancel_url', urls.cancelUrl],
    ['notify_url', urls.notifyUrl],
    ['name_first', p.firstName],
    ['email_address', p.email ?? ''],
    ['m_payment_id', String(p.paymentId)],
    ['amount', p.amount.toFixed(2)],
    ['item_name', p.itemName.slice(0, 100)],
  ];
  const sig = signature(fields, process.env.PAYFAST_PASSPHRASE);
  return {
    url: processUrl(),
    fields: Object.fromEntries([...fields.filter(([, v]) => v !== ''), ['signature', sig]]),
  };
}
