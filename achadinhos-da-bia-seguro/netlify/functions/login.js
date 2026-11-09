import crypto from 'node:crypto';
import { sign, json } from './_auth.js';

export default async function handler(request) {
  if (request.method !== 'POST') return json({ error: 'Método não permitido' }, 405);
  let body;
  try { body = await request.json(); } catch { return json({ error: 'Pedido inválido' }, 400); }
  const expected = process.env.ADMIN_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!expected || !secret) return json({ error: 'Configuração do servidor incompleta. Configure ADMIN_PASSWORD e SESSION_SECRET no Netlify.' }, 500);
  const supplied = typeof body.password === 'string' ? body.password : '';
  const a = crypto.createHash('sha256').update(supplied).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  if (!crypto.timingSafeEqual(a, b)) return json({ error: 'Senha incorreta' }, 401);
  const exp = String(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = `${exp}.${sign(exp, secret)}`;
  return json({ ok: true }, 200, { 'Set-Cookie': `bia_session=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=604800` });
}
