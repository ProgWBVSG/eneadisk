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
    // Inicializar puntajes para cada tipo (1-9) con una estructura de pesos ponderados
    const scores: Record<number, number> = {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
        6: 0, 7: 0, 8: 0, 9: 0
    };

    // Asignar ponderación a cada pregunta para "deducir" mejor nuestro resultado.
    // Pregunta 3 (motivación) es central en el Eneagrama, por eso mayor peso.
    const questionWeights: Record<number, number> = {
        1: 1.0, // Estilo de trabajo general
        2: 1.2, // Resolución de desafíos
        3: 1.5, // Motivaciones centrales (Core del Eneagrama)
        4: 1.3, // Comportamiento en conflicto
        5: 1.1  // Valoración del ambiente
    };

    // Contar puntajes ponderados
    responses.forEach(response => {
        if (response.selectedType >= 1 && response.selectedType <= 9) {
            const weight = questionWeights[response.questionId] || 1.0;
            scores[response.selectedType] += weight;
        }
    });

    // Encontrar el tipo con mayor puntaje
    let primaryType = 1;
    let maxScore = scores[1];

    for (let type = 2; type <= 9; type++) {
        // En caso de empate muy cercano, nos podemos quedar con el que ya tenemos o cambiar
        // Hacemos el redondeo fino para evitar problemas de flotantes y si es un empate exacto,
        // la probabilidad le da más "naturalidad" a la deducción psicológica en casos ambiguos.
        const currentDiff = scores[type] - maxScore;
        if (currentDiff > 0.001) {
            maxScore = scores[type];
            primaryType = type;
        } else if (Math.abs(currentDiff) <= 0.001) {
            // Empate: introducimos un pequeño factor de desempate aleatorio "inteligente" (50/50 chance)
            // Esto evita que "la primera opción que elegiste" o "la matemática" controle siempre
            // cuando respondes de varios tipos distintos en igual proporción de peso.
            if (Math.random() > 0.5) {
                maxScore = scores[type];
                primaryType = type;
            }
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
