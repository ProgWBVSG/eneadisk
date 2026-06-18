import { supabase } from '../lib/supabase';

// ── GENTE QUE SUPERVISO ────────────────────────────────────
export interface SupervisedPerson {
  id: string;
  name: string;
  enneagramType: number | null;
  avgEnergy: number;
  avgStress: number;
  checkinCount: number;
  risk: 'ok' | 'watch' | 'high';
}

function risk(stress: number, energy: number, count: number): 'ok' | 'watch' | 'high' {
  if (count === 0) return 'ok';
  if (stress >= 4 || energy <= 2) return 'high';
  if (stress >= 3.3 || energy <= 2.6) return 'watch';
  return 'ok';
}

export const getSupervisedPeople = async (): Promise<SupervisedPerson[]> => {
  const { data, error } = await supabase.rpc('get_supervised_people');
  if (error || !data) return [];
  return data.map((e: any) => ({
    id: e.id,
    name: e.full_name || 'Sin nombre',
    enneagramType: e.questionnaire_completed ? e.enneagram_type : null,
    avgEnergy: Number(e.avg_energy) || 0,
    avgStress: Number(e.avg_stress) || 0,
    checkinCount: Number(e.checkin_count) || 0,
    risk: risk(Number(e.avg_stress) || 0, Number(e.avg_energy) || 0, Number(e.checkin_count) || 0),
  }));
};

export interface SupervisedMood { avgEnergy: number; avgStress: number; checkinCount: number; peopleCount: number; }
export const getSupervisedMood = async (): Promise<SupervisedMood | null> => {
  const { data, error } = await supabase.rpc('get_supervised_mood');
  if (error || !data || data.length === 0) return null;
  const r = data[0];
  return {
    avgEnergy: Number(r.avg_energy) || 0,
    avgStress: Number(r.avg_stress) || 0,
    checkinCount: Number(r.checkin_count) || 0,
    peopleCount: Number(r.people_count) || 0,
  };
};

// ── TAREAS DE MI GENTE (para revisar) ──────────────────────
export interface SupervisedTask {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  reviewStatus: 'confirmed' | 'needs_fix' | null;
  reviewNote?: string;
  dueDate?: string;
}

// Trae las tareas de un conjunto de empleados (los que superviso)
export const getTeamMemberTasks = async (employeeIds: string[]): Promise<SupervisedTask[]> => {
  if (employeeIds.length === 0) return [];
  const { data } = await supabase
    .from('tasks')
    .select('id, user_id, title, description, status, priority, review_status, review_note, due_date')
    .in('user_id', employeeIds)
    .order('created_at', { ascending: false });
  return (data || []).map((t: any) => ({
    id: t.id, userId: t.user_id, title: t.title, description: t.description,
    status: t.status, priority: t.priority,
    reviewStatus: t.review_status, reviewNote: t.review_note, dueDate: t.due_date,
  }));
};

// Revisar una tarea: confirmar o marcar error, con nota
export const reviewTask = async (taskId: string, status: 'confirmed' | 'needs_fix', note: string): Promise<{ error: string | null }> => {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('tasks').update({
    review_status: status,
    review_note: note || null,
    reviewed_by: user?.id,
    reviewed_at: new Date().toISOString(),
  }).eq('id', taskId);
  return { error: error ? error.message : null };
};

// Asignar una tarea a alguien de mi equipo
export const assignTask = async (employeeId: string, title: string, description: string, priority: string, dueDate?: string): Promise<{ error: string | null }> => {
  const { error } = await supabase.from('tasks').insert({
    user_id: employeeId,
    title, description: description || null,
    status: 'pending', priority, category: 'team',
    due_date: dueDate || null,
  });
  return { error: error ? error.message : null };
};

// ── OPERACIONES DEL ADMIN SOBRE EL ORGANIGRAMA ─────────────
export const setEmployeeRole = async (employeeId: string, role: 'supervisor' | 'employee'): Promise<{ error: string | null }> => {
  const { error } = await supabase.rpc('admin_set_role', { p_employee: employeeId, p_role: role });
  return { error: error ? error.message : null };
};

export const setTeamLead = async (teamId: string, leadId: string | null): Promise<{ error: string | null }> => {
  const { error } = await supabase.rpc('admin_set_team_lead', { p_team: teamId, p_lead: leadId });
  return { error: error ? error.message : null };
};
