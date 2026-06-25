// ============================================================
// Cuestionario de identificación de eneatipo — 10 preguntas
// ============================================================
// Diseñado según la metodología de la skill `enneagram-expert`:
//   • Apunta a la MOTIVACIÓN y el MIEDO central (el "por qué"),
//     no a la conducta superficial.
//   • Las preguntas más diagnósticas (motivación, miedo, deseo)
//     pesan más en el cálculo.
//   • La pregunta de miedo central (id 2) se usa para desempatar.
// Las preguntas se pueden reemplazar/combinar con el Excel del cliente.
// ============================================================

export interface QuestionOption {
    text: string;
    type: number; // eneatipo (1-9) al que suma esta opción
}

export interface Question {
    id: number;
    text: string;
    weight: number;        // peso diagnóstico de la pregunta
    isCoreFear?: boolean;  // pregunta de miedo central (desempate)
    options: QuestionOption[];
}

export const QUESTIONNAIRE: Question[] = [
    {
        id: 1,
        text: 'En el trabajo, lo que más me mueve por dentro es…',
        weight: 1.5,
        options: [
            { text: 'Hacer las cosas bien y con integridad', type: 1 },
            { text: 'Ayudar y ser un apoyo para los demás', type: 2 },
            { text: 'Lograr objetivos y destacarme', type: 3 },
            { text: 'Hacer algo auténtico y con sentido propio', type: 4 },
            { text: 'Entender a fondo cómo funcionan las cosas', type: 5 },
            { text: 'Tener seguridad y un equipo confiable', type: 6 },
            { text: 'Vivir variedad y experiencias estimulantes', type: 7 },
            { text: 'Tener el control y decidir mi rumbo', type: 8 },
            { text: 'Que haya armonía y todo fluya en calma', type: 9 },
        ],
    },
    {
        id: 2,
        text: 'En el fondo, lo que más me incomoda o temo es…',
        weight: 1.6,
        isCoreFear: true,
        options: [
            { text: 'Equivocarme o que algo esté mal hecho', type: 1 },
            { text: 'Que no me valoren o sentirme poco querido/a', type: 2 },
            { text: 'Fracasar o que me vean sin logros', type: 3 },
            { text: 'Ser uno/a más, sin nada que me distinga', type: 4 },
            { text: 'Que me invadan o quedarme sin recursos/energía', type: 5 },
            { text: 'Quedarme sin respaldo o no saber en quién confiar', type: 6 },
            { text: 'Quedar atrapado/a en algo aburrido o doloroso', type: 7 },
            { text: 'Que me controlen o pasen por encima', type: 8 },
            { text: 'El conflicto y que se rompa la armonía', type: 9 },
        ],
    },
    {
        id: 3,
        text: 'Me sentiría profundamente bien si…',
        weight: 1.4,
        options: [
            { text: 'Todo estuviera bien hecho y en orden', type: 1 },
            { text: 'La gente me quisiera y me sintiera útil', type: 2 },
            { text: 'Alcanzara el éxito y me lo reconocieran', type: 3 },
            { text: 'Pudiera expresar quién soy de verdad', type: 4 },
            { text: 'Dominara un tema y fuera autosuficiente', type: 5 },
            { text: 'Me sintiera seguro/a y respaldado/a', type: 6 },
            { text: 'Tuviera libertad y muchas opciones por delante', type: 7 },
            { text: 'Tuviera el control de mi vida y mi trabajo', type: 8 },
            { text: 'Reinara la paz y nadie estuviera en tensión', type: 9 },
        ],
    },
    {
        id: 4,
        text: 'Ante un conflicto en el equipo, tiendo a…',
        weight: 1.1,
        options: [
            { text: 'Buscar la solución justa y correcta', type: 1 },
            { text: 'Mediar y atender cómo está cada uno', type: 2 },
            { text: 'Resolverlo rápido para seguir avanzando', type: 3 },
            { text: 'Conectar con lo que se siente en el fondo', type: 4 },
            { text: 'Observar y analizar antes de meterme', type: 5 },
            { text: 'Buscar apoyo o consejo de alguien de confianza', type: 6 },
            { text: 'Bajar la tensión y buscar el lado positivo', type: 7 },
            { text: 'Enfrentarlo de frente, sin rodeos', type: 8 },
            { text: 'Evitarlo y mantener la calma', type: 9 },
        ],
    },
    {
        id: 5,
        text: 'Cuando estoy sobrepasado/a, me vuelvo…',
        weight: 1.1,
        options: [
            { text: 'Más crítico/a, perfeccionista y tenso/a', type: 1 },
            { text: 'Más demandante; me sobre-involucro en los demás', type: 2 },
            { text: 'Me apago, postergo y me desconecto', type: 3 },
            { text: 'Más melancólico/a; me siento incomprendido/a', type: 4 },
            { text: 'Me aíslo y me disperso mentalmente', type: 5 },
            { text: 'Más ansioso/a; dudo y reacciono', type: 6 },
            { text: 'Más irritable y se me va la paciencia', type: 7 },
            { text: 'Más desconfiado/a; me cierro y me alejo', type: 8 },
            { text: 'Más inquieto/a, ansioso/a e indeciso/a', type: 9 },
        ],
    },
    {
        id: 6,
        text: 'Mi forma de trabajar se describe mejor como…',
        weight: 1.0,
        options: [
            { text: 'Prolija, ordenada y con altos estándares', type: 1 },
            { text: 'Atenta a las personas y al clima del equipo', type: 2 },
            { text: 'Eficiente y enfocada en resultados', type: 3 },
            { text: 'Creativa y con un sello personal', type: 4 },
            { text: 'Analítica, independiente y experta', type: 5 },
            { text: 'Responsable, precavida y confiable', type: 6 },
            { text: 'Enérgica, versátil y llena de ideas', type: 7 },
            { text: 'Decidida, directa y de tomar la iniciativa', type: 8 },
            { text: 'Colaborativa, tranquila e integradora', type: 9 },
        ],
    },
    {
        id: 7,
        text: 'Con mis compañeros suelo…',
        weight: 1.0,
        options: [
            { text: 'Marcar lo que se puede mejorar', type: 1 },
            { text: 'Estar atento/a a lo que necesitan y ayudar', type: 2 },
            { text: 'Mostrar lo que logramos y motivar al equipo', type: 3 },
            { text: 'Compartir lo que siento y buscar autenticidad', type: 4 },
            { text: 'Guardar mi espacio y aportar cuando suma', type: 5 },
            { text: 'Ser leal y construir confianza mutua', type: 6 },
            { text: 'Traer energía, humor y planes nuevos', type: 7 },
            { text: 'Proteger al equipo y bancar a los míos', type: 8 },
            { text: 'Llevarme bien con todos y evitar fricciones', type: 9 },
        ],
    },
    {
        id: 8,
        text: 'Lo que más me llena es que me reconozcan por…',
        weight: 1.1,
        options: [
            { text: 'Mi integridad y hacer bien las cosas', type: 1 },
            { text: 'Mi generosidad y lo que aporto a los demás', type: 2 },
            { text: 'Mis logros y mi desempeño', type: 3 },
            { text: 'Mi autenticidad y mi mirada única', type: 4 },
            { text: 'Mi conocimiento y mi capacidad', type: 5 },
            { text: 'Mi compromiso y mi lealtad', type: 6 },
            { text: 'Mi entusiasmo y mis ideas', type: 7 },
            { text: 'Mi fuerza y mi capacidad de liderar', type: 8 },
            { text: 'Mi calma y mi don de unir a la gente', type: 9 },
        ],
    },
    {
        id: 9,
        text: 'Antes de tomar una decisión, yo…',
        weight: 1.0,
        options: [
            { text: 'Evalúo qué es lo correcto', type: 1 },
            { text: 'Pienso en cómo afecta a las personas', type: 2 },
            { text: 'Voy por lo más eficaz para el resultado', type: 3 },
            { text: 'Escucho mi intuición y mis valores', type: 4 },
            { text: 'Investigo y junto toda la información', type: 5 },
            { text: 'Busco opiniones y posibles riesgos', type: 6 },
            { text: 'Imagino las distintas posibilidades', type: 7 },
            { text: 'Decido rápido y tomo el control', type: 8 },
            { text: 'Trato de que conforme a todos', type: 9 },
        ],
    },
    {
        id: 10,
        text: 'Frente a algo nuevo o incierto, lo primero que hago es…',
        weight: 1.2,
        options: [
            { text: 'Ver cómo hacerlo bien desde el principio', type: 1 },
            { text: 'Ver a quién puedo ayudar o con quién contar', type: 2 },
            { text: 'Pensar cómo destacar y salir airoso/a', type: 3 },
            { text: 'Registrar qué me hace sentir', type: 4 },
            { text: 'Estudiarlo y entenderlo antes de actuar', type: 5 },
            { text: 'Anticipar qué puede salir mal y prepararme', type: 6 },
            { text: 'Entusiasmarme con las posibilidades', type: 7 },
            { text: 'Tomar las riendas y avanzar', type: 8 },
            { text: 'Esperar a que se acomode y mantener la calma', type: 9 },
        ],
    },
];
