import { getStore } from '@netlify/blobs';
import { validSession, json } from './_auth.js';
import { defaultProducts } from './default-products.js';

export default async function handler(request) {
  const store = getStore('achadinhos-da-bia');
  if (request.method === 'GET') {
    try {
      const saved = await store.get('products', { type: 'json' });
      return json(saved || { products: defaultProducts });
    } catch (error) {
      console.error('Erro ao ler catálogo:', error);
      return json({ error: 'Não foi possível carregar o catálogo.' }, 500);
    }
  }
  if (request.method === 'PUT') {
    if (!validSession(request)) return json({ error: 'Acesso não autorizado. Entre novamente no painel.' }, 401);
    let data;
    try { data = await request.json(); } catch { return json({ error: 'Dados inválidos' }, 400); }
    if (!Array.isArray(data.products) || data.products.length > 500) return json({ error: 'Lista de produtos inválida' }, 400);
    try {
      await store.setJSON('products', { products: data.products });
      return json({ ok: true });
    } catch (error) {
      console.error('Erro ao salvar catálogo:', error);
      return json({ error: 'Não foi possível salvar. Tente novamente.' }, 500);
    }
  }
  return json({ error: 'Método não permitido' }, 405);
}
