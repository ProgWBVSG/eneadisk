// Notificaciones a Slack/Discord (vía /api/notify, server-side)
import { supabase } from '../lib/supabase';

export const setWebhook = async (url: string): Promise<void> => {
  const { error } = await supabase.rpc('set_company_webhook', { p_url: url });
  if (error) throw error;
};

export const isWebhookConfigured = async (): Promise<boolean> => {
  const { data } = await supabase.rpc('company_webhook_configured');
  return !!data;
};

export const sendToChannel = async (text: string): Promise<{ ok: boolean; error?: string }> => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { ok: false, error: 'Sin sesión' };
  const res = await fetch('/api/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ text }),
  });
  if (res.ok) return { ok: true };
  return { ok: false, error: await res.text() };
};
