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
