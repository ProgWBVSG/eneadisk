// ============================================================
// GUÍA DE LIDERAZGO POR ENEATIPO (para el admin / manager)
// ============================================================
// Cómo liderar, motivar y asignar trabajo a cada tipo de persona.

export interface LeadershipGuide {
  howToLead: string;       // estilo de liderazgo que mejor le funciona
  assignWork: string;      // cómo asignarle trabajo para que rinda
  motivate: string;        // cómo motivarlo / reconocerlo
  watchFor: string;        // señal de alerta a vigilar en esta persona
}

export const LEADERSHIP_GUIDE: Record<number, LeadershipGuide> = {
  1: {
    howToLead: 'Dale claridad y estándares definidos. Valorá su rigor, pero ayudalo a soltar el perfeccionismo.',
    assignWork: 'Tareas que requieran calidad y precisión. Definí bien qué es "terminado".',
    motivate: 'Reconocé su integridad y la calidad de su trabajo. Dale autonomía sobre cómo mejorar procesos.',
    watchFor: 'Autoexigencia excesiva y crítica (a sí mismo y a otros). Puede quemarse buscando lo perfecto.',
  },
  2: {
    howToLead: 'Sé cálido y mostrá aprecio genuino. Ayudalo a poner límites y a cuidarse a sí mismo.',
    assignWork: 'Roles de soporte, atención a personas, cohesión de equipo. Que sienta que ayuda.',
    motivate: 'Reconocimiento personal y sincero. Que sepa que su aporte a las personas se valora.',
    watchFor: 'Se sobre-involucra y descuida lo suyo. Puede agotarse ayudando y no pedir nada a cambio.',
  },
  3: {
    howToLead: 'Dale metas claras y espacio para destacar. Ayudalo a equilibrar logros con bienestar.',
    assignWork: 'Proyectos con objetivos medibles y visibilidad. Brilla cuando puede mostrar resultados.',
    motivate: 'Reconocé sus logros y su crecimiento profesional. Conectá su trabajo con su carrera.',
    watchFor: 'Workaholism y priorizar la imagen. Riesgo alto de burnout por exceso de exigencia.',
  },
  4: {
    howToLead: 'Reconocé su singularidad y dale trabajo con significado. Sé auténtico, detecta lo superficial.',
    assignWork: 'Proyectos creativos, de diseño o con propósito. Que pueda dejar su sello personal.',
    motivate: 'Validá su perspectiva única. Evitá compararlo con otros — le afecta mucho.',
    watchFor: 'Vaivenes emocionales y sensación de no encajar. Puede aislarse si se siente incomprendido.',
  },
  5: {
    howToLead: 'Respetá su autonomía y su espacio. Dale tiempo para procesar antes de pedir respuestas.',
    assignWork: 'Análisis, investigación, problemas complejos. Trabajo profundo sin interrupciones.',
    motivate: 'Dale dominio sobre su área y tiempo para pensar. Valorá su expertise.',
    watchFor: 'Aislamiento y avaricia de energía. Puede desconectarse del equipo y sobre-analizar sin actuar.',
  },
  6: {
    howToLead: 'Sé claro, consistente y confiable. La incertidumbre lo pone ansioso — dale certezas.',
    assignWork: 'Gestión de riesgos, planificación, roles de confianza. Anticipa problemas muy bien.',
    motivate: 'Dale seguridad y reforzá que su lugar es estable. Reconocé su lealtad y compromiso.',
    watchFor: 'Ansiedad e indecisión. Puede paralizarse buscando certezas o ponerse a la defensiva.',
  },
  7: {
    howToLead: 'Mantené la energía positiva y dale variedad. Ayudalo a enfocarse sin apagar su entusiasmo.',
    assignWork: 'Proyectos nuevos, brainstorming, roles dinámicos. Se aburre con la rutina.',
    motivate: 'Ofrecé libertad, variedad y un ambiente positivo. Enmarcá los desafíos como oportunidades.',
    watchFor: 'Dispersión y evitar lo difícil. Empieza muchas cosas y le cuesta cerrar.',
  },
  8: {
    howToLead: 'Sé directo y firme. Respeta la franqueza, no los rodeos. Dale autonomía y no lo microgestiones.',
    assignWork: 'Liderazgo, decisiones difíciles, situaciones de crisis. Protege al equipo con naturalidad.',
    motivate: 'Dale control y desafíos grandes. Reconocé su capacidad de tomar las riendas.',
    watchFor: 'Puede volverse controlador o confrontativo. Cuidá que no aplaste a los más callados.',
  },
  9: {
    howToLead: 'Creá un espacio seguro y preguntale directamente su opinión. Evitá presionarlo con urgencia.',
    assignWork: 'Mediación, trabajo en equipo, roles que requieren calma y escucha.',
    motivate: 'Reconocé su rol estabilizador y hacelo sentir incluido. Dale ritmo propio.',
    watchFor: 'Pasividad y postergación. Puede "desaparecer" o evitar decisiones para no generar conflicto.',
  },
};

