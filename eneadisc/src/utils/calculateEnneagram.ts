// Función para calcular el eneatipo basado en las respuestas
export interface QuestionnaireResponse {
    questionId: number;
    selectedType: number;
}

export interface EnneagramResult {
    primaryType: number;
    scores: Record<number, number>;
    completedAt: string;
}

export const calculateEnneagram = (responses: QuestionnaireResponse[]): EnneagramResult => {
    // Inicializar puntajes para cada tipo (1-9)
    const scores: Record<number, number> = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        6: 0, 7: 0, 8: 0, 9: 0
    };

    // Contar respuestas por tipo
    responses.forEach(response => {
        if (response.selectedType >= 1 && response.selectedType <= 9) {
            scores[response.selectedType]++;
        }
    });

    // Encontrar el tipo con mayor puntaje
    let primaryType = 1;
    let maxScore = scores[1];

    for (let type = 2; type <= 9; type++) {
        if (scores[type] > maxScore) {
            maxScore = scores[type];
            primaryType = type;
        }
    }

    return {
        primaryType,
        scores,
        completedAt: new Date().toISOString()
    };
};

// Guardar resultado en localStorage
export const saveEnneagramResult = (userId: string, result: EnneagramResult): void => {
    const key = `enneagram_result_${userId}`;
    localStorage.setItem(key, JSON.stringify(result));
};

// Obtener resultado desde localStorage
export const getEnneagramResult = (userId: string): EnneagramResult | null => {
    const key = `enneagram_result_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
};

// Verificar si el usuario completó el cuestionario
export const hasCompletedQuestionnaire = (userId: string): boolean => {
    return getEnneagramResult(userId) !== null;
};
