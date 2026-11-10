import crypto from 'node:crypto';

export function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function validSession(request) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  const raw = request.headers.get('cookie') || '';
  const match = raw.match(/(?:^|;\s*)bia_session=([^;]+)/);
  if (!match) return false;
  let token;
  try { token = decodeURIComponent(match[1]); } catch { return false; }
  const [exp, signature] = token.split('.');
  if (!exp || !signature || !/^\d+$/.test(exp) || Number(exp) < Date.now()) return false;
  const expected = sign(exp, secret);
  const a = Buffer.from(signature, 'hex');
  const b = Buffer.from(expected, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extraHeaders }
  });
}
