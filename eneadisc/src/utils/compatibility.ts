// Compatibility scoring and insights between enneagram types
// Based on enneagram theory and common compatibility patterns

export interface CompatibilityInsights {
    score: number; // 0-100
    strengths: string[];
    challenges: string[];
    tips: string[];
}

// Compatibility matrix: scores between different enneagram types
const compatibilityMatrix: { [key: string]: number } = {
    // Type 1 compatibilities
    '1-1': 65, '1-2': 70, '1-3': 60, '1-4': 50, '1-5': 75, '1-6': 80, '1-7': 55, '1-8': 65, '1-9': 85,
    // Type 2 compatibilities
    '2-1': 70, '2-2': 70, '2-3': 75, '2-4': 60, '2-5': 55, '2-6': 65, '2-7': 80, '2-8': 85, '2-9': 70,
    // Type 3 compatibilities
    '3-1': 60, '3-2': 75, '3-3': 65, '3-4': 55, '3-5': 60, '3-6': 75, '3-7': 80, '3-8': 70, '3-9': 65,
    // Type 4 compatibilities
    '4-1': 50, '4-2': 60, '4-3': 55, '4-4': 60, '4-5': 80, '4-6': 65, '4-7': 70, '4-8': 75, '4-9': 85,
    // Type 5 compatibilities
    '5-1': 75, '5-2': 55, '5-3': 60, '5-4': 80, '5-5': 70, '5-6': 65, '5-7': 75, '5-8': 70, '5-9': 60,
    // Type 6 compatibilities
    '6-1': 80, '6-2': 65, '6-3': 75, '6-4': 65, '6-5': 65, '6-6': 70, '6-7': 60, '6-8': 75, '6-9': 80,
    // Type 7 compatibilities
    '7-1': 55, '7-2': 80, '7-3': 80, '7-4': 70, '7-5': 75, '7-6': 60, '7-7': 75, '7-8': 65, '7-9': 85,
    // Type 8 compatibilities
    '8-1': 65, '8-2': 85, '8-3': 70, '8-4': 75, '8-5': 70, '8-6': 75, '8-7': 65, '8-8': 60, '8-9': 80,
    // Type 9 compatibilities
    '9-1': 85, '9-2': 70, '9-3': 65, '9-4': 85, '9-5': 60, '9-6': 80, '9-7': 85, '9-8': 80, '9-9': 70,
};

/**
 * Get compatibility score between two enneagram types
 * @param type1 First enneagram type (1-9)
 * @param type2 Second enneagram type (1-9)
 * @returns Score from 0-100
 */
export function getCompatibilityScore(type1: number, type2: number): number {
    const key = `${type1}-${type2}`;
    return compatibilityMatrix[key] || 50; // Default to neutral if not found
}

/**
 * Get detailed compatibility insights between two enneagram types
 * @param type1 First enneagram type (1-9)
 * @param type2 Second enneagram type (1-9)
 * @returns Insights object with strengths, challenges, and tips
 */
export function getCompatibilityInsights(type1: number, type2: number): CompatibilityInsights {
    const score = getCompatibilityScore(type1, type2);

    // General insights based on compatibility score
    const insights: CompatibilityInsights = {
        score,
        strengths: [],
        challenges: [],
        tips: [],
    };

    // Specific insights for type combinations
    const specificInsights = getSpecificInsights(type1, type2);
    if (specificInsights) {
        return { score, ...specificInsights };
    }

    // Fallback to general insights based on score
    if (score >= 80) {
        insights.strengths = [
            'Excelente sinergia natural',
            'Comunicación fluida',
            'Valores compartidos',
        ];
        insights.challenges = [
            'Evitar caer en zona de confort',
        ];
        insights.tips = [
            'Aprovechen su buena conexión para proyectos desafiantes',
            'Mantengan canales de comunicación abiertos',
        ];
    } else if (score >= 60) {
        insights.strengths = [
            'Buena complementariedad',
            'Perspectivas diferentes que se enriquecen',
        ];
        insights.challenges = [
            'Requiere esfuerzo consciente de comunicación',
        ];
        insights.tips = [
            'Enfócense en sus fortalezas complementarias',
            'Sean pacientes con las diferencias',
        ];
    } else {
        insights.strengths = [
            'Oportunidad de crecimiento mutuo',
            'Diversidad de enfoques',
        ];
        insights.challenges = [
            'Posibles malentendidos',
            'Diferentes prioridades',
        ];
        insights.tips = [
            'Establezcan expectativas claras',
            'Practiquen la escucha activa',
            'Celebren las pequeñas victorias juntos',
        ];
    }

    return insights;
}

/**
 * Get specific insights for known type combinations
 */
