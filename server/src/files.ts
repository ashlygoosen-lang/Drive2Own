import fs from 'node:fs';

/** Verifies the file's real content matches the claimed MIME type (the client-sent type can be spoofed). */
export function signatureMatches(filePath: string, mime: string): boolean {
  const fd = fs.openSync(filePath, 'r');
  const b = Buffer.alloc(12);
  try { fs.readSync(fd, b, 0, 12, 0); } finally { fs.closeSync(fd); }
  switch (mime) {
    case 'application/pdf': return b.subarray(0, 4).toString('latin1') === '%PDF';
    case 'image/jpeg': return b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    case 'image/png': return b.subarray(0, 4).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47]));
    case 'image/webp': return b.subarray(0, 4).toString('latin1') === 'RIFF' && b.subarray(8, 12).toString('latin1') === 'WEBP';
    default: return false;
  }
}
