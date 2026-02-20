// Cuestionario rápido de 5 preguntas para determinar eneatipo
export interface Question {
    id: number;
    text: string;
    type: number; // Eneatipo al que pertenece (para cálculo)
}

export const QUESTIONNAIRE: Question[] = [
    {
        id: 1,
        text: "¿Cuál de estas opciones te describe mejor en el trabajo?",
        type: 0 // Esta es multiple choice, no suma a un tipo específico
    },
    {
        id: 2,
        text: "Cuando enfrentas un desafío en el equipo, ¿qué haces primero?",
        type: 0
    },
    {
        id: 3,
        text: "¿Qué te motiva más en tu día a día laboral?",
        type: 0
    },
    {
        id: 4,
        text: "En situaciones de conflicto, tiendes a:",
        type: 0
    },
    {
        id: 5,
        text: "¿Qué valoras más en un ambiente de trabajo?",
        type: 0
    }
];

// Opciones para cada pregunta (cada opción corresponde a un eneatipo)
export const QUESTION_OPTIONS: Record<number, { text: string; type: number }[]> = {
    1: [
        { text: "Busco hacer todo perfectamente y cumplir con altos estándares", type: 1 },
        { text: "Me gusta ayudar a mis compañeros y crear un ambiente cálido", type: 2 },
        { text: "Me enfoco en alcanzar metas y obtener resultados exitosos", type: 3 },
        { text: "Valoro la autenticidad y expresar mi individualidad", type: 4 },
        { text: "Prefiero analizar información antes de tomar decisiones", type: 5 },
        { text: "Soy leal y busco la seguridad del equipo", type: 6 },
        { text: "Me entusiasma explorar nuevas ideas y experiencias", type: 7 },
        { text: "Tomo el liderazgo y defiendo lo que considero justo", type: 8 },
        { text: "Busco mantener la armonía y evitar conflictos", type: 9 }
    ],
    2: [
        { text: "Verifico que todo se haga correctamente según los procedimientos", type: 1 },
        { text: "Ofrezco mi apoyo y ayuda a quien lo necesite", type: 2 },
        { text: "Busco una solución eficiente que demuestre resultados", type: 3 },
        { text: "Reflexiono profundamente sobre el significado del problema", type: 4 },
        { text: "Investigo y analizo todas las opciones disponibles", type: 5 },
        { text: "Consulto con el equipo y busco orientación", type: 6 },
        { text: "Veo múltiples posibilidades y pienso en diferentes alternativas", type: 7 },
        { text: "Tomo acción directa y enfrento el problema de frente", type: 8 },
        { text: "Busco una solución que satisfaga a todos", type: 9 }
    ],
    3: [
        { text: "Hacer las cosas bien y mantener la integridad", type: 1 },
        { text: "Sentirme valorado y ser útil para los demás", type: 2 },
        { text: "Lograr objetivos y ser reconocido por mis logros", type: 3 },
        { text: "Expresar mi creatividad y ser auténtico", type: 4 },
        { text: "Aprender cosas nuevas y comprender cómo funcionan", type: 5 },
        { text: "Tener estabilidad y sentirme parte del equipo", type: 6 },
        { text: "Disfrutar de variedad y experiencias estimulantes", type: 7 },
        { text: "Tener autonomía y control sobre mis proyectos", type: 8 },
        { text: "Trabajar en un ambiente tranquilo y sin tensiones", type: 9 }
    ],
    4: [
        { text: "Evitarlo si es posible o buscar una solución justa", type: 1 },
        { text: "Intentar mediar y ayudar a ambas partes", type: 2 },
        { text: "Buscar una resolución rápida para seguir adelante", type: 3 },
        { text: "Reflexionar sobre las emociones involucradas", type: 4 },
        { text: "Observar y analizar antes de involucrarme", type: 5 },
        { text: "Buscar apoyo o consejo de alguien de confianza", type: 6 },
        { text: "Buscar el lado positivo y distraerme con otra cosa", type: 7 },
        { text: "Confrontarlo directamente sin rodeos", type: 8 },
        { text: "Evitar el conflicto y mantener la paz", type: 9 }
    ],
    5: [
        { text: "Orden, claridad y procedimientos bien definidos", type: 1 },
        { text: "Relaciones cálidas y oportunidad de ayudar", type: 2 },
        { text: "Oportunidades de crecimiento y reconocimiento", type: 3 },
        { text: "Libertad creativa y autenticidad", type: 4 },
        { text: "Espacio personal y tiempo para pensar", type: 5 },
        { text: "Estructura clara y un equipo de confianza", type: 6 },
        { text: "Variedad, innovación y ambiente dinámico", type: 7 },
        { text: "Autonomía y respeto por mi autoridad", type: 8 },
        { text: "Armonía, tranquilidad y cooperación", type: 9 }
    ]
};
