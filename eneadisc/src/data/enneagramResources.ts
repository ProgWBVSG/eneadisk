// ============================================================
// RECURSOS Y GUÍAS POR ENEATIPO
// ============================================================
// Ejercicios de desarrollo + guía de resolución de conflictos.
// Complementa enneagramWorkData.ts.

export interface Resource {
  icon: string; // emoji
  title: string;
  desc: string;
}

// Ejercicios prácticos de desarrollo personal por eneatipo
export const RESOURCES: Record<number, Resource[]> = {
  1: [
    { icon: '🧘', title: 'Práctica de "suficientemente bueno"', desc: 'Elegí una tarea por día para hacerla al 80% y notá que el mundo sigue girando.' },
    { icon: '📓', title: 'Diario de autocompasión', desc: 'Cuando te critiques, escribí qué le dirías a un amigo en tu lugar.' },
    { icon: '⏰', title: 'Time-boxing', desc: 'Asigná un tiempo fijo a cada tarea y respetalo, aunque no quede perfecta.' },
  ],
  2: [
    { icon: '🙋', title: 'Pedido del día', desc: 'Practicá pedir algo que necesites cada día, aunque te incomode.' },
    { icon: '🛑', title: 'El "no" amable', desc: 'Ensayá frases para declinar pedidos sin sentir culpa.' },
    { icon: '💛', title: 'Auto-chequeo', desc: 'Antes de ayudar, preguntate: ¿cómo estoy yo hoy?' },
  ],
  3: [
    { icon: '🪞', title: 'Pausa de autenticidad', desc: 'Preguntate: ¿esto lo hago por mí o por la imagen que doy?' },
    { icon: '🌿', title: 'Descanso sin culpa', desc: 'Agendá 20 min diarios sin objetivos ni productividad.' },
    { icon: '🤝', title: 'Compartir el crédito', desc: 'Reconocé públicamente el aporte de alguien del equipo.' },
  ],
  4: [
    { icon: '🙏', title: 'Diario de gratitud', desc: 'Anotá 3 cosas concretas que ya tenés cada mañana.' },
    { icon: '✅', title: 'Acción antes que ánimo', desc: 'Empezá una tarea práctica sin esperar a sentirte inspirado.' },
    { icon: '⚓', title: 'Anclaje en lo simple', desc: 'Encontrá valor en rutinas cotidianas, no solo en lo intenso.' },
  ],
  5: [
    { icon: '🗣️', title: 'Compartir en voz alta', desc: 'Aportá una idea sin tenerla 100% pulida.' },
    { icon: '🔋', title: 'Mapa de energía', desc: 'Identificá qué te recarga y agendalo conscientemente.' },
    { icon: '🚀', title: 'De analizar a actuar', desc: 'Elegí un tema y dale un primer paso concreto hoy.' },
  ],
  6: [
    { icon: '🎯', title: 'Decisión sin consultar', desc: 'Tomá una decisión chica confiando solo en tu criterio.' },
    { icon: '🔍', title: 'Test de evidencia', desc: 'Cuando aparezca la duda, preguntate: ¿qué evidencia real tengo?' },
    { icon: '🌅', title: 'Registro de logros', desc: 'Anotá problemas que ya resolviste para reforzar tu confianza.' },
  ],
  7: [
    { icon: '🎯', title: 'Una cosa a la vez', desc: 'Terminá una tarea antes de empezar otra.' },
    { icon: '⏳', title: 'Quedarte 5 min más', desc: 'Cuando quieras saltar a otra cosa, sostené 5 min más.' },
    { icon: '💭', title: 'Sentarse con lo difícil', desc: 'Permitite procesar una emoción incómoda sin escapar.' },
  ],
  8: [
    { icon: '👂', title: 'Escucha activa', desc: 'En una reunión, preguntá y escuchá antes de opinar.' },
    { icon: '💗', title: 'Mostrar vulnerabilidad', desc: 'Compartí algo que te cueste con alguien de confianza.' },
    { icon: '🤲', title: 'Soltar el control', desc: 'Delegá una tarea y resistí el impulso de microgestionar.' },
  ],
  9: [
    { icon: '🗣️', title: 'Decir lo que pienso', desc: 'En una reunión, expresá tu opinión real aunque cueste.' },
    { icon: '🥇', title: 'Una prioridad', desc: 'Definí la tarea más importante del día y arrancá por ahí.' },
    { icon: '💪', title: 'Ejercicio de asertividad', desc: 'Practicá expresar un desacuerdo de forma calmada y clara.' },
  ],
};

