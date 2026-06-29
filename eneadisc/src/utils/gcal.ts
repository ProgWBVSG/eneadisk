// Google Calendar (dos vías) reutilizando el OAuth de Google de Supabase.
// Pide el scope de calendar.events; con el provider_token de Google
// empuja los eventos/tareas de EneaTeams al calendario primario.
import { supabase } from '../lib/supabase';

const SCOPE = 'https://www.googleapis.com/auth/calendar.events';

export const connectGoogleCalendar = async (): Promise<void> => {
  const redirectTo = `${window.location.origin}${window.location.pathname}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { scopes: SCOPE, redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' } },
  });
  if (error) throw error;
};

// Captura el token de Google tras volver del OAuth (queda en sessionStorage)
export const captureGoogleToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  const t = (session as any)?.provider_token as string | undefined;
  if (t) { sessionStorage.setItem('gcal_token', t); return t; }
  return sessionStorage.getItem('gcal_token');
};

export interface PushItem { rawId: string; kind: string; title: string; at: string; subtitle?: string }

// Empuja items al Google Calendar primario. Evita duplicados (localStorage).
export const pushToGoogle = async (token: string, items: PushItem[]): Promise<{ added: number; expired: boolean }> => {
  const pushed = new Set<string>(JSON.parse(localStorage.getItem('gcal_pushed') || '[]'));
  let added = 0, expired = false;
  for (const it of items) {
    const key = it.kind + it.rawId;
    if (pushed.has(key)) continue;
    const start = new Date(it.at);
    const end = new Date(start.getTime() + 30 * 60000);
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        summary: it.title,
        description: it.subtitle || 'EneaTeams',
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      }),
    });
    if (res.status === 401) { expired = true; break; }
    if (res.ok) { pushed.add(key); added++; }
  }
  localStorage.setItem('gcal_pushed', JSON.stringify([...pushed]));
  return { added, expired };
};
