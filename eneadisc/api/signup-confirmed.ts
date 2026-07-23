// Crea una cuenta YA CONFIRMADA usando la service key, evitando el paso de
// email de verificación. Motivo: el envío de mail de Supabase (gratuito)
// tiene mala entregabilidad a casillas corporativas (filtros de spam
// empresariales lo rechazan), dejando a esas personas sin poder registrarse.
// Con esto, cualquier dominio de email (gmail, corporativo, el que sea)
// funciona igual — sin depender de que llegue un correo.
export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const CORS_HEADERS = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

interface Body {
  email: string;
  password: string;
  fullName: string;
  role: 'employee' | 'company_admin';
  inviteCode?: string; // requerido si role = employee
}

async function svc(path: string, init?: RequestInit) {
  return fetch(`${SUPABASE_URL}${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS_HEADERS });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS_HEADERS });
  if (!SUPABASE_URL || !SERVICE_KEY) {
    return new Response(JSON.stringify({ error: 'Servidor no configurado.' }), { status: 500, headers: CORS_HEADERS });
  }

  try {
    const body: Body = await req.json();
    const email = (body.email || '').trim().toLowerCase();
    const password = body.password || '';
    const fullName = (body.fullName || '').trim();
    const role = body.role;

    if (!email || !email.includes('@')) return new Response(JSON.stringify({ error: 'Email inválido.' }), { status: 400, headers: CORS_HEADERS });
    if (password.length < 8) return new Response(JSON.stringify({ error: 'La contraseña debe tener al menos 8 caracteres.' }), { status: 400, headers: CORS_HEADERS });
    if (!fullName) return new Response(JSON.stringify({ error: 'Falta el nombre.' }), { status: 400, headers: CORS_HEADERS });
    if (role !== 'employee' && role !== 'company_admin') return new Response(JSON.stringify({ error: 'Rol inválido.' }), { status: 400, headers: CORS_HEADERS });

    let companyId: string | null = null;
    if (role === 'employee') {
      if (!body.inviteCode) return new Response(JSON.stringify({ error: 'Falta el código de invitación.' }), { status: 400, headers: CORS_HEADERS });
      const compRes = await svc(`/rest/v1/companies?invite_code=eq.${encodeURIComponent(body.inviteCode.trim().toUpperCase())}&select=id`);
      const comps = compRes.ok ? await compRes.json() : [];
      if (!comps.length) return new Response(JSON.stringify({ error: 'Código de invitación inválido.' }), { status: 400, headers: CORS_HEADERS });
      companyId = comps[0].id;
    }

    // Crear el usuario YA CONFIRMADO (email_confirm: true evita el mail de verificación)
    const createRes = await svc('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email, password, email_confirm: true,
        user_metadata: { role, full_name: fullName },
      }),
    });
    const created = await createRes.json();
    if (!createRes.ok) {
      const msg = String(created?.msg || created?.error_description || created?.message || '');
      if (/already.*registered|already exists|duplicate/i.test(msg)) {
        return new Response(JSON.stringify({ error: 'Ya existe una cuenta con este email.', code: 'email_exists' }), { status: 409, headers: CORS_HEADERS });
      }
      return new Response(JSON.stringify({ error: msg || 'No se pudo crear la cuenta.' }), { status: 502, headers: CORS_HEADERS });
    }

    const userId = created.id as string;

    // Asegurar el perfil (el trigger de la BD ya lo crea, pero por las dudas)
    await svc('/rest/v1/profiles', {
      method: 'POST',
      headers: { Prefer: 'resolution=merge-duplicates' },
      body: JSON.stringify({
        id: userId, role, full_name: fullName, email,
        questionnaire_completed: role === 'company_admin',
      }),
    });

    // Empleado: registrar la solicitud de ingreso (pendiente de aprobación del admin)
    if (role === 'employee' && companyId) {
      await svc('/rest/v1/join_requests', {
        method: 'POST',
        headers: { Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify({ company_id: companyId, user_id: userId, full_name: fullName, email, status: 'pending' }),
      });
    }

    return new Response(JSON.stringify({ ok: true, userId }), { status: 200, headers: CORS_HEADERS });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Error inesperado';
    return new Response(JSON.stringify({ error: msg }), { status: 500, headers: CORS_HEADERS });
  }
}