// ============================================================
// PLANTILLAS DE FEEDBACK POR ENEATIPO
// ============================================================
// Cómo dar feedback (positivo y de mejora) a cada tipo, y qué evitar.
// Pensado para que el líder copie/adapte el mensaje al hablar con su gente.

export interface FeedbackGuide {
  positive: string;   // plantilla de reconocimiento que le llega de verdad
  corrective: string; // plantilla de feedback de mejora que no lo bloquea
  avoid: string;      // qué evitar al darle feedback a este tipo
}

export const FEEDBACK_GUIDE: Record<number, FeedbackGuide> = {
  1: {
    positive: 'Valoro muchísimo el cuidado y la calidad que ponés en [tarea]. Se nota tu compromiso con hacer las cosas bien.',
    corrective: 'Hiciste un gran trabajo en [tarea]. Para esto que sigue, alcanza con un "suficientemente bueno" — prioricemos avanzar sobre perfeccionar.',
    avoid: 'Evitá la crítica vaga o en público: ya es muy duro consigo mismo. Sé concreto y justo.',
  },
  2: {
    positive: 'Gracias por estar siempre para el equipo. Tu apoyo en [situación] hizo una diferencia real para [persona].',
    corrective: 'Tu ayuda es enorme. Esta vez me gustaría que también cuides tu carga: ¿qué necesitás vos para [tarea]?',
    avoid: 'Evitá que sienta que solo lo valorás por lo que hace por otros. Reconocelo a él, no solo su utilidad.',
  },
  3: {
    positive: 'Lograste [resultado] y se nota tu capacidad para ejecutar. Buen trabajo, esto suma a tu crecimiento.',
    corrective: 'Vas muy bien con los resultados. Cuidemos también el "cómo": ¿cómo venís de energía con este ritmo en [tarea]?',
    avoid: 'Evitá el feedback que suene a fracaso público — lo vive como amenaza. Enmarcalo como próximo logro.',
  },
  4: {
    positive: 'Tu mirada en [tarea] fue única y aportó algo que nadie más vio. Gracias por traer esa profundidad.',
    corrective: 'Me encanta tu enfoque. Para [tarea], busquemos juntos cómo bajarlo a algo concreto y entregable.',
    avoid: 'Evitá compararlo con otros y el tono frío/genérico. Sé auténtico y reconocé su singularidad.',
  },
  5: {
    positive: 'Tu análisis de [tema] fue claro y muy bien fundamentado. Confío en tu criterio para esto.',
    corrective: 'Buen trabajo. Para avanzar, con lo que ya investigaste alcanza para dar el primer paso en [tarea].',
    avoid: 'Evitá presionarlo en el momento o invadir su espacio. Dale el feedback por escrito y tiempo para procesarlo.',
  },
  6: {
    positive: 'Gracias por tu compromiso y por anticipar [riesgo]. Tu lealtad y previsión le dan tranquilidad al equipo.',
    corrective: 'Vas bien. Confiá en tu criterio: para [tarea] no hace falta certeza total, avancemos con lo que sabés hoy.',
    avoid: 'Evitá la ambigüedad o las sorpresas: lo ponen ansioso. Sé claro, consistente y predecible.',
  },
  7: {
    positive: 'Tu energía e ideas en [proyecto] contagiaron al equipo. Gracias por traer ese impulso.',
    corrective: 'Buenísimas ideas. Elijamos UNA y cerrémosla antes de abrir la próxima — el cierre también suma.',
    avoid: 'Evitá el tono pesado o encerrarlo en lo negativo. Enmarcá la mejora como un desafío estimulante.',
  },
  8: {
    positive: 'Tomaste las riendas en [situación] y se notó. Gracias por bancar al equipo cuando hizo falta.',
    corrective: 'Te lo digo directo: en [situación] el equipo necesitó más espacio. ¿Cómo lo manejamos la próxima?',
    avoid: 'Evitá los rodeos y la indirecta: los lee como debilidad. Sé directo, firme y de igual a igual.',
  },
  9: {
    positive: 'Tu calma y tu forma de unir al equipo en [situación] fueron clave. Se valora mucho ese rol.',
    corrective: 'Quiero tu opinión real sobre [tema], aunque no coincida. Tu voz importa y la necesito.',
    avoid: 'Evitá la presión o la urgencia agresiva: se bloquea y se retira. Invitalo con calma a opinar y decidir.',
  },
};