function getSpecificInsights(type1: number, type2: number): Omit<CompatibilityInsights, 'score'> | null {
    const key = `${type1}-${type2}`;

    const insightsMap: { [key: string]: Omit<CompatibilityInsights, 'score'> } = {
        // Type 1 combinations
        '1-9': {
            strengths: ['El 9 ayuda al 1 a relajarse', 'El 1 ayuda al 9 a organizarse', 'Armonía natural'],
            challenges: ['El 1 puede frustrar al 9 con críticas', 'El 9 puede parecer pasivo al 1'],
            tips: ['El 1: practica la paciencia', 'El 9: comunica tus necesidades', 'Encuentren balance entre acción y paz'],
        },
        '1-2': {
            strengths: ['Ambos valoran ayudar a otros', 'Compromiso compartido', 'Ética de trabajo fuerte'],
            challenges: ['El 1 puede criticar al 2', 'El 2 puede sentirse poco apreciado'],
            tips: ['El 1: muestra más aprecio', 'El 2: acepta críticas constructivas', 'Reconozcan los esfuerzos mutuos'],
        },

        // Type 2 combinations
        '2-8': {
            strengths: ['El 8 protege al 2', 'El 2 suaviza al 8', 'Lealtad mutua fuerte'],
            challenges: ['Luchas de poder ocasionales', 'El 8 puede ser muy directo'],
            tips: ['El 2: sé honesto sobre tus necesidades', 'El 8: muestra tu lado vulnerable', 'Respeten sus diferencias'],
        },
        '2-7': {
            strengths: ['Energía positiva compartida', 'Disfrutan ayudar juntos', 'Optimismo contagioso'],
            challenges: ['Pueden evitar conflictos', 'Necesidad de atención'],
            tips: ['Enfrenten problemas directamente', 'Equilibren dar y recibir', 'Celebren juntos los logros'],
        },

        // Type 3 combinations
        '3-7': {
            strengths: ['Alta energía', 'Orientados a resultados', 'Contagian entusiasmo'],
            challenges: ['Pueden ser demasiado competitivos', 'Evitan introspección'],
            tips: ['Apoyen las metas del otro', 'Tomen tiempo para reflexionar', 'Celebren el proceso, no solo resultados'],
        },

        // Type 4 combinations
        '4-9': {
            strengths: ['Profunda empatía mutua', 'El 9 calma al 4', 'Creatividad compartida'],
            challenges: ['Pueden aislarse juntos', 'Evitan conflictos'],
            tips: ['Mantengan conexión con el equipo', 'Enfrenten problemas a tiempo', 'Equilibren emoción y acción'],
        },
        '4-5': {
            strengths: ['Profundidad intelectual', 'Respeto por el espacio personal', 'Conversaciones significativas'],
            challenges: ['Pueden aislarse', 'Intensidad emocional vs distancia'],
            tips: ['Encuentren balance entre cercanía y espacio', 'Compartan su mundo interior', 'Salgan de su zona de confort juntos'],
        },

        // Type 5 combinations
        '5-1': {
            strengths: ['Respeto mutuo por la competencia', 'Pensamiento analítico', 'Altos estándares compartidos'],
            challenges: ['Pueden ser muy críticos', 'Falta de expresión emocional'],
            tips: ['Practiquen la vulnerabilidad', 'Compartan apreciación', 'Equilibren lógica con emoción'],
        },

        // Type 6 combinations
        '6-9': {
            strengths: ['Lealtad mutua', 'Estabilidad', 'Apoyo constante'],
            challenges: ['Ansiedad compartida', 'Indecisión'],
            tips: ['El 6: confía más', 'El 9: toma decisiones', 'Apoyen la confianza mutua'],
        },

        // Type 7 combinations
        '7-9': {
            strengths: ['Positividad', 'Flexibilidad', 'Armonía fácil'],
            challenges: ['Evitan conflictos y problemas', 'Falta de enfoque'],
            tips: ['Enfrenten temas difíciles juntos', 'Establezcan prioridades claras', 'Mantengan compromiso a largo plazo'],
        },

        // Type 8 combinations
        '8-9': {
            strengths: ['El 8 protege, el 9 apacigua', 'Complementariedad natural', 'Lealtad profunda'],
            challenges: ['El 8 puede dominar', 'El 9 puede evitar confrontación'],
            tips: ['El 8: sé gentil', 'El 9: expresa tu opinión', 'Encuentren balance de poder'],
        },
    };

    return insightsMap[key] || null;
}

/**
 * Analyze overall team dynamics based on enneagram types
 * @param types Array of enneagram types in the team
 * @returns Object with team strengths and recommended actions
 */
export function getTeamDynamics(types: number[]): {
    diversity: number; // 0-100, higher is better
    strengths: string[];
    challenges: string[];
    recommendations: string[];
} {
    const uniqueTypes = new Set(types);
    const diversity = Math.min((uniqueTypes.size / 9) * 100, 100);

    const dynamics = {
        diversity: Math.round(diversity),
        strengths: [] as string[],
        challenges: [] as string[],
        recommendations: [] as string[],
    };

    // Count types
    const typeCounts: { [key: number]: number } = {};
    types.forEach(type => {
        typeCounts[type] = (typeCounts[type] || 0) + 1;
    });

    // Analyze based on diversity
    if (diversity >= 70) {
        dynamics.strengths.push('Excelente diversidad de perspectivas');
        dynamics.strengths.push('Amplio rango de habilidades y enfoques');
        dynamics.recommendations.push('Aprovechen la diversidad para innovar');
    } else if (diversity >= 40) {
        dynamics.strengths.push('Buena variedad de estilos de trabajo');
        dynamics.recommendations.push('Busquen oportunidades para mayor diversidad');
    } else {
        dynamics.challenges.push('Poca diversidad de tipos');
        dynamics.recommendations.push('Consideren incorporar otros eneatipos');
    }

    // Analyze dominant types
    const dominantType = Object.entries(typeCounts).reduce((a, b) =>
        b[1] > a[1] ? b : a
    );

    if (parseInt(dominantType[0]) && dominantType[1] > types.length / 2) {
        dynamics.challenges.push(`Predominancia de Tipo ${dominantType[0]}`);
        dynamics.recommendations.push('Busquen perspectivas de otros tipos');
    }

    // Add general recommendations
    dynamics.recommendations.push('Celebren las diferencias individuales');
    dynamics.recommendations.push('Practiquen comunicación abierta');

    return dynamics;
}
