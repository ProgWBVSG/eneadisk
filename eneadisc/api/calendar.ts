// Feed .ics: arma un calendario suscribible con las tareas (con fecha) y
// los eventos del usuario, identificado por su ics_token secreto.
export const config = { runtime: 'edge' };

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function rest(path: string): Promise<any[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}` },
  });
  if (!res.ok) return [];
  return res.json();
}

const pad = (n: number) => String(n).padStart(2, '0');
const toICS = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`;
};
const esc = (s: string) => (s || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

function vevent(uid: string, start: string, summary: string, opts: { end?: string; desc?: string; loc?: string }) {
  const lines = [
    'BEGIN:VEVENT',
    `UID:${uid}@eneateams`,
    `DTSTAMP:${toICS(new Date().toISOString())}`,
    `DTSTART:${toICS(start)}`,
  ];
  if (opts.end) lines.push(`DTEND:${toICS(opts.end)}`);
  lines.push(`SUMMARY:${esc(summary)}`);
  if (opts.desc) lines.push(`DESCRIPTION:${esc(opts.desc)}`);
  if (opts.loc) lines.push(`LOCATION:${esc(opts.loc)}`);
  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

export default async function handler(req: Request): Promise<Response> {
  try {
    const token = new URL(req.url).searchParams.get('token');
    if (!token || !SUPABASE_URL || !SERVICE_KEY) return new Response('Bad request', { status: 400 });

    const profiles = await rest(`profiles?ics_token=eq.${token}&select=id,company_id`);
    if (!profiles.length) return new Response('Not found', { status: 404 });
    const { id: userId, company_id } = profiles[0];

    const tasks = await rest(`tasks?user_id=eq.${userId}&due_date=not.is.null&select=id,title,due_date`);
    const events = company_id ? await rest(`events?company_id=eq.${company_id}&select=id,title,description,location,start_at,end_at`) : [];

    const parts = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EneaTeams//Calendar//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:EneaTeams',
      'NAME:EneaTeams',
    ];
    for (const t of tasks) parts.push(vevent('task-' + t.id, t.due_date, `📋 ${t.title}`, { desc: 'Tarea de EneaTeams' }));
    for (const e of events) parts.push(vevent('event-' + e.id, e.start_at, e.title, { end: e.end_at || undefined, desc: e.description || undefined, loc: e.location || undefined }));
    parts.push('END:VCALENDAR');

    return new Response(parts.join('\r\n'), {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
        'Content-Disposition': 'inline; filename="eneateams.ics"',
      },
    });
  } catch (e) {
    return new Response('Error', { status: 500 });
  }
}
