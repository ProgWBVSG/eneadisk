// ============================================================
// Motor de fricción: detecta combinaciones de perfiles con riesgo
// de choque dentro de un equipo y sugiere cómo mediar.
// Reusa la matriz de compatibilidad y los insights por par.
// ============================================================
import { getCompatibilityScore, getCompatibilityInsights } from './compatibility';

export interface FrictionMember { id: string; name: string; type: number | null; }

export interface Friction {
  aName: string;
  bName: string;
  score: number;                 // 0-100 (más bajo = más fricción)
  level: 'alta' | 'media';
  challenge: string;             // el principal punto de roce
  tip: string;                   // cómo mediar / trabajar juntos
}

// Umbrales: <=40 fricción alta, 41-55 media. Por encima no se reporta.
export const detectFrictions = (members: FrictionMember[]): Friction[] => {
  const typed = members.filter((m): m is FrictionMember & { type: number } => typeof m.type === 'number');
  const out: Friction[] = [];

  for (let i = 0; i < typed.length; i++) {
    for (let j = i + 1; j < typed.length; j++) {
      const a = typed[i], b = typed[j];
      const score = getCompatibilityScore(a.type, b.type);
      if (score > 55) continue;
      const ins = getCompatibilityInsights(a.type, b.type);
      out.push({
        aName: a.name.split(' ')[0],
        bName: b.name.split(' ')[0],
        score,
        level: score <= 40 ? 'alta' : 'media',
        challenge: ins.challenges[0] || 'Estilos de trabajo distintos que pueden chocar.',
        tip: ins.tips[0] || 'Acordá expectativas claras y espacios de comunicación.',
      });
    }
  }
  return out.sort((x, y) => x.score - y.score).slice(0, 6);
};
