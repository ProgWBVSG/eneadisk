import type { CheckIn } from './checkIns';

// ── INSIGHTS DE BIENESTAR ──────────────────────────────────
export interface Insight {
  icon: string;
  title: string;
  detail: string;
  tone: 'good' | 'warn' | 'info';
}

const DAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function computeInsights(checkIns: CheckIn[]): Insight[] {
  const insights: Insight[] = [];
  if (checkIns.length < 2) {
    return [{
      icon: '📊', tone: 'info',
      title: 'Seguí registrando check-ins',
      detail: 'Con al menos 3 check-ins vamos a detectar patrones en tu energía y estrés.',
    }];
  }

  // Ordenar por fecha ascendente
  const sorted = [...checkIns].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Tendencia de energía (primera mitad vs segunda mitad)
  const mid = Math.floor(sorted.length / 2);
  const avg = (arr: CheckIn[], k: 'energy' | 'stress') => arr.reduce((s, c) => s + c[k], 0) / (arr.length || 1);
  const energyFirst = avg(sorted.slice(0, mid), 'energy');
  const energyLast = avg(sorted.slice(mid), 'energy');
  const stressFirst = avg(sorted.slice(0, mid), 'stress');
  const stressLast = avg(sorted.slice(mid), 'stress');

  if (energyLast - energyFirst >= 0.5) {
    insights.push({ icon: '📈', tone: 'good', title: 'Tu energía está subiendo', detail: 'En tus últimos check-ins reportaste más energía que antes. ¡Buen momento para encarar lo importante!' });
  } else if (energyFirst - energyLast >= 0.5) {
    insights.push({ icon: '🔋', tone: 'warn', title: 'Tu energía viene bajando', detail: 'Notamos una caída en tu energía. Considerá descansar mejor o reducir la carga esta semana.' });
  }

  if (stressLast - stressFirst >= 0.5) {
    insights.push({ icon: '⚠️', tone: 'warn', title: 'Tu estrés viene en aumento', detail: 'Tu nivel de estrés subió en los últimos días. Hablalo con tu equipo o probá una pausa activa.' });
  } else if (stressFirst - stressLast >= 0.5) {
    insights.push({ icon: '😌', tone: 'good', title: 'Tu estrés está bajando', detail: '¡Vas bien! Tu nivel de estrés reportado disminuyó.' });
  }

  // Día de la semana con más estrés
  const byDay: Record<number, { sum: number; n: number }> = {};
  sorted.forEach((c) => {
    const d = new Date(c.date).getDay();
    if (!byDay[d]) byDay[d] = { sum: 0, n: 0 };
    byDay[d].sum += c.stress; byDay[d].n++;
  });
  let worstDay = -1, worstAvg = 0;
  Object.entries(byDay).forEach(([d, v]) => {
    if (v.n >= 2) { const a = v.sum / v.n; if (a > worstAvg) { worstAvg = a; worstDay = Number(d); } }
  });
  if (worstDay >= 0 && worstAvg >= 3.5) {
    insights.push({ icon: '📅', tone: 'info', title: `Los ${DAYS[worstDay]} te pesan más`, detail: `Tu estrés tiende a subir los ${DAYS[worstDay]}. Planificá ese día con más margen y menos reuniones si podés.` });
  }

  // Racha de check-ins
  const streak = computeStreak(sorted);
  if (streak >= 3) {
    insights.push({ icon: '🔥', tone: 'good', title: `Racha de ${streak} días`, detail: 'Estás registrando tu estado con constancia. El autoconocimiento es el primer paso del cambio.' });
  }

  if (insights.length === 0) {
    insights.push({ icon: '✅', tone: 'good', title: 'Todo estable', detail: 'Tu energía y estrés se mantienen estables. Seguí así.' });
  }
  return insights;
}

function computeStreak(sortedAsc: CheckIn[]): number {
  if (sortedAsc.length === 0) return 0;
  const days = new Set(sortedAsc.map((c) => new Date(c.date).toDateString()));
  let streak = 0;
  const d = new Date();
  // Permite que la racha cuente desde hoy o ayer
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) {
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

// ── LOGROS / BADGES ────────────────────────────────────────
export interface Achievement {
  icon: string;
  title: string;
  desc: string;
  unlocked: boolean;
}

export function computeAchievements(
  checkInsCount: number,
  tasksCompleted: number,
  goalsCount: number,
  hasEnneagram: boolean
): Achievement[] {
  return [
    { icon: '🧭', title: 'Autoconocimiento', desc: 'Completaste tu test de eneagrama', unlocked: hasEnneagram },
    { icon: '🌱', title: 'Primer paso', desc: 'Registraste tu primer check-in', unlocked: checkInsCount >= 1 },
    { icon: '🔥', title: 'Constancia', desc: '7 check-ins registrados', unlocked: checkInsCount >= 7 },
    { icon: '🏅', title: 'Hábito formado', desc: '30 check-ins registrados', unlocked: checkInsCount >= 30 },
    { icon: '✅', title: 'Productivo', desc: '5 tareas completadas', unlocked: tasksCompleted >= 5 },
    { icon: '🚀', title: 'Imparable', desc: '25 tareas completadas', unlocked: tasksCompleted >= 25 },
    { icon: '🎯', title: 'Con objetivos', desc: 'Creaste tu primera meta de desarrollo', unlocked: goalsCount >= 1 },
    { icon: '⭐', title: 'En camino', desc: '3 metas de desarrollo', unlocked: goalsCount >= 3 },
  ];
}
