import { supabase } from '../lib/supabase';

// ── KUDOS (reconocimiento entre pares) ─────────────────────
export interface Kudo {
  id: string;
  fromUser: string;
  toUser: string;
  fromName?: string;
  toName?: string;
  category: string;
  message: string;
  createdAt: string;
}

export const sendKudo = async (
  companyId: string,
  toUser: string,
  category: string,
  message: string
): Promise<{ error: string | null }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };
  const { error } = await supabase.from('kudos').insert({
    company_id: companyId,
    from_user: user.id,
    to_user: toUser,
    category,
    message,
  });
  return { error: error ? error.message : null };
};

// Devuelve los kudos de la empresa con nombres resueltos
export const getCompanyKudos = async (limit = 20): Promise<Kudo[]> => {
  const { data, error } = await supabase
    .from('kudos')
    .select('id, from_user, to_user, category, message, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return [];

  // Resolver nombres de los usuarios involucrados
  const ids = Array.from(new Set(data.flatMap((k: any) => [k.from_user, k.to_user])));
  const nameMap: Record<string, string> = {};
  if (ids.length > 0) {
    // Usamos la RPC de teammates + el propio perfil para mapear nombres
    const { data: mates } = await supabase.rpc('get_my_teammates');
    (mates || []).forEach((m: any) => { nameMap[m.id] = m.full_name; });
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: me } = await supabase.from('profiles').select('full_name').eq('id', user.id).maybeSingle();
      if (me) nameMap[user.id] = me.full_name;
    }
  }

  return data.map((k: any) => ({
    id: k.id,
    fromUser: k.from_user,
    toUser: k.to_user,
    fromName: nameMap[k.from_user] || 'Alguien',
    toName: nameMap[k.to_user] || 'Alguien',
    category: k.category,
    message: k.message,
    createdAt: k.created_at,
  }));
};

// ── METAS DE DESARROLLO ────────────────────────────────────
export interface Goal {
  id: string;
  title: string;
  area?: string;
  status: 'active' | 'done';
  createdAt: string;
}

export const getGoals = async (userId: string): Promise<Goal[]> => {
  const { data } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return (data || []).map((g: any) => ({
    id: g.id, title: g.title, area: g.area, status: g.status, createdAt: g.created_at,
  }));
};

export const addGoal = async (userId: string, title: string, area?: string): Promise<void> => {
  await supabase.from('goals').insert({ user_id: userId, title, area });
};

export const toggleGoal = async (goalId: string, done: boolean): Promise<void> => {
  await supabase.from('goals').update({
    status: done ? 'done' : 'active',
    completed_at: done ? new Date().toISOString() : null,
  }).eq('id', goalId);
};

export const deleteGoal = async (goalId: string): Promise<void> => {
  await supabase.from('goals').delete().eq('id', goalId);
};

// ── DIARIO DE CRECIMIENTO ──────────────────────────────────
export interface JournalEntry {
  id: string;
  prompt?: string;
  content: string;
  createdAt: string;
}

export const getJournalEntries = async (userId: string): Promise<JournalEntry[]> => {
  const { data } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  return (data || []).map((j: any) => ({
    id: j.id, prompt: j.prompt, content: j.content, createdAt: j.created_at,
  }));
};

export const addJournalEntry = async (userId: string, content: string, prompt?: string): Promise<void> => {
  await supabase.from('journal_entries').insert({ user_id: userId, content, prompt });
};

// ── TERMÓMETRO DE EQUIPO ───────────────────────────────────
export interface TeamMood {
  avgEnergy: number;
  avgStress: number;
  checkinCount: number;
  memberCount: number;
}

export const getTeamMood = async (): Promise<TeamMood | null> => {
  const { data, error } = await supabase.rpc('get_team_mood');
  if (error || !data || data.length === 0) return null;
  const row = data[0];
  return {
    avgEnergy: Number(row.avg_energy) || 0,
    avgStress: Number(row.avg_stress) || 0,
    checkinCount: Number(row.checkin_count) || 0,
    memberCount: Number(row.member_count) || 0,
  };
};
