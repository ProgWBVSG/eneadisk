import { supabase } from '../lib/supabase';

// ── VISTA DE EMPLEADOS (overview con bienestar) ────────────
export interface EmployeeOverview {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'supervisor';
  enneagramType: number | null;
  questionnaireCompleted: boolean;
  avgEnergy: number;
  avgStress: number;
  lastCheckin: string | null;
  checkinCount: number;
  risk: 'ok' | 'watch' | 'high'; // nivel de riesgo de burnout
}

function computeRisk(avgStress: number, avgEnergy: number, checkinCount: number): 'ok' | 'watch' | 'high' {
  if (checkinCount === 0) return 'ok';
  if (avgStress >= 4 || avgEnergy <= 2) return 'high';
  if (avgStress >= 3.3 || avgEnergy <= 2.6) return 'watch';
  return 'ok';
}

export const getEmployeesOverview = async (): Promise<EmployeeOverview[]> => {
  const { data, error } = await supabase.rpc('get_employees_overview');
  if (error || !data) return [];
  return data.map((e: any) => ({
    id: e.id,
    name: e.full_name || 'Sin nombre',
    email: e.email || '',
    role: e.role === 'supervisor' ? 'supervisor' : 'employee',
    enneagramType: e.questionnaire_completed ? e.enneagram_type : null,
    questionnaireCompleted: e.questionnaire_completed,
    avgEnergy: Number(e.avg_energy) || 0,
    avgStress: Number(e.avg_stress) || 0,
    lastCheckin: e.last_checkin,
    checkinCount: Number(e.checkin_count) || 0,
    risk: computeRisk(Number(e.avg_stress) || 0, Number(e.avg_energy) || 0, Number(e.checkin_count) || 0),
  }));
};

// ── CHECK-INS DE UN EMPLEADO (para la ficha 360) ───────────
export interface EmpCheckin { id: string; date: string; mood: string; energy: number; stress: number; }
export const getEmployeeCheckins = async (employeeId: string): Promise<EmpCheckin[]> => {
  const { data } = await supabase.rpc('get_employee_checkins', { p_employee: employeeId });
  return (data || []).map((c: any) => ({ id: c.id, date: c.date, mood: c.mood, energy: c.energy, stress: c.stress }));
};

// ── NOTAS DE 1-ON-1 ────────────────────────────────────────
export interface OneOnOneNote { id: string; note: string; createdAt: string; }
export const getOneOnOneNotes = async (employeeId: string): Promise<OneOnOneNote[]> => {
  const { data } = await supabase
    .from('one_on_one_notes')
    .select('id, note, created_at')
    .eq('employee_id', employeeId)
    .order('created_at', { ascending: false });
  return (data || []).map((n: any) => ({ id: n.id, note: n.note, createdAt: n.created_at }));
};

export const addOneOnOneNote = async (companyId: string, employeeId: string, note: string): Promise<{ error: string | null }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };
  const { error } = await supabase.from('one_on_one_notes').insert({
    company_id: companyId, employee_id: employeeId, author_id: user.id, note,
  });
  return { error: error ? error.message : null };
};

export const deleteOneOnOneNote = async (noteId: string): Promise<void> => {
  await supabase.from('one_on_one_notes').delete().eq('id', noteId);
};

// ── KUDOS PARA EL ADMIN (ve todos los de la empresa) ───────
export interface AdminKudo {
  id: string; fromName: string; toName: string; toUser: string; category: string; message: string; createdAt: string;
}

// El admin puede leer todos los profiles de su empresa (RLS profiles_admin_read),
// así que resolvemos los nombres directamente desde profiles.
export const getAdminKudos = async (companyId: string, limit = 50): Promise<AdminKudo[]> => {
  const [{ data: kudos }, { data: profiles }] = await Promise.all([
    supabase.from('kudos').select('id, from_user, to_user, category, message, created_at')
      .eq('company_id', companyId).order('created_at', { ascending: false }).limit(limit),
    supabase.from('profiles').select('id, full_name').eq('company_id', companyId),
  ]);
  const names: Record<string, string> = {};
  (profiles || []).forEach((p: any) => { names[p.id] = p.full_name || 'Sin nombre'; });
  return (kudos || []).map((k: any) => ({
    id: k.id,
    fromName: names[k.from_user] || 'Alguien',
    toName: names[k.to_user] || 'Alguien',
    toUser: k.to_user,
    category: k.category,
    message: k.message,
    createdAt: k.created_at,
  }));
};

