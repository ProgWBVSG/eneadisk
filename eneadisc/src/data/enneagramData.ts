// Datos completos de los 9 eneatipos
export interface EnneagramType {
    id: number;
    name: string;
    description: string;
    motivation: string;
    fear: string;
    strengths: string[];
    growthAreas: string[];
    compatibleWith: number[];
    color: string;
}

export const ENNEAGRAM_TYPES: Record<number, EnneagramType> = {
    1: {
        id: 1,
        name: "El Perfeccionista",
        description: "Ético, dedicado, confiable. Buscan hacer lo correcto y mejorar las cosas.",
        motivation: "Tener integridad, ser correcto y equilibrado",
        fear: "Ser corrupto o malo",
        strengths: ["Organizado", "Ético", "Confiable", "Mejora continua", "Alto estándar de calidad"],
        growthAreas: ["Flexibilidad", "Autocompasión", "Delegación", "Aceptar imperfecciones"],
        compatibleWith: [2, 7, 9],
        color: "#6366f1" // Indigo
    },
    2: {
        id: 2,
        name: "El Ayudador",
        description: "Cálido, servicial, generoso. Les gusta ayudar a otros y ser necesitados.",
        motivation: "Ser amado y necesitado",
        fear: "Ser no amado o no deseado",
        strengths: ["Empático", "Generoso", "Cálido", "Intuitivo", "Apoyo emocional"],
        growthAreas: ["Asertividad", "Priorización", "Acción", "Expresar necesidades"],
        compatibleWith: [1, 4, 8],
        color: "#ec4899" // Pink
    },
    3: {
        id: 3,
        name: "El Triunfador",
        description: "Exitoso, orientado a logros, adaptable. Enfocados en metas y reconocimiento.",
        motivation: "Tener éxito y ser admirado",
        fear: "Ser un fracaso o sin valor",
        strengths: ["Ambicioso", "Carismático", "Eficiente", "Motivador", "Adaptable"],
        growthAreas: ["Autenticidad", "Balance vida-trabajo", "Vulnerabilidad", "Valorar el proceso"],
        compatibleWith: [1, 6, 9],
        color: "#f59e0b" // Amber
    },
    4: {
        id: 4,
        name: "El Individualista",
        description: "Creativo, sensible, expresivo. Buscan identidad única y autenticidad.",
        motivation: "Ser único y auténtico",
        fear: "No tener identidad o significado",
        strengths: ["Creativo", "Empático", "Auténtico", "Introspectivo", "Sensible"],
        growthAreas: ["Estabilidad emocional", "Practicidad", "Gratitud", "Conexión con el presente"],
        compatibleWith: [2, 5, 7],
        color: "#8b5cf6" // Violet
    },
    5: {
        id: 5,
        name: "El Investigador",
        description: "Analítico, objetivo, curioso. Buscan conocimiento y comprensión.",
        motivation: "Ser competente y comprender",
        fear: "Ser incompetente o abrumado",
        strengths: ["Analítico", "Objetivo", "Curioso", "Independiente", "Observador"],
        growthAreas: ["Conexión emocional", "Participación activa", "Compartir conocimiento", "Sociabilidad"],
        compatibleWith: [4, 6, 8],
        color: "#10b981" // Emerald
    },
    6: {
        id: 6,
        name: "El Leal",
        description: "Comprometido, responsable, previsor. Valoran la seguridad y lealtad.",
        motivation: "Tener seguridad y apoyo",
        fear: "Estar sin apoyo o guía",
        strengths: ["Leal", "Responsable", "Previsor", "Colaborativo", "Comprometido"],
        growthAreas: ["Confianza", "Toma de decisiones", "Reducir ansiedad", "Independencia"],
        compatibleWith: [3, 5, 9],
        color: "#3b82f6" // Blue
    },
    7: {
        id: 7,
        name: "El Entusiasta",
        description: "Optimista, espontáneo, versátil. Buscan experiencias nuevas y diversión.",
        motivation: "Ser feliz y experimentar",
        fear: "Ser privado o sentir dolor",
        strengths: ["Optimista", "Entusiasta", "Versátil", "Creativo", "Energético"],
        growthAreas: ["Compromiso", "Enfoque", "Procesar emociones difíciles", "Paciencia"],
        compatibleWith: [1, 4, 8],
        color: "#eab308" // Yellow
    },
    8: {
        id: 8,
        name: "El Desafiador",
        description: "Poderoso, decisivo, protector. Buscan control y autonomía.",
        motivation: "Ser fuerte y autónomo",
        fear: "Ser controlado o vulnerable",
        strengths: ["Decisivo", "Protector", "Directo", "Seguro", "Líder natural"],
        growthAreas: ["Vulnerabilidad", "Escucha activa", "Paciencia", "Moderación"],
        compatibleWith: [2, 5, 7],
        color: "#ef4444" // Red
    },
    9: {
        id: 9,
        name: "El Pacificador",
        description: "Pacífico, receptivo, tranquilo. Buscan armonía y evitan conflictos.",
        motivation: "Tener paz y armonía",
        fear: "Perder conexión y fragmentación",
        strengths: ["Mediador", "Paciente", "Receptivo", "Estable", "Armonizador"],
        growthAreas: ["Asertividad", "Priorización", "Acción", "Expresar necesidades"],
        compatibleWith: [1, 3, 6],
        color: "#a855f7" // Purple
    }
};

export const getEnneagramType = (typeId: number): EnneagramType | undefined => {
    return ENNEAGRAM_TYPES[typeId];
};

export const getAllEnneagramTypes = (): EnneagramType[] => {
    return Object.values(ENNEAGRAM_TYPES);
};
