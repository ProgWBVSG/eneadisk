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

// Asignar focos de desarrollo basados en eneatipo
const getFocusArea = (type: number | null): string => {
  if (!type || !ENNEAGRAM_DATA[type as keyof typeof ENNEAGRAM_DATA]) return "Mejora continua general";
  const points = ENNEAGRAM_DATA[type as keyof typeof ENNEAGRAM_DATA].growthAreas;
  return points[Math.floor(Math.random() * points.length)];
};

// Asignar advertencia de estrés basado en líneas de desintegración
const getStressWarning = (type: number | null): string | null => {
  if (!type) return null;
  
  // Caminos de estrés estándar (Enneagrama)
  const stressPaths: Record<number, string> = {
    1: 'Volviéndose melancólico o irracional (hacia el 4)',
    2: 'Volviéndose agresivo o dominante (hacia el 8)',
    3: 'Desconectándose o perdiendo iniciativa (hacia el 9)',
    4: 'Volviéndose dependiente o sobre-involucrado (hacia el 2)',
    5: 'Volviéndose hiperactivo o disperso (hacia el 7)',
    6: 'Volviéndose arrogante o competitivo (hacia el 3)',
    7: 'Volviéndose crítico y perfeccionista (hacia el 1)',
    8: 'Aislándose o volviéndose reservado (hacia el 5)',
    9: 'Volviéndose ansioso o reactivo (hacia el 6)'
  };
  
  return stressPaths[type] || 'Señales de fatiga detectadas';
};

export const generateTrackingData = (employees: AppUser[]): {
  matrix: EmployeeTracking[];
  kpis: TrackingKPIs;
  chartData: EvolutionDataPoint[];
} => {
  let warningCount = 0;
  
  const matrix: EmployeeTracking[] = employees.map(emp => {
    // Determinar estado aleatorio (80% aligned, 15% warning, 5% critical)
    const rand = Math.random();
    let status: 'aligned' | 'warning' | 'critical' = 'aligned';
    let stressWarning = null;
    
    if (rand > 0.95) {
      status = 'critical';
      stressWarning = getStressWarning(emp.enneagramType || null);
      warningCount++;
    } else if (rand > 0.80) {
      status = 'warning';
      stressWarning = "Niveles de energía reportados a la baja";
      warningCount++;
    }

    return {
      employeeId: emp.id,
      name: emp.name || emp.email || 'Usuario',
      enneagramType: emp.enneagramType || null,
      currentFocus: getFocusArea(emp.enneagramType || null),
      focusProgress: Math.floor(Math.random() * 80) + 10,
      status,
      stressWarning,
      recentEvents: []
    };
  });

  return {
    matrix,
    kpis: {
      completedChallenges: 48,
      completedChallengesGrowth: 12.5,
      averageWellbeing: 4.1,
      wellbeingGrowth: 3.2,
      activeFocusAreas: employees.length
    },
    chartData: generateEvolutionHistory()
  };
};
