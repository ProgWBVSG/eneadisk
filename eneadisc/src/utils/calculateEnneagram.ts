// ============================================================
// Cálculo del eneatipo a partir de las respuestas
// ============================================================
// Metodología (skill enneagram-expert):
//   • Suma ponderada: las preguntas más diagnósticas pesan más.
//   • Desempate DETERMINÍSTICO (nunca al azar): ante empate gana
//     el tipo elegido en la pregunta de miedo central; si persiste,
//     el de menor número (criterio estable y reproducible).
//   • Devuelve el ranking completo para poder mostrar alternativas
//     cuando el resultado es ambiguo ("no me siento identificado").
// ============================================================
import { supabase } from '../lib/supabase';
import { QUESTIONNAIRE } from '../data/questionnaireData';

export interface QuestionnaireResponse {
    questionId: number;
    selectedType: number;
}

export interface RankedType {
    type: number;
    score: number;
}

export interface EnneagramResult {
    primaryType: number;
    ranking: RankedType[];      // ordenado de mayor a menor puntaje
    scores: Record<number, number>;
    coreFearType: number | null; // tipo elegido en la pregunta de miedo
    ambiguous: boolean;          // true si 1º y 2º están muy cerca
    completedAt: string;
}

const WEIGHTS: Record<number, number> = Object.fromEntries(
    QUESTIONNAIRE.map((q) => [q.id, q.weight])
);
const CORE_FEAR_QID = QUESTIONNAIRE.find((q) => q.isCoreFear)?.id ?? null;

export const calculateEnneagram = (responses: QuestionnaireResponse[]): EnneagramResult => {
    const scores: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };

    let coreFearType: number | null = null;
    responses.forEach((r) => {
        if (r.selectedType >= 1 && r.selectedType <= 9) {
            scores[r.selectedType] += WEIGHTS[r.questionId] || 1.0;
            if (CORE_FEAR_QID !== null && r.questionId === CORE_FEAR_QID) {
                coreFearType = r.selectedType;
            }
        }
    });

    // Ranking determinístico: por puntaje desc; ante empate, el miedo
    // central manda; si no, el tipo de menor número.
    const ranking: RankedType[] = (Object.keys(scores).map(Number)).map((type) => ({ type, score: scores[type] }));
    ranking.sort((a, b) => {
        const diff = b.score - a.score;
        if (Math.abs(diff) > 0.001) return diff;
        if (coreFearType === a.type) return -1;
        if (coreFearType === b.type) return 1;
        return a.type - b.type;
    });

    const primaryType = ranking[0].type;
    const top = ranking[0].score;
    const second = ranking[1]?.score ?? 0;
    // Ambiguo si el 2º está dentro del ~12% del líder (resultado poco definido).
    const ambiguous = top > 0 && (top - second) / top < 0.12;

    return {
        primaryType,
        ranking,
        scores,
        coreFearType,
        ambiguous,
        completedAt: new Date().toISOString(),
    };
};

// ── Persistencia ────────────────────────────────────────────
// Guarda el eneatipo en SUPABASE (profiles) — es lo que usa toda la
// app (equipos, chat, supervisión). Además deja copia en localStorage.
export const persistEnneagramType = async (
    userId: string,
    type: number
): Promise<{ error: string | null }> => {
    // Mantener los scores locales (para el radar) pero fijar el tipo elegido.
    const prev = getEnneagramResult(userId);
    localStorage.setItem(`enneagram_result_${userId}`, JSON.stringify({
        primaryType: type,
        scores: prev?.scores,
        completedAt: new Date().toISOString(),
    }));
    const { error } = await supabase
        .from('profiles')
        .update({ enneagram_type: type, questionnaire_completed: true })
        .eq('id', userId);
    return { error: error ? error.message : null };
};

// ── localStorage (cache local, no es la fuente de verdad) ───
// Guarda el resultado completo (incluye scores para el gráfico radar).
export const saveLocalResult = (userId: string, result: EnneagramResult): void => {
    localStorage.setItem(`enneagram_result_${userId}`, JSON.stringify({
        primaryType: result.primaryType,
        scores: result.scores,
        completedAt: result.completedAt,
    }));
};

export const getEnneagramResult = (
    userId: string
): { primaryType: number; scores?: Record<number, number> } | null => {
    const stored = localStorage.getItem(`enneagram_result_${userId}`);
    return stored ? JSON.parse(stored) : null;
};

export const hasCompletedQuestionnaire = (userId: string): boolean => {
    return getEnneagramResult(userId) !== null;
};
