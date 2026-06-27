// ============================================================
// Calendario: eventos/reuniones (tabla events) + tareas con fecha
// ============================================================
import { supabase } from '../lib/supabase';

export interface CalEvent {
  id: string;
  title: string;
  description?: string;
  location?: string;
  startAt: string;
  endAt?: string;
  createdBy: string;
}

export interface AgendaItem {
  id: string;
  rawId: string;         // id real (sin prefijo) para borrar eventos
  kind: 'event' | 'task';
  title: string;
  at: string;            // ISO datetime para ordenar/agrupar
  subtitle?: string;
  done?: boolean;        // tareas completadas
  ownEvent?: boolean;    // evento creado por mí (se puede borrar)
}

const mapEvent = (r: any): CalEvent => ({
  id: r.id, title: r.title, description: r.description, location: r.location,
  startAt: r.start_at, endAt: r.end_at, createdBy: r.created_by,
});

export const getEvents = async (): Promise<CalEvent[]> => {
  const { data, error } = await supabase.from('events').select('*').order('start_at', { ascending: true });
  if (error) throw error;
  return (data || []).map(mapEvent);
};

export const createEvent = async (e: {
  companyId: string; createdBy: string; title: string;
  startAt: string; endAt?: string; description?: string; location?: string; teamId?: string;
}): Promise<void> => {
  const { error } = await supabase.from('events').insert({
    company_id: e.companyId, created_by: e.createdBy, title: e.title.trim(),
    start_at: e.startAt, end_at: e.endAt || null,
    description: e.description?.trim() || null, location: e.location?.trim() || null,
    team_id: e.teamId || null,
  });
  if (error) throw error;
};

export const deleteEvent = async (id: string): Promise<void> => {
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) throw error;
};

// Tareas del usuario con fecha de vencimiento
export const getMyDueTasks = async (userId: string): Promise<{ id: string; title: string; dueDate: string; done: boolean }[]> => {
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, due_date, status')
    .eq('user_id', userId)
    .not('due_date', 'is', null);
  if (error) throw error;
  return (data || []).map((t: any) => ({ id: t.id, title: t.title, dueDate: t.due_date, done: t.status === 'completed' }));
};

// Une eventos + tareas en una agenda ordenada (desde hoy en adelante)
export const buildAgenda = (events: CalEvent[], tasks: { id: string; title: string; dueDate: string; done: boolean }[], myId: string): AgendaItem[] => {
  const items: AgendaItem[] = [];
  events.forEach((e) => items.push({
    id: 'e' + e.id, rawId: e.id, kind: 'event', title: e.title, at: e.startAt,
    subtitle: e.location || e.description, ownEvent: e.createdBy === myId,
  }));
  tasks.forEach((t) => items.push({
    id: 't' + t.id, rawId: t.id, kind: 'task', title: t.title, at: t.dueDate, done: t.done, subtitle: 'Tarea',
  }));
  return items.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
};