// ============================================================
// GUION DE 1:1 (uno a uno) POR ENEATIPO
// ============================================================
// Estructura sugerida para una reunión individual líder ↔ colaborador.

export interface OneOnOneGuide {
  opener: string;   // pregunta para abrir y generar confianza
  focus: string;    // en qué poner el foco de la conversación
  closer: string;   // cómo cerrar dejando a la persona bien
}

export const ONE_ON_ONE_GUIDE: Record<number, OneOnOneGuide> = {
  1: {
    opener: '¿Qué cosas sentís que están saliendo bien últimamente, más allá de lo que falta mejorar?',
    focus: 'Ayudalo a priorizar y a soltar el perfeccionismo. Validá que "hecho" ya es valioso.',
    closer: 'Cerrá reconociendo un logro concreto y recordándole que no tiene que cargar con todo el estándar solo.',
  },
  2: {
    opener: '¿Cómo estás vos? No qué necesita el equipo, sino qué necesitás vos esta semana.',
    focus: 'Foco en sus propias necesidades y límites. Asegurate de que no se esté sobrecargando.',
    closer: 'Cerrá agradeciéndole por quién es, no solo por lo que hace. Que se sienta visto.',
  },
  3: {
    opener: '¿De qué estás orgulloso/a esta semana? ¿Y cómo venís de energía con el ritmo?',
    focus: 'Conectá sus logros con su crecimiento, pero abrí el tema bienestar para prevenir burnout.',
    closer: 'Cerrá reconociendo un logro y un próximo objetivo claro y motivante.',
  },
  4: {
    opener: '¿Hay algo en lo que estés trabajando que te entusiasme o tenga sentido especial para vos?',
    focus: 'Dale espacio para lo emocional y lo creativo. Validá su perspectiva sin compararlo.',
    closer: 'Cerrá reconociendo su aporte único y mostrando que su voz importa en el equipo.',
  },
  5: {
    opener: '(Enviá los temas antes.) ¿Qué tema te gustaría que veamos hoy con más profundidad?',
    focus: 'Respetá su ritmo, no lo presiones por respuestas inmediatas. Valorá su expertise.',
    closer: 'Cerrá dándole autonomía sobre su área y tiempo para pensar lo conversado.',
  },
  6: {
    opener: '¿Hay algo que te esté generando dudas o que quieras que aclaremos juntos?',
    focus: 'Dale certezas y previsibilidad. Reforzá que su lugar es estable y que confiás en él.',
    closer: 'Cerrá con próximos pasos claros y concretos. La claridad le baja la ansiedad.',
  },
  7: {
    opener: '¿Qué fue lo más copado en lo que trabajaste y qué te gustaría explorar?',
    focus: 'Aprovechá su energía pero ayudalo a enfocar y cerrar lo empezado.',
    closer: 'Cerrá con un desafío concreto y entusiasmante, y un compromiso de cierre.',
  },
  8: {
    opener: 'Te lo pregunto directo: ¿qué está funcionando y qué cambiarías ya mismo?',
    focus: 'Conversación franca y de igual a igual. Dale control sobre sus decisiones.',
    closer: 'Cerrá con acuerdos claros y dándole autonomía. Sin microgestión.',
  },
  9: {
    opener: 'Quiero tu opinión real sobre cómo venimos. Tomate tu tiempo, no hay apuro.',
    focus: 'Creá espacio seguro y preguntá directamente. Evitá presionar; invitá a decidir.',
    closer: 'Cerrá ayudándolo a fijar UNA prioridad clara y reconociéndole su rol estabilizador.',
  },
};
