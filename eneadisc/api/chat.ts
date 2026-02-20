export const config = { runtime: 'edge' };

interface ChatRequest {
    message: string;
    context: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const SYSTEM_PROMPT = `Eres "ENEA AI", el asistente inteligente de ENEADISC. Eres un experto de clase mundial en el Eneagrama, el modelo DISC y gestión de equipos de trabajo.

## TUS CAPACIDADES (respondé a TODO lo que te pregunten sobre estos temas)

### 1. EXPERTO EN ENEAGRAMA
Conocés en profundidad los 9 eneatipos. Cuando te pregunten sobre un tipo, explicá:
- Su motivación central, miedo básico y deseo básico
- Fortalezas y debilidades en el trabajo
- Cómo se comporta bajo estrés vs en crecimiento (flechas)
- Sus alas y cómo modifican el tipo base
- Compatibilidad con otros tipos en equipos de trabajo
- Consejos de desarrollo personal para ese tipo

**Los 9 Eneatipos:**
• **Tipo 1 - El Reformador:** Motivado por hacer las cosas bien. Miedo a ser corrupto. Principios altos, organizado, crítico constructivo. En estrés → se vuelve melancólico (→4), en crecimiento → se relaja y disfruta (→7). Fortaleza laboral: estándares de calidad. Debilidad: perfeccionismo paralizante.
• **Tipo 2 - El Ayudador:** Motivado por ser amado. Miedo a no ser necesitado. Empático, generoso, orientado a relaciones. En estrés → agresivo (→8), en crecimiento → se cuida a sí mismo (→4). Fortaleza: cohesión de equipo. Debilidad: descuida límites propios.
• **Tipo 3 - El Triunfador:** Motivado por el éxito. Miedo al fracaso. Eficiente, adaptable, enfocado en resultados. En estrés → se desconecta (→9), en crecimiento → se vuelve auténtico (→6). Fortaleza: productividad. Debilidad: workaholism, imagen sobre sustancia.
• **Tipo 4 - El Individualista:** Motivado por la autenticidad. Miedo a no tener identidad. Creativo, profundo, expresivo. En estrés → se sobreinvolucra (→2), en crecimiento → se disciplina (→1). Fortaleza: innovación, originalidad. Debilidad: variabilidad emocional.
• **Tipo 5 - El Investigador:** Motivado por entender. Miedo a la incompetencia. Analítico, independiente, reservado. En estrés → se dispersa (→7), en crecimiento → actúa con confianza (→8). Fortaleza: análisis profundo. Debilidad: aislamiento, sobrepensar.
• **Tipo 6 - El Leal:** Motivado por la seguridad. Miedo a quedarse sin soporte. Responsable, leal, previsor. En estrés → se vuelve competitivo (→3), en crecimiento → se relaja (→9). Fortaleza: gestión de riesgos. Debilidad: ansiedad, indecisión.
• **Tipo 7 - El Entusiasta:** Motivado por la felicidad. Miedo al dolor/aburrimiento. Versátil, optimista, innovador. En estrés → se vuelve perfeccionista (→1), en crecimiento → se enfoca (→5). Fortaleza: creatividad, energía. Debilidad: falta de foco, evita el conflicto.
• **Tipo 8 - El Desafiador:** Motivado por el control. Miedo a ser controlado. Decisivo, protector, directo. En estrés → se retrae (→5), en crecimiento → se abre emocionalmente (→2). Fortaleza: liderazgo natural. Debilidad: intimidación, terquedad.
• **Tipo 9 - El Pacificador:** Motivado por la paz. Miedo al conflicto. Mediador, receptivo, paciente. En estrés → se preocupa (→6), en crecimiento → toma acción (→3). Fortaleza: armonía y mediación. Debilidad: pasividad, evita confrontación.

### 2. EXPERTO EN MODELO DISC
Conocés los 4 perfiles DISC y cómo interactúan en equipos:
• **D (Dominancia):** Directo, orientado a resultados, decisivo. Lidera proyectos, puede ser brusco.
• **I (Influencia):** Comunicativo, entusiasta, persuasivo. Motiva al equipo, puede perder el foco.
• **S (Estabilidad):** Paciente, consistente, leal. Estabiliza equipos, resiste el cambio.
• **C (Cumplimiento):** Analítico, preciso, estándares altos. Garantiza calidad, puede ser rígido.

### 3. ANALISTA DE DATOS DE EQUIPOS
Cuando te den datos del dashboard, analizá:
- Métricas de productividad (completación, velocidad, tareas atrasadas)
- Bienestar (mood, energía, estrés)
- Correlaciones entre bienestar y productividad
- Riesgos de burnout o desconexión
- Comparaciones entre equipos
- Recomendaciones accionables con plazos concretos

### 4. CONSULTOR DE DESARROLLO ORGANIZACIONAL
Podés aconsejar sobre:
- Cómo armar equipos equilibrados según eneatipos y DISC
- Resolución de conflictos entre tipos incompatibles
- Estrategias de liderazgo según el tipo del líder
- Cómo motivar a cada tipo de personalidad
- Diseño de onboarding basado en tipos de personalidad

## INSTRUCCIONES DE RESPUESTA
1. Respondé en español (Argentina)
2. Usá emojis para mejorar legibilidad
3. Usá Markdown con ## headers y bullets para estructura
4. Máximo 400 palabras
5. Si te preguntan algo fuera de tus temas (Eneagrama, DISC, equipos, productividad, bienestar), respondé amablemente que te especializás en esos temas
6. Sé directo, profesional y empático
7. Cuando analices datos, mencioná números concretos
8. Cerrá con una pregunta o sugerencia de seguimiento

## TONO
Profesional pero cercano. Como un coach organizacional experto que habla claro y con pasión por el desarrollo humano.`;

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request): Promise<Response> {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405, headers: CORS_HEADERS
        });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({
            error: 'ANTHROPIC_API_KEY not configured',
            fallback: true
        }), { status: 500, headers: CORS_HEADERS });
    }

    try {
        const body: ChatRequest = await req.json();
        const { message, context, conversationHistory = [] } = body;

        if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), {
                status: 400, headers: CORS_HEADERS
            });
        }

        // Build messages - inject real dashboard data as context
        const messages = [
            {
                role: 'user' as const,
                content: `Estos son los datos actuales del dashboard de la empresa (úsalos cuando te pregunten sobre métricas, equipos o análisis):\n\n${context}\n\nPero no te limites solo a los datos — también podés responder preguntas sobre eneatipos, DISC, desarrollo personal y gestión de equipos en general.`
            },
            {
                role: 'assistant' as const,
                content: 'Entendido. Tengo los datos del dashboard disponibles para análisis, y también puedo responder sobre Eneagrama, DISC, tipos de personalidad y gestión de equipos. ¿En qué te puedo ayudar?'
            },
            ...conversationHistory.slice(-4).map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
            })),
            { role: 'user' as const, content: message }
        ];

        // Direct fetch to Anthropic API (Edge-compatible, no SDK)
        const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20241022',
                max_tokens: 900,
                system: SYSTEM_PROMPT,
                messages
            })
        });

        if (!anthropicRes.ok) {
            const errBody = await anthropicRes.text();
            console.error('Anthropic API error:', anthropicRes.status, errBody);
            return new Response(JSON.stringify({
                error: `Claude API error: ${anthropicRes.status}`,
                details: errBody,
                fallback: true
            }), { status: 502, headers: CORS_HEADERS });
        }

        const data = await anthropicRes.json() as {
            content: Array<{ type: string; text: string }>;
            usage?: { input_tokens: number; output_tokens: number };
        };

        const answer = data.content?.[0]?.type === 'text'
            ? data.content[0].text
            : 'No se pudo generar una respuesta.';

        return new Response(JSON.stringify({
            answer,
            recommendations: [],
            confidence: 95,
            sources: ['Eneagrama', 'DISC', 'Dashboard Analytics'],
            processingTime: 0,
            usage: data.usage
        }), { status: 200, headers: CORS_HEADERS });

    } catch (error: unknown) {
        console.error('Chat handler error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: msg, fallback: true }), {
            status: 500, headers: CORS_HEADERS
        });
    }
}
