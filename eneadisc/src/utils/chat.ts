// ============================================================
// EneaChat — capa de datos del chat en vivo
// ============================================================
import { supabase } from '../lib/supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface DirectoryPerson {
  id: string;
  fullName: string;
  role: 'company_admin' | 'supervisor' | 'employee';
  enneagramType: number | null;
}

export interface Conversation {
  conversationId: string;
  otherId: string;
  otherName: string;
  otherRole: 'company_admin' | 'supervisor' | 'employee';
  otherEnneagram: number | null;
  lastBody: string | null;
  lastKind: 'text' | 'task' | 'task_review' | null;
  lastAt: string | null;
  unread: number;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  body: string | null;
  kind: 'text' | 'task' | 'task_review';
  taskId: string | null;
  meta: any;
  createdAt: string;
}

// ── Mappers ──────────────────────────────────────────────
const mapMsg = (r: any): ChatMessage => ({
  id: r.id,
  conversationId: r.conversation_id,
  senderId: r.sender_id,
  body: r.body,
  kind: r.kind,
  taskId: r.task_id,
  meta: r.meta,
  createdAt: r.created_at,
});

// ── Directorio: con quién puedo chatear ──────────────────
export const getDirectory = async (): Promise<DirectoryPerson[]> => {
  const { data, error } = await supabase.rpc('get_company_directory');
  if (error) throw error;
  return (data || []).map((r: any) => ({
    id: r.id,
    fullName: r.full_name || 'Sin nombre',
    role: r.role,
    enneagramType: r.enneagram_type ?? null,
  }));
};

// ── Mis conversaciones (preview + no leídos) ─────────────
export const getConversations = async (): Promise<Conversation[]> => {
  const { data, error } = await supabase.rpc('get_my_conversations');
  if (error) throw error;
  return (data || []).map((r: any) => ({
    conversationId: r.conversation_id,
    otherId: r.other_id,
    otherName: r.other_name || 'Sin nombre',
    otherRole: r.other_role,
    otherEnneagram: r.other_enneagram ?? null,
    lastBody: r.last_body,
    lastKind: r.last_kind,
    lastAt: r.last_at,
    unread: Number(r.unread || 0),
  }));
};

// ── Suma total de no leídos (para el badge del sidebar) ──
export const getTotalUnread = async (): Promise<number> => {
  const convs = await getConversations();
  return convs.reduce((acc, c) => acc + c.unread, 0);
};

// ── Abrir (o crear) un DM con otra persona ───────────────
export const openDirect = async (otherId: string): Promise<string> => {
  const { data, error } = await supabase.rpc('get_or_create_direct_conversation', { p_other: otherId });
  if (error) throw error;
  return data as string;
};

// ── Mensajes de una conversación ─────────────────────────
export const getMessages = async (conversationId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapMsg);
};

// ── Enviar texto ─────────────────────────────────────────
export const sendText = async (conversationId: string, body: string, senderId: string): Promise<ChatMessage> => {
  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, body: body.trim(), kind: 'text' })
    .select()
    .single();
  if (error) throw error;
  return mapMsg(data);
};

// ── Enviar una tarea ─────────────────────────────────────
export const sendTask = async (
  conversationId: string,
  recipientId: string,
  title: string,
  description: string,
  priority: 'low' | 'medium' | 'high',
  due?: string
): Promise<void> => {
  const { error } = await supabase.rpc('send_chat_task', {
    p_conv: conversationId,
    p_recipient: recipientId,
    p_title: title,
    p_desc: description,
    p_priority: priority,
    p_due: due || null,
  });
  if (error) throw error;
};

// ── Corregir / revisar una tarea ─────────────────────────
export const reviewTaskInChat = async (
  conversationId: string,
  taskId: string,
  status: 'confirmed' | 'needs_fix',
  note: string
): Promise<void> => {
  const { error } = await supabase.rpc('review_chat_task', {
    p_conv: conversationId,
    p_task: taskId,
    p_status: status,
    p_note: note,
  });
  if (error) throw error;
};

// ── Marcar como leída ────────────────────────────────────
export const markRead = async (conversationId: string): Promise<void> => {
  await supabase.rpc('mark_conversation_read', { p_conv: conversationId });
};

// ── Realtime: escuchar mensajes nuevos de UNA conversación ──
export const subscribeToConversation = (
  conversationId: string,
  onMessage: (m: ChatMessage) => void
): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel(`conv:${conversationId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
      (payload) => onMessage(mapMsg(payload.new))
    )
    .subscribe();
  return () => { supabase.removeChannel(channel); };
};

// ── Realtime global: cualquier mensaje nuevo que me llegue ──
// (RLS asegura que solo recibo mensajes de mis conversaciones)
export const subscribeToAllMessages = (onAny: () => void): (() => void) => {
  const channel: RealtimeChannel = supabase
    .channel('chat:all')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => onAny())
    .subscribe();
  return () => { supabase.removeChannel(channel); };
};

// ── Presencia "en línea" (Realtime Presence, por empresa) ───
// Cada usuario se "trackea" con su id como clave. El canal está
// scopeado por empresa para no exponer presencia entre compañías.
export const subscribeToPresence = (
  companyId: string,
  userId: string,
  onChange: (online: Set<string>) => void
): (() => void) => {
  const channel = supabase.channel(`presence:company:${companyId}`, {
    config: { presence: { key: userId } },
  });
  channel.on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    onChange(new Set(Object.keys(state)));
  });
  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.track({ online_at: new Date().toISOString() });
    }
  });
  return () => { supabase.removeChannel(channel); };
};
