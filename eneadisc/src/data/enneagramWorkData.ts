// ============================================================
// PERFILES DE TRABAJO POR ENEATIPO
// ============================================================
// Datos accionables del eneagrama aplicados al ámbito laboral.
// Foco: comunicación, motivadores (deseos), estresores (dolores),
// feedback y colaboración. Complementa enneagramData.ts.

export interface WorkProfile {
  /** Frase corta que resume cómo es trabajar con esta persona */
  tagline: string;
  /** Cómo se comunica naturalmente esta persona */
  communicationStyle: string;
  /** Cómo comunicarse efectivamente CON esta persona (para el equipo) */
  howToCommunicate: string[];
  /** Cómo darle feedback de forma que lo reciba bien */
  feedbackTips: string[];
  /** Qué la energiza y motiva — sus DESEOS en el trabajo */
  motivators: string[];
  /** Qué la agota o frustra — sus DOLORES en el trabajo */
  stressors: string[];
  /** Señales de que está bajo estrés + qué hacer */
  underStress: { signs: string; whatHelps: string };
  /** En qué tipo de tareas/roles brilla naturalmente */
  shinesAt: string[];
  /** Consejo de auto-cuidado para esta persona */
  selfCareTip: string;
  /** Micro-consejos diarios (rotan) accionables para crecer */
  dailyTips: string[];
}

