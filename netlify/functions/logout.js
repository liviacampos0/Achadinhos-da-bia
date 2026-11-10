import { json } from './_auth.js';
export default async function handler() {
  return json({ ok: true }, 200, { 'Set-Cookie': 'bia_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0' });
}
