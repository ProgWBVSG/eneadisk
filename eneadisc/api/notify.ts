// Postea un mensaje al webhook de Slack/Discord de la empresa.
// Verifica que el llamante sea admin; la URL del webhook nunca toca el cliente.
export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

async function svc(path: string): Promise<any[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  return res.ok ? res.json() : [];
}

export default async function handler(req: Request): Promise<Response> {
  try {
    if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
    const auth = req.headers.get('authorization') || '';
    const jwt = auth.replace(/^Bearer\s+/i, '');
    if (!jwt || !SUPABASE_URL || !SERVICE_KEY) return new Response('Unauthorized', { status: 401 });

    // Identificar al usuario por su JWT
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: ANON_KEY || SERVICE_KEY, Authorization: `Bearer ${jwt}` },
    });
    if (!userRes.ok) return new Response('Unauthorized', { status: 401 });
    const user = await userRes.json();

    // Verificar rol admin + traer webhook (con service key)
    const prof = await svc(`profiles?id=eq.${user.id}&select=role,company_id`);
    if (!prof.length || prof[0].role !== 'company_admin') return new Response('Forbidden', { status: 403 });
    const comp = await svc(`companies?id=eq.${prof[0].company_id}&select=notify_webhook_url`);
    const hook = comp[0]?.notify_webhook_url;
    if (!hook) return new Response('Webhook no configurado', { status: 400 });

    const { text } = await req.json();
    if (!text || typeof text !== 'string') return new Response('Falta el texto', { status: 400 });

    // Slack usa {text}; Discord usa {content}
    const payload = /discord(app)?\.com/.test(hook) ? { content: text } : { text };
    const post = await fetch(hook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!post.ok) return new Response('Error al postear', { status: 502 });

    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e) {
    return new Response('Error', { status: 500 });
  }
}