export const WORK_PROFILES: Record<number, WorkProfile> = {
  1: {
    tagline: 'Busca la excelencia y hacer las cosas bien.',
    communicationStyle: 'Directo, preciso y orientado a la mejora. Puede sonar crítico, pero busca elevar la calidad.',
    howToCommunicate: [
      'Sé claro y específico: valora los detalles y las instrucciones precisas.',
      'Reconocé su esfuerzo y estándares antes de sugerir cambios.',
      'Evitá la ambigüedad — definí bien qué es "terminado" y "bien hecho".',
    ],
    feedbackTips: [
      'Enmarcá las críticas como "mejoras" concretas, no como errores personales.',
      'Sé objetivo y basate en hechos, no en opiniones vagas.',
      'Reconocé que ya tiene un estándar alto consigo mismo.',
    ],
    motivators: ['Hacer un trabajo de calidad', 'Mejorar procesos', 'Sentir que actúa con integridad', 'Reglas claras y justas'],
    stressors: ['Trabajo desprolijo o apurado', 'Reglas que cambian sin razón', 'Sentir que comete errores', 'Injusticia'],
    underStress: {
      signs: 'Se vuelve más crítico, rígido y autoexigente. Puede frustrarse e irritarse.',
      whatHelps: 'Recordarle que "suficientemente bueno" a veces alcanza. Darle espacio para relajarse sin culpa.',
    },
    shinesAt: ['Control de calidad', 'Procesos y estándares', 'Tareas que requieren precisión', 'Mejora continua'],
    selfCareTip: 'Permitite descansar sin sentir que "deberías" estar haciendo algo productivo. No todo tiene que ser perfecto.',
    dailyTips: [
      'Hoy, elegí una tarea y date permiso de hacerla "bien" en vez de "perfecta".',
      'Antes de criticar algo, reconocé primero qué está funcionando.',
      'Ponete un límite de tiempo para una tarea y respétalo, aunque no quede perfecta.',
      'Tu autoexigencia es una fortaleza; tu autocompasión también puede serlo.',
    ],
  },
  2: {
    tagline: 'Conecta con la gente y le encanta ayudar.',
    communicationStyle: 'Cálido, empático y atento a las emociones del equipo. Prioriza las relaciones.',
    howToCommunicate: [
      'Mostrá aprecio genuino — necesita sentirse valorado.',
      'Preguntá cómo está antes de ir directo a la tarea.',
      'Sé cálido pero claro con tus expectativas.',
    ],
    feedbackTips: [
      'Empezá reconociendo su aporte al equipo y a las personas.',
      'Cuidá el tono: el feedback frío lo afecta más que a otros.',
      'Animalo a poner sus propias necesidades primero, no solo las de los demás.',
    ],
    motivators: ['Sentirse necesitado y apreciado', 'Ayudar a otros', 'Relaciones cercanas en el equipo', 'Reconocimiento personal'],
    stressors: ['Sentirse ignorado o no valorado', 'Conflictos en el equipo', 'Que le pidan algo sin agradecer', 'Trabajar aislado'],
    underStress: {
      signs: 'Se sobre-involucra en problemas ajenos, descuida sus propias tareas, busca aprobación.',
      whatHelps: 'Recordarle que cuidarse a sí mismo no es egoísta. Reconocer explícitamente su aporte.',
    },
    shinesAt: ['Atención al cliente', 'Cohesión de equipo', 'Mentoría y onboarding', 'Roles de soporte'],
    selfCareTip: 'Practicá decir "no" sin culpa. Tus necesidades importan tanto como las de los demás.',
    dailyTips: [
      'Hoy, antes de ayudar a alguien, preguntate: ¿terminé lo mío?',
      'Pedí algo que necesites, aunque te incomode.',
      'Reconocé tu propio trabajo, no solo el de los demás.',
      'Está bien recibir ayuda, no solo darla.',
    ],
  },
  3: {
    tagline: 'Orientado a resultados y a lograr metas.',
    communicationStyle: 'Eficiente, enfocado en objetivos y resultados. Va al grano y le gusta avanzar rápido.',
    howToCommunicate: [
      'Sé directo y eficiente — valora que no le hagas perder tiempo.',
      'Reconocé sus logros y resultados concretos.',
      'Planteá las cosas en términos de metas y impacto.',
    ],
    feedbackTips: [
      'Conectá el feedback con sus objetivos y su crecimiento profesional.',
      'Sé honesto pero cuidá su imagen — le importa cómo lo perciben.',
      'Valorá el proceso, no solo el resultado, para ayudarlo a no quemarse.',
    ],
    motivators: ['Lograr metas y reconocimiento', 'Ser eficiente', 'Crecer profesionalmente', 'Ganar y destacar'],
    stressors: ['Fracasar o quedar mal', 'Tareas sin objetivo claro', 'Procesos lentos', 'No ser reconocido'],
    underStress: {
      signs: 'Se vuelve workaholic, prioriza la imagen sobre la sustancia, se desconecta de sus emociones.',
      whatHelps: 'Recordarle que su valor no depende de sus logros. Animarlo a frenar y descansar.',
    },
    shinesAt: ['Liderar proyectos', 'Cerrar objetivos', 'Presentaciones', 'Roles de alto rendimiento'],
    selfCareTip: 'Tu valor no se mide solo por lo que lográs. Date permiso de simplemente "ser" a veces.',
    dailyTips: [
      'Hoy, frená 10 minutos sin hacer nada productivo. Solo respirá.',
      'Compartí un crédito con alguien del equipo.',
      'Preguntate: ¿esto lo hago por mí o por cómo me ven?',
      'Celebrá el proceso, no solo el resultado final.',
    ],
  },
  4: {
    tagline: 'Creativo, auténtico y profundo.',
    communicationStyle: 'Expresivo, personal y emocional. Valora la autenticidad y la conexión genuina.',
    howToCommunicate: [
      'Reconocé su singularidad y su aporte creativo.',
      'Sé auténtico — detecta rápido lo superficial o forzado.',
      'Dale espacio para expresar cómo se siente, no solo qué hace.',
    ],
    feedbackTips: [
      'Sé personal y genuino, no genérico.',
      'Reconocé su perspectiva única antes de sugerir cambios.',
      'Evitá comparaciones con otros — le afectan mucho.',
    ],
    motivators: ['Expresar su creatividad', 'Trabajo con significado', 'Ser visto como único', 'Conexión emocional auténtica'],
    stressors: ['Trabajo monótono o impersonal', 'Sentirse incomprendido', 'Comparaciones con otros', 'Ambientes fríos'],
    underStress: {
      signs: 'Se vuelve melancólico, se aísla, siente que algo le falta o que no encaja.',
      whatHelps: 'Validar sus emociones sin intentar "arreglarlas". Recordarle lo que sí tiene y aporta.',
    },
    shinesAt: ['Diseño y creatividad', 'Branding y narrativa', 'Innovación', 'Proyectos con propósito'],
    selfCareTip: 'No todo tiene que ser intenso para tener valor. Buscá estabilidad en lo simple y cotidiano.',
    dailyTips: [
      'Hoy, agradecé tres cosas concretas que ya tenés.',
      'Terminá algo práctico, aunque no te inspire del todo.',
      'Tu sensibilidad es un don; no dejes que se vuelva en tu contra.',
      'Conectá con un compañero hoy, no te aísles.',
    ],
  },
  5: {
    tagline: 'Analítico, independiente y experto.',
    communicationStyle: 'Reservado, preciso y basado en datos. Piensa antes de hablar y valora la lógica.',
    howToCommunicate: [
      'Dale tiempo para procesar — no esperes respuestas inmediatas.',
      'Respetá su espacio y su autonomía.',
      'Andá al punto con información clara; valora la sustancia sobre la charla.',
    ],
    feedbackTips: [
      'Dale el feedback por escrito o con tiempo para procesarlo.',
      'Basate en lógica y datos, no en emociones.',
      'Respetá su necesidad de privacidad — evitá exponerlo en público.',
    ],
    motivators: ['Aprender y dominar temas', 'Autonomía e independencia', 'Resolver problemas complejos', 'Tener tiempo para pensar'],
    stressors: ['Reuniones largas o sin sentido', 'Interrupciones constantes', 'Demandas emocionales', 'Falta de tiempo para preparar'],
    underStress: {
      signs: 'Se aísla más, se vuelve avaro de su tiempo y energía, sobre-analiza sin actuar.',
      whatHelps: 'Respetar su espacio pero invitarlo a participar. No invadir su tiempo de recarga.',
    },
    shinesAt: ['Análisis e investigación', 'Estrategia', 'Resolución de problemas técnicos', 'Trabajo profundo'],
    selfCareTip: 'Compartir lo que sabés y conectar con otros también recarga. No tenés que tener todas las respuestas solo.',
    dailyTips: [
      'Hoy, compartí una idea aunque no la tengas 100% pulida.',
      'Participá en una conversación de equipo, aunque sea breve.',
      'Pasá de analizar a actuar en una tarea concreta.',
      'Tu energía es limitada y válida: protegé tus recargas.',
    ],
  },
  6: {
    tagline: 'Leal, responsable y previsor.',
    communicationStyle: 'Cuidadoso, busca claridad y seguridad. Hace preguntas para anticipar problemas.',
    howToCommunicate: [
      'Sé claro y consistente — la incertidumbre lo pone ansioso.',
      'Tomate en serio sus preguntas y preocupaciones.',
      'Generá confianza con seguimiento y cumpliendo lo que prometés.',
    ],
    feedbackTips: [
      'Dale seguridad: aclarale que el feedback no amenaza su lugar.',
      'Sé directo pero tranquilizador.',
      'Reconocé su lealtad y compromiso con el equipo.',
    ],
    motivators: ['Seguridad y estabilidad', 'Un equipo confiable', 'Reglas y expectativas claras', 'Sentirse parte y apoyado'],
    stressors: ['Incertidumbre y cambios bruscos', 'Falta de información', 'Liderazgo inconsistente', 'Sentirse sin respaldo'],
    underStress: {
      signs: 'Se vuelve ansioso, dubitativo, busca certezas constantemente o se pone a la defensiva.',
      whatHelps: 'Darle información y certeza. Reforzar que tiene tu apoyo y que su lugar es seguro.',
    },
    shinesAt: ['Gestión de riesgos', 'Planificación', 'Roles de confianza', 'Trabajo en equipo estable'],
    selfCareTip: 'No todo lo que imaginás que puede salir mal, va a salir mal. Confiá un poco más en vos y en el proceso.',
    dailyTips: [
      'Hoy, tomá una decisión chica sin pedir una segunda opinión.',
      'Cuando aparezca la duda, preguntate: ¿qué evidencia real tengo?',
      'Confiá en tu criterio: ya resolviste cosas difíciles antes.',
      'Tu previsión es valiosa; no dejes que se vuelva ansiedad.',
    ],
  },
  7: {
    tagline: 'Entusiasta, creativo y lleno de energía.',
    communicationStyle: 'Optimista, rápido y lleno de ideas. Le gusta explorar posibilidades y mantener la energía alta.',
    howToCommunicate: [
      'Mantené la energía positiva y el entusiasmo.',
      'Dale variedad y libertad — el exceso de restricciones lo apaga.',
      'Ayudalo a enfocarse sin matar su entusiasmo.',
    ],
    feedbackTips: [
      'Enmarcá el feedback como una nueva oportunidad o desafío.',
      'Sé positivo pero ayudalo a comprometerse con el seguimiento.',
      'Evitá abrumarlo con limitaciones; ofrecé opciones.',
    ],
    motivators: ['Variedad y experiencias nuevas', 'Libertad y flexibilidad', 'Proyectos creativos', 'Un ambiente positivo'],
    stressors: ['Rutina y tareas repetitivas', 'Restricciones excesivas', 'Conflictos o emociones pesadas', 'Aburrimiento'],
    underStress: {
      signs: 'Se dispersa, salta de tarea en tarea, evita lo difícil o se vuelve impaciente y crítico.',
      whatHelps: 'Ayudarlo a enfocarse en una cosa. Mostrarle que terminar también es satisfactorio.',
    },
    shinesAt: ['Brainstorming e ideas', 'Proyectos nuevos', 'Energizar al equipo', 'Roles dinámicos y variados'],
    selfCareTip: 'La profundidad también trae alegría. Quedarte con una cosa y terminarla puede ser más satisfactorio que empezar diez.',
    dailyTips: [
      'Hoy, elegí UNA tarea y terminala antes de empezar otra.',
      'Quedate 5 minutos más en algo difícil antes de saltar.',
      'Las emociones incómodas también tienen información valiosa.',
      'Tu energía contagia al equipo; usala para cerrar, no solo para abrir.',
    ],
  },
  8: {
    tagline: 'Decidido, directo y protector.',
    communicationStyle: 'Franco, seguro y directo. Dice lo que piensa y respeta a quien hace lo mismo.',
    howToCommunicate: [
      'Sé directo y seguro — respeta la franqueza, no los rodeos.',
      'No te dejes intimidar; valora a quien le planta cara con respeto.',
      'Mostrá competencia y mantené tu palabra.',
    ],
    feedbackTips: [
      'Sé directo y honesto — detecta y rechaza la falsedad.',
      'Andá al grano con hechos concretos.',
      'Mostrale que el feedback busca proteger al equipo o al objetivo.',
    ],
    motivators: ['Tener control y autonomía', 'Proteger a su equipo', 'Desafíos grandes', 'Justicia y honestidad'],
    stressors: ['Sentirse controlado o manipulado', 'Injusticia', 'Indecisión o debilidad ajena', 'Microgestión'],
    underStress: {
      signs: 'Se vuelve más controlador, confrontativo o se aísla emocionalmente.',
      whatHelps: 'Darle autonomía y respeto. Mostrarle que la vulnerabilidad no es debilidad.',
    },
    shinesAt: ['Liderazgo', 'Toma de decisiones difíciles', 'Defender al equipo', 'Situaciones de crisis'],
    selfCareTip: 'Mostrar vulnerabilidad no te hace débil — te hace humano y acerca a tu equipo. No tenés que cargar todo solo.',
    dailyTips: [
      'Hoy, antes de decidir, preguntá la opinión de alguien y escuchala de verdad.',
      'Reconocé un sentimiento, no solo una acción.',
      'Tu fuerza protege; cuidá no aplastar sin querer.',
      'Bajá un cambio: no toda situación es una batalla.',
    ],
  },
  9: {
    tagline: 'Tranquilo, mediador y estable.',
    communicationStyle: 'Calmado, receptivo y conciliador. Evita el conflicto y busca armonía en el equipo.',
    howToCommunicate: [
      'Creá un espacio seguro para que dé su opinión real.',
      'Preguntale directamente qué piensa — tiende a callarse para evitar conflicto.',
      'Sé paciente y evitá presionarlo con urgencia agresiva.',
    ],
    feedbackTips: [
      'Sé amable y directo a la vez; suavizá pero no escondas el mensaje.',
      'Animalo a expresar su desacuerdo — su voz importa.',
      'Reconocé su rol estabilizador en el equipo.',
    ],
    motivators: ['Armonía y un ambiente tranquilo', 'Sentirse incluido', 'Trabajo estable y sin drama', 'Ritmo propio'],
    stressors: ['Conflictos y tensión', 'Presión y urgencias constantes', 'Sentirse ignorado', 'Tener que elegir bajo presión'],
    underStress: {
      signs: 'Se vuelve pasivo, posterga, se "desconecta" o evita tomar decisiones.',
      whatHelps: 'Ayudarlo a priorizar y a dar el primer paso. Reconocer su aporte para que se sienta visto.',
    },
    shinesAt: ['Mediación y resolución de conflictos', 'Trabajo en equipo', 'Roles que requieren calma', 'Escucha y facilitación'],
    selfCareTip: 'Tu opinión y tus necesidades importan tanto como las de los demás. Decir lo que querés no rompe la armonía, la hace real.',
    dailyTips: [
      'Hoy, decí lo que realmente pensás en una reunión, aunque cueste.',
      'Empezá por la tarea más importante, no por la más fácil.',
      'Tu calma es un don para el equipo; usala sin desaparecer.',
      'Poné una prioridad clara para hoy y arrancá por ahí.',
    ],
  },
};

/** Devuelve un consejo del día determinista (rota según el día del año) */
export function getDailyTip(typeId: number): string {
  const profile = WORK_PROFILES[typeId];
  if (!profile || profile.dailyTips.length === 0) return '';
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return profile.dailyTips[dayOfYear % profile.dailyTips.length];
}