// Guía de resolución de conflictos: cómo manejar un conflicto CON una persona de cada tipo
export interface ConflictGuidance {
  trigger: string; // qué suele disparar el conflicto con este tipo
  howToResolve: string; // cómo desactivarlo
}

export const CONFLICT_GUIDANCE: Record<number, ConflictGuidance> = {
  1: { trigger: 'Sentir que algo se hizo "mal" o sin cuidado.', howToResolve: 'Reconocé su estándar, mostrá disposición a corregir y sé concreto sobre los próximos pasos.' },
  2: { trigger: 'Sentirse no valorado o que su ayuda fue ignorada.', howToResolve: 'Agradecé su aporte de forma genuina y hablá desde la relación, no solo desde la tarea.' },
  3: { trigger: 'Sentir que se cuestiona su competencia o su imagen.', howToResolve: 'Separá el error del valor de la persona. Enfocá la charla en soluciones y objetivos.' },
  4: { trigger: 'Sentirse incomprendido o tratado como "uno más".', howToResolve: 'Validá su perspectiva única y sus emociones antes de buscar la solución práctica.' },
  5: { trigger: 'Sentir invadido su espacio o presionado a responder ya.', howToResolve: 'Dale tiempo y espacio para procesar. Planteá el tema con lógica y por escrito si hace falta.' },
  6: { trigger: 'Incertidumbre o sentir que perdió tu apoyo.', howToResolve: 'Dale certezas concretas, reafirmá tu compromiso y sé consistente con lo que decís.' },
  7: { trigger: 'Sentirse limitado, atrapado o forzado a algo pesado.', howToResolve: 'Mantené un tono positivo, ofrecé opciones y enmarcá la solución como una oportunidad.' },
  8: { trigger: 'Sentir que lo controlan, manipulan o le faltan el respeto.', howToResolve: 'Sé directo y honesto, plantá tu posición con firmeza y respeto. No te repliegues.' },
  9: { trigger: 'Tensión, presión o sentir que su voz no importa.', howToResolve: 'Bajá la intensidad, dale espacio para opinar y preguntale directamente qué necesita.' },
};

// Prompts del diario de crecimiento según eneatipo
export const JOURNAL_PROMPTS: Record<number, string[]> = {
  1: ['¿Qué hice hoy "suficientemente bien" sin buscar la perfección?', '¿En qué fui demasiado duro conmigo mismo?'],
  2: ['¿Atendí alguna necesidad propia hoy?', '¿Pude pedir ayuda o decir que no?'],
  3: ['¿Hice algo hoy por mí y no por la imagen?', '¿Pude frenar y descansar?'],
  4: ['¿Qué tres cosas concretas agradezco hoy?', '¿Completé algo práctico aunque no me inspirara?'],
  5: ['¿Compartí una idea o me conecté con alguien hoy?', '¿Pasé del análisis a la acción?'],
  6: ['¿Tomé alguna decisión confiando en mí?', '¿Qué preocupación resultó ser infundada?'],
  7: ['¿Terminé algo que había empezado?', '¿Me quedé con una emoción difícil sin escapar?'],
  8: ['¿Mostré vulnerabilidad o escuché de verdad a alguien?', '¿Pude soltar el control en algo?'],
  9: ['¿Dije lo que realmente pensaba hoy?', '¿Cuál fue mi prioridad y la cumplí?'],
};

export const KUDOS_CATEGORIES: { value: string; label: string; emoji: string }[] = [
  { value: 'general', label: 'Reconocimiento', emoji: '⭐' },
  { value: 'colaboracion', label: 'Colaboración', emoji: '🤝' },
  { value: 'creatividad', label: 'Creatividad', emoji: '💡' },
  { value: 'liderazgo', label: 'Liderazgo', emoji: '🚀' },
  { value: 'apoyo', label: 'Apoyo', emoji: '💛' },
  { value: 'esfuerzo', label: 'Esfuerzo', emoji: '🔥' },
];
