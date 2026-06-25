// ============================================================
// Cuestionario de identificación de eneatipo — 10 preguntas
// ============================================================
// Afirmaciones AUTÉNTICAS del instrumento de eneascoaching
// (banco de 270, 30 por tipo). Cada pregunta presenta 9 frases
// — una por eneatipo — y la persona elige la que más la representa.
// Opciones mezcladas (seed fija) para evitar sesgo de posición.
// Metodología y curado: skill `enneagram-expert`.
// ============================================================

export interface QuestionOption { text: string; type: number; }
export interface Question {
    id: number;
    text: string;
    weight: number;
    isCoreFear?: boolean;
    options: QuestionOption[];
}

export const QUESTIONNAIRE: Question[] = [
    {
        id: 1,
        text: "Elegí la frase con la que MÁS te identificás:",
        weight: 1.0,
        options: [
            { text: "Con frecuencia las dudas me invaden.", type: 6 },
            { text: "No grito, mi tono de voz es fuerte.", type: 8 },
            { text: "Prefiero aislarme para pensar lo que siento.", type: 5 },
            { text: "Me precio de ser una persona estable.", type: 9 },
            { text: "Me cuesta relajarme y estar alegre.", type: 1 },
            { text: "Me gusta proyectar, lograr éxito, triunfar.", type: 3 },
            { text: "Necesito mi tiempo para estar conmigo.", type: 4 },
            { text: "Me gusta intimar, servir, entregar.", type: 2 },
            { text: "Me gusta casi todo lo que encuentro.", type: 7 },
        ],
    },
    {
        id: 2,
        text: "¿Cuál de estas te describe mejor?",
        weight: 1.0,
        options: [
            { text: "Me molesta el fracaso, eso es para los débiles.", type: 3 },
            { text: "Me gusta que la gente necesite de mí.", type: 2 },
            { text: "Suelo proyectar mis miedos a los demás.", type: 6 },
            { text: "Soy una persona libre, nada me detiene.", type: 8 },
            { text: "Me fastidian las personas que no son lógicas.", type: 5 },
            { text: "Puedo conciliar para que reine la armonía.", type: 9 },
            { text: "Me gusta disfrutar y que todos disfrutemos.", type: 7 },
            { text: "Me gusta crear, soñar, vibrar la vida.", type: 4 },
            { text: "Me gusta ordenar, organizar, planificar.", type: 1 },
        ],
    },
    {
        id: 3,
        text: "¿Con cuál te sentís más identificado/a?",
        weight: 1.0,
        options: [
            { text: "No me gusta pensar que yo pueda ser vulgar.", type: 4 },
            { text: "Me esfuerzo mucho por corregir mis faltas.", type: 1 },
            { text: "Me gusta sintetizar y reunir ideas diferentes.", type: 5 },
            { text: "Soy sumamente competente, mi vida es interesante.", type: 3 },
            { text: "Me gusta acompañar, sostener, colaborar.", type: 6 },
            { text: "Me resulta fácil expresar mi insatisfacción.", type: 8 },
            { text: "A veces soy una persona demasiado generosa.", type: 2 },
            { text: "Puedo encontrar lo positivo de cada situación.", type: 7 },
            { text: "Me encanta disponer de tiempo libre para descansar.", type: 9 },
        ],
    },
    {
        id: 4,
        text: "Elegí la que más va con vos:",
        weight: 1.0,
        options: [
            { text: "Me siento bien teniendo todo bajo control.", type: 1 },
            { text: "Mi teoría es que si algo es bueno, más es mejor.", type: 7 },
            { text: "Me gusta tener libertad para poder hacer más cosas.", type: 3 },
            { text: "Siento orgullo de ser una persona objetiva y clara.", type: 5 },
            { text: "Tiendo a ser sensible y a permanecer en mi mundo.", type: 4 },
            { text: "Me considero una persona simple, serena, equilibrada.", type: 9 },
            { text: "Puedo percibir fácilmente lo que la gente necesita.", type: 2 },
            { text: "Es muy importante para mi la lealtad al grupo.", type: 6 },
            { text: "No me asusta enfrentarme con otros y lo hago.", type: 8 },
        ],
    },
    {
        id: 5,
        text: "¿Cuál refleja mejor cómo sos?",
        weight: 1.0,
        options: [
            { text: "Suelo juzgar a las personas por su capacidad de triunfar.", type: 3 },
            { text: "Me gusta que me respeten y me quieran tal como soy.", type: 4 },
            { text: "Si algo no está bien, realmente me molesta.", type: 1 },
            { text: "Me gusta liderar, defender, luchar y proteger.", type: 8 },
            { text: "Soy una persona tranquila y pacífica, estoy bien así.", type: 9 },
            { text: "Me molesta no entender algo, me hace sentir ignorante.", type: 5 },
            { text: "Me identifico con mi grupo y desconfío de los demás.", type: 6 },
            { text: "Me gusta que me digan que mi ayuda fue muy importante.", type: 2 },
            { text: "La gente suele pensar que soy el alma de las reuniones.", type: 7 },
        ],
    },
    {
        id: 6,
        text: "Marcá la frase que más te representa:",
        weight: 1.0,
        options: [
            { text: "Puedo cumplir fielmente, soy leal, obediente y responsable.", type: 6 },
            { text: "Tiendo a cuidar los detalles, el orden y la precisión.", type: 1 },
            { text: "Me gusta que las personas me compartan lo que sienten.", type: 2 },
            { text: "No puedo dejar de pensar en las metas que me he propuesto.", type: 3 },
            { text: "Soy una persona que casi siempre está calmada y tranquila.", type: 9 },
            { text: "Aun en la rutina diaria, me gusta poner mi impronta personal.", type: 4 },
            { text: "Necesito contar con información, entender de lo que se habla.", type: 5 },
            { text: "A veces soy una persona dispersa y curiosa, todo me interesa.", type: 7 },
            { text: "Protejo a quienes se encuentran bajo mi autoridad.", type: 8 },
        ],
    },
    {
        id: 7,
        text: "¿Cuál sentís más tuya?",
        weight: 1.0,
        options: [
            { text: "Tiendo a ser una persona solitaria, me cuesta expresar mis emociones.", type: 5 },
            { text: "Prefiero hablar suavemente, sin exaltarme ni levantar la voz.", type: 9 },
            { text: "Soy una persona buena para persuadir y movilizar a los demás.", type: 3 },
            { text: "Suelo pasar de una cosa a otra, en vez de profundizar en una sola.", type: 7 },
            { text: "Necesito vivir intensamente, sentir la adrenalina.", type: 8 },
            { text: "Me considero una persona sensible, auténtica, especial y profunda.", type: 4 },
            { text: "Hay muchas personas que dependen de mi ayuda y generosidad.", type: 2 },
            { text: "Me enojo cuando los demás no escuchan lo que tengo para decirles.", type: 1 },
            { text: "Me gusta colaborar con los demás, ellos pueden fiarse de mí.", type: 6 },
        ],
    },
    {
        id: 8,
        text: "Elegí la que mejor te describe:",
        weight: 1.0,
        options: [
            { text: "Me he inclinado a ser una persona muy emotiva y poco disciplinada.", type: 4 },
            { text: "Necesito estar motivado por algo trascendente para entrar en acción.", type: 9 },
            { text: "Me gustaría que los demás estuviesen mejor dispuestos respecto a todo.", type: 7 },
            { text: "Por naturaleza soy una persona reservada, introvertida, independiente.", type: 5 },
            { text: "No puedo negar mi atención a alguien sin tener una buena excusa.", type: 2 },
            { text: "Soy consciente de las contradicciones y muy sensible a ellas.", type: 6 },
            { text: "No me gusta que me digan que me adapte o me conforme.", type: 8 },
            { text: "Vivo con cierta tensión porque me propongo demasiados objetivos.", type: 3 },
            { text: "Me molesta equivocarme, no me gustan que me vean cometiendo errores.", type: 1 },
        ],
    },
    {
        id: 9,
        text: "¿Con cuál te identificás más?",
        weight: 1.0,
        options: [
            { text: "Me gusta cuidar a los demás, prestar atención a sus necesidades.", type: 2 },
            { text: "Me molesta lo rutinario y repetitivo, prefiero lo distinto y único.", type: 4 },
            { text: "Cuando me presentan a alguien, soy una persona entretenida y afectuosa.", type: 7 },
            { text: "Me considero una persona inteligente, objetiva, racional, sabia y profunda.", type: 5 },
            { text: "No creo que yo haga algo extraordinario, soy una persona común.", type: 6 },
            { text: "No me gustan las improvisaciones, las considero una irresponsabilidad.", type: 1 },
            { text: "Otras personas me envidian por mi capacidad de hacer muchas cosas.", type: 3 },
            { text: "Cuando se me pasa el enojo, ni me acuerdo lo que dije.", type: 8 },
            { text: "Se puede decir que soy una persona paciente, diplomática, conciliadora.", type: 9 },
        ],
    },
    {
        id: 10,
        text: "Por último, ¿cuál va más con vos?",
        weight: 1.0,
        options: [
            { text: "Me duele mucho cuando mis amistades se reúnen y no me participan.", type: 2 },
            { text: "No me gusta que me pidan una opinión cuando no estoy dispuesto a darla.", type: 9 },
            { text: "Me importa mucho lo que los otros puedan llegar a pensar de mí.", type: 6 },
            { text: "Me gusta sentirme una persona juguetona, infantil, que se me vea alegre.", type: 7 },
            { text: "Me he dado cuenta que, frecuentemente, me catalogan como demasiado racional.", type: 5 },
            { text: "Con frecuencia el parecer de los demás no me interesa.", type: 8 },
            { text: "Me parece que el fin de una relación me afecta más que a la mayoría.", type: 4 },
            { text: "Con frecuencia mis propias críticas y las de otros pululan en mi cabeza.", type: 1 },
            { text: "Soy visto por los demás como una persona que logra lo que se propone.", type: 3 },
        ],
    },
];
