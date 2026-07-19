// Ping diario a Supabase para que el proyecto free no se pause por inactividad.
// Lo dispara el cron de Vercel (vercel.json) una vez por día.
export const config = { runtime: 'edge' };

export default async function handler(): Promise<Response> {
  const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return new Response('env missing', { status: 500 });

  // Consulta mínima: cuenta de companies (head), suficiente para registrar actividad.
  const res = await fetch(`${url}/rest/v1/companies?select=id&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  return new Response(JSON.stringify({ ok: res.ok, at: new Date().toISOString() }), {
    status: res.ok ? 200 : 502,
    headers: { 'Content-Type': 'application/json' },
  });
}
