import type { AppUser } from '../context/AuthContext';

const ENNEAGRAM_DATA = {
  1: { growthAreas: ["Flexibilidad", "Autocompasión", "Delegación", "Aceptar imperfecciones"] },
  2: { growthAreas: ["Asertividad", "Priorización", "Acción", "Expresar necesidades"] },
  3: { growthAreas: ["Autenticidad", "Balance vida-trabajo", "Vulnerabilidad", "Valorar el proceso"] },
  4: { growthAreas: ["Estabilidad emocional", "Practicidad", "Gratitud", "Conexión con el presente"] },
  5: { growthAreas: ["Conexión emocional", "Participación activa", "Compartir conocimiento", "Sociabilidad"] },
  6: { growthAreas: ["Confianza", "Toma de decisiones", "Reducir ansiedad", "Independencia"] },
  7: { growthAreas: ["Compromiso", "Enfoque", "Procesar emociones difíciles", "Paciencia"] },
  8: { growthAreas: ["Vulnerabilidad", "Escucha activa", "Paciencia", "Moderación"] },
  9: { growthAreas: ["Asertividad", "Priorización", "Acción", "Expresar necesidades"] }
};


export interface TrackingEvent {
  id: string;
  type: 'checkin' | 'goal_completed' | 'ai_coaching';
  date: string;
  value: number; // 1-5 for checkin, 100 for completed, etc.
}

export interface EmployeeTracking {
  employeeId: string;
  name: string;
  enneagramType: number | null;
  currentFocus: string;
  focusProgress: number; // 0 - 100
  status: 'aligned' | 'warning' | 'critical';
  stressWarning: string | null;
  recentEvents: TrackingEvent[];
}

export interface TrackingKPIs {
  completedChallenges: number;
  completedChallengesGrowth: number;
  averageWellbeing: number;
  wellbeingGrowth: number;
  activeFocusAreas: number;
}

export interface EvolutionDataPoint {
  month: string;
  bienestar: number;
  retosCompletados: number;
}

// Generador de evolución histórica (6 meses)
export const generateEvolutionHistory = (): EvolutionDataPoint[] => {
  const months = ['Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar'];
  let baseBienestar = 3.5;
  let baseRetos = 12;

  return months.map(month => {
    // Math.random as pseudo random walk
    baseBienestar = Math.max(2.5, Math.min(4.8, baseBienestar + (Math.random() - 0.4) * 0.5));
    baseRetos = Math.max(5, baseRetos + Math.floor((Math.random() - 0.3) * 6));
    
    return {
      month,
      bienestar: Number(baseBienestar.toFixed(1)),
      retosCompletados: baseRetos
    };
  });
};

import { getCheckIns } from './checkIns';
import { getTasks } from './tasks';

// Asignar focos de desarrollo basados en eneatipo
const getFocusArea = (type: number | null): string => {
  if (!type || !ENNEAGRAM_DATA[type as keyof typeof ENNEAGRAM_DATA]) return "Mejora continua general";
  const points = ENNEAGRAM_DATA[type as keyof typeof ENNEAGRAM_DATA].growthAreas;
  return points[0]; // Retorna un foco estable en vez de aleatorio
};

// Asignar advertencia de estrés basado en líneas de desintegración
const getStressWarning = (type: number | null): string | null => {
  if (!type) return null;
  const stressPaths: Record<number, string> = {
    1: 'Riesgo hacia el 4 (melancólico)',
    2: 'Riesgo hacia el 8 (dominante)',
    3: 'Riesgo hacia el 9 (desconexión)',
    4: 'Riesgo hacia el 2 (sobre-involucrado)',
    5: 'Riesgo hacia el 7 (disperso)',
    6: 'Riesgo hacia el 3 (competitivo)',
    7: 'Riesgo hacia el 1 (perfeccionista)',
    8: 'Riesgo hacia el 5 (aislamiento)',
    9: 'Riesgo hacia el 6 (ansioso)'
  };
  return stressPaths[type] || 'Señales detectadas';
};

export const generateTrackingData = async (employees: AppUser[]): Promise<{
  matrix: EmployeeTracking[];
  kpis: TrackingKPIs;
  chartData: EvolutionDataPoint[];
}> => {
  let globalCompletedChallenges = 0;
  let globalWellbeingSum = 0;
  let checkinCount = 0;

  const matrix: EmployeeTracking[] = [];

  for (const emp of employees) {
      // 1. Obtener Datos Reales Asíncronos
      const tasks = await getTasks(emp.id);
      const checkins = await getCheckIns(emp.id);

      // Calcular foco y progreso en tareas
      const completedTasks = tasks.filter(t => t.status === 'completed').length;
      globalCompletedChallenges += completedTasks;
      const focusProgress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

      // Calcular bienestar (estado) basado en los check-ins de los últimos 7 días
      let status: 'aligned' | 'warning' | 'critical' = 'aligned';
      let stressWarning = null;

      if (checkins.length > 0) {
          const recentCheckins = checkins.slice(0, 5); // Tomamos los últimos 5
          const avgScore = recentCheckins.reduce((acc, curr) => acc + curr.energy + (6 - curr.stress), 0) / (recentCheckins.length * 2);
          
          recentCheckins.forEach(c => {
             globalWellbeingSum += c.energy;
             checkinCount++;
          });

          if (avgScore < 2.5) {
             status = 'critical';
             stressWarning = getStressWarning(emp.enneagramType || null);
          } else if (avgScore < 3.5) {
             status = 'warning';
             stressWarning = "Niveles de energía reportados a la baja";
          }
      }

      matrix.push({
          employeeId: emp.id,
          name: emp.name || emp.email || 'Usuario',
          enneagramType: emp.enneagramType || null,
          currentFocus: getFocusArea(emp.enneagramType || null),
          focusProgress,
          status,
          stressWarning,
          recentEvents: [] 
      });
  }

  const avgWellbeing = checkinCount > 0 ? (globalWellbeingSum / checkinCount) : 0;

  return {
    matrix,
    kpis: {
      completedChallenges: globalCompletedChallenges,
      completedChallengesGrowth: 0, // Podría calcularse contra el mes anterior
      averageWellbeing: Number(avgWellbeing.toFixed(1)),
      wellbeingGrowth: 0,
      activeFocusAreas: employees.length
    },
    // Chart historico todavia simulado para el efecto visual, a futuro se calcula igual sobre checkins historicos
    chartData: generateEvolutionHistory()
  };
};