export const sendAdminKudo = async (companyId: string, toUser: string, category: string, message: string): Promise<{ error: string | null }> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };
  const { error } = await supabase.from('kudos').insert({
    company_id: companyId, from_user: user.id, to_user: toUser, category, message,
  });
  return { error: error ? error.message : null };
};

// Ranking de quién recibió más reconocimientos
export interface KudoRank { userId: string; name: string; count: number; }
export const getKudosRanking = async (companyId: string): Promise<KudoRank[]> => {
  const kudos = await getAdminKudos(companyId, 500);
  const counts: Record<string, { name: string; count: number }> = {};
  kudos.forEach((k) => {
    if (!counts[k.toUser]) counts[k.toUser] = { name: k.toName, count: 0 };
    counts[k.toUser].count++;
  });
  return Object.entries(counts)
    .map(([userId, v]) => ({ userId, name: v.name, count: v.count }))
    .sort((a, b) => b.count - a.count);
};

// ── "QUÉ HACER HOY" PARA EL ADMIN ──────────────────────────
// Convierte el overview del equipo en acciones concretas y priorizadas.
// Reglas claras y explicables (sin IA externa).
export interface AdminAction {
  id: string;
  priority: 'high' | 'medium' | 'low';
  text: string;
  to?: string; // ruta sugerida (para un botón "Ir →")
}

export const suggestAdminActions = (
  overview: EmployeeOverview[],
  mood: { avgStress: number; checkinCount: number } | null
): AdminAction[] => {
  const out: AdminAction[] = [];
  const atRisk = overview.filter((e) => e.risk === 'high');
  const pendingTest = overview.filter((e) => !e.questionnaireCompleted);
  const noCheckin = overview.filter((e) => e.questionnaireCompleted && e.checkinCount === 0);
  const supervisors = overview.filter((e) => e.role === 'supervisor');

  if (atRisk.length > 0) {
    out.push({
      id: 'risk',
      priority: 'high',
      text: `${atRisk.length} persona${atRisk.length > 1 ? 's' : ''} con señales de desgaste (${atRisk.map((e) => e.name.split(' ')[0]).slice(0, 3).join(', ')}). Revisá su ficha y considerá un 1:1.`,
      to: '/dashboard/company/personas',
    });
  }
  if (mood && mood.checkinCount > 0 && mood.avgStress >= 3.5) {
    out.push({
      id: 'climate',
      priority: 'high',
      text: 'El clima general está tenso esta semana. Mirá el análisis y evaluá redistribuir carga.',
      to: '/dashboard/company/analisis',
    });
  }
  if (pendingTest.length > 0) {
    out.push({
      id: 'pending-test',
      priority: 'medium',
      text: `${pendingTest.length} persona${pendingTest.length > 1 ? 's' : ''} no completó el test. Sin su perfil, la app no puede ayudarte con esa persona.`,
      to: '/dashboard/company/personas',
    });
  }
  if (overview.length >= 6 && supervisors.length === 0) {
    out.push({
      id: 'need-supervisor',
      priority: 'medium',
      text: 'Tu equipo creció y no hay supervisores. Considerá nombrar uno para delegar el seguimiento.',
      to: '/dashboard/company/personas',
    });
  }
  if (noCheckin.length > 0) {
    out.push({
      id: 'adoption',
      priority: 'low',
      text: `${noCheckin.length} persona${noCheckin.length > 1 ? 's' : ''} todavía no hizo check-ins. Invitá al equipo a registrar su pulso para tener visibilidad.`,
    });
  }
  if (out.length === 0 && overview.length > 0) {
    out.push({
      id: 'all-good',
      priority: 'low',
      text: 'El equipo viene bien 👏 Buen momento para reconocer logros en la sección de Reconocimientos.',
      to: '/dashboard/company/reconocimientos',
    });
  }

  const order = { high: 0, medium: 1, low: 2 };
  return out.sort((a, b) => order[a.priority] - order[b.priority]).slice(0, 5);
};
