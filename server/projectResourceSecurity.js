import net from 'node:net';

export const MAX_PROJECT_RESOURCE_BYTES = 8 * 1024 * 1024;
export const PROJECT_RESOURCE_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf',
]);

export function validateProjectResourceBytes(bytes, mimeType) {
  if (!Buffer.isBuffer(bytes) || !bytes.length || bytes.length > MAX_PROJECT_RESOURCE_BYTES || !PROJECT_RESOURCE_MIME_TYPES.has(mimeType)) return false;
  if (mimeType === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  if (mimeType === 'image/webp') return bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  if (mimeType === 'video/mp4') return bytes.subarray(4, 8).toString('ascii') === 'ftyp';
  if (mimeType === 'video/webm') return bytes.subarray(0, 4).equals(Buffer.from([0x1a, 0x45, 0xdf, 0xa3]));
  return bytes.subarray(0, 5).toString('ascii') === '%PDF-';
}

export function validateExternalProjectResourceUrl(value) {
  let url;
  try { url = new URL(value); } catch { return null; }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '');
  if (url.protocol !== 'https:' || url.username || url.password || !hostname
    || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local') || hostname.endsWith('.internal')
    || net.isIP(hostname)) return null;
  return url;
}
