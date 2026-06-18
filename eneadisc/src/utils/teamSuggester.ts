// ============================================================
// SUGERIDOR DE EQUIPOS EQUILIBRADOS + DETECCIÓN DE GAPS
// ============================================================
// Basado en las tríadas del eneagrama:
//   • Cuerpo / Instinto: tipos 8, 9, 1 (acción, hacer)
//   • Corazón / Emoción: tipos 2, 3, 4 (relaciones, imagen)
//   • Cabeza / Mente:    tipos 5, 6, 7 (análisis, ideas)
// Un equipo equilibrado tiene representación de las 3 tríadas.

export type Triad = 'cuerpo' | 'corazon' | 'cabeza';

export const TRIADS: Record<Triad, { label: string; types: number[]; desc: string; emoji: string }> = {
  cuerpo:  { label: 'Acción', types: [8, 9, 1], desc: 'Ejecutan, hacen que las cosas pasen', emoji: '💪' },
  corazon: { label: 'Relaciones', types: [2, 3, 4], desc: 'Conectan con las personas y la imagen', emoji: '❤️' },
  cabeza:  { label: 'Ideas', types: [5, 6, 7], desc: 'Analizan, planifican y crean', emoji: '🧠' },
};

export function triadOf(type: number): Triad {
  if ([8, 9, 1].includes(type)) return 'cuerpo';
  if ([2, 3, 4].includes(type)) return 'corazon';
  return 'cabeza';
}

export interface SuggestablePerson {
  id: string;
  name: string;
  enneagramType: number;
}

export interface SuggestedTeam {
  members: SuggestablePerson[];
  triadCoverage: Triad[]; // tríadas presentes
  balance: number; // 0-100, qué tan equilibrado está
}

// Distribuye personas en N equipos balanceando las tríadas (round-robin por tríada)
export function suggestTeams(people: SuggestablePerson[], numTeams: number): SuggestedTeam[] {
  if (numTeams < 1) numTeams = 1;
  const teams: SuggestablePerson[][] = Array.from({ length: numTeams }, () => []);

  // Agrupar por tríada
  const byTriad: Record<Triad, SuggestablePerson[]> = { cuerpo: [], corazon: [], cabeza: [] };
  people.forEach((p) => byTriad[triadOf(p.enneagramType)].push(p));

  // Repartir cada tríada en round-robin para esparcir los perfiles
  let teamIdx = 0;
  (['cuerpo', 'corazon', 'cabeza'] as Triad[]).forEach((tr) => {
    byTriad[tr].forEach((p) => {
      teams[teamIdx % numTeams].push(p);
      teamIdx++;
    });
  });

  return teams.map((members) => {
    const coverage = Array.from(new Set(members.map((m) => triadOf(m.enneagramType))));
    return { members, triadCoverage: coverage, balance: Math.round((coverage.length / 3) * 100) };
  });
}

export interface GapAnalysis {
  present: Triad[];
  missing: Triad[];
  balance: number;
  summary: string;
}

// Analiza qué tríadas faltan en un conjunto de tipos (gaps de personalidad)
export function analyzeGaps(types: number[]): GapAnalysis {
  const present = Array.from(new Set(types.map(triadOf)));
  const all: Triad[] = ['cuerpo', 'corazon', 'cabeza'];
  const missing = all.filter((t) => !present.includes(t));
  const balance = Math.round((present.length / 3) * 100);

  let summary: string;
  if (missing.length === 0) summary = 'Equipo equilibrado: tiene perfiles de acción, relaciones e ideas.';
  else {
    const labels = missing.map((m) => TRIADS[m].label.toLowerCase());
    summary = `Le falta el perfil de ${labels.join(' y ')}. ` +
      (missing.includes('cuerpo') ? 'Podría costarle pasar a la acción. ' : '') +
      (missing.includes('corazon') ? 'Podría descuidar las relaciones y la comunicación. ' : '') +
      (missing.includes('cabeza') ? 'Podría faltarle análisis y planificación. ' : '');
  }
  return { present, missing, balance, summary: summary.trim() };
}
