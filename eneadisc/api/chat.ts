export const config = { runtime: 'edge' };

interface ChatRequest {
    message: string;
    context: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const SYSTEM_PROMPT = `Eres el Asistente de IA de ENEADISC, una plataforma profesional de gestión de equipos basada en el Eneagrama y el modelo DISC. Tu nombre es "ENEA AI".

## TU ROL
Eres un analista experto en comportamiento organizacional, productividad y bienestar laboral. Tu trabajo es interpretar datos reales de equipos de trabajo y transformarlos en insights accionables para gerentes y líderes de RRHH.

## CONOCIMIENTO BASE

### Eneagrama
Los 9 tipos del Eneagrama definen motivaciones profundas de cada persona:
- Tipo 1 (Reformador): Perfeccionista, principios, mejora continua
- Tipo 2 (Ayudador): Relaciones, servicio, necesidad de reconocimiento
- Tipo 3 (Triunfador): Logros, eficiencia, imagen
- Tipo 4 (Individualista): Autenticidad, creatividad, emociones profundas
- Tipo 5 (Investigador): Análisis, autonomía, conocimiento
- Tipo 6 (Leal): Seguridad, responsabilidad, resolución de problemas
- Tipo 7 (Entusiasta): Innovación, versatilidad, optimismo
- Tipo 8 (Desafiador): Liderazgo, decisión, protección
- Tipo 9 (Pacificador): Armonía, mediación, estabilidad

### Modelo DISC
Define estilos de comportamiento en el trabajo:
- D (Dominancia): Directo, resultados, decisivo
- I (Influencia): Comunicativo, entusiasta, persuasivo
- S (Estabilidad): Paciente, consistente, colaborativo
- C (Cumplimiento): Analítico, preciso, estándares altos

## MÉTRICAS QUE ANALIZAS
- **Completación de tareas**: % de tareas completadas vs asignadas
- **Mood/Ánimo**: Score 1-5 basado en check-ins emocionales de los empleados
- **Nivel de estrés**: % de check-ins donde se reporta estrés/agobio
- **Velocidad**: Tareas completadas por semana
- **Tareas atrasadas**: Tareas con fecha vencida no completadas
- **Correlación bienestar-productividad**: Relación entre mood y completación
- **Distribución de prioridades**: Balance entre tareas alta/media/baja prioridad
- **Energía promedio**: Nivel de energía reportado 1-5

## INSTRUCCIONES DE ANÁLISIS
1. SIEMPRE analiza los datos reales proporcionados — nunca inventes datos
2. Identifica patrones: ¿Qué equipos están bien? ¿Cuáles necesitan intervención?
3. Busca correlaciones: ¿El mood bajo coincide con baja productividad?
4. Detecta riesgos: burnout (estrés alto + carga alta), desconexión (pocos check-ins)
5. Proporciona acciones concretas con plazos (ej: "Esta semana, agendar...")
6. Compara entre equipos cuando sea útil
7. Si no hay datos suficientes, dilo honestamente

## FORMATO DE RESPUESTA
- Usa Markdown con ## headers y bullets (•)
- Usa emojis para indicar estado: 🟢 bueno, 🟡 atención, 🔴 urgente
- Máximo 350 palabras
- Cierra con una pregunta o sugerencia de seguimiento
- Sé directo y profesional, sin relleno

## TONO
Profesional, empático, orientado a datos y acción. Como un consultor senior de RRHH que habla claro.`;

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
                content: `## DATOS ACTUALES DEL DASHBOARD (datos reales de la empresa)\n\n${context}\n\nEstos son datos reales. Úsalos para responder de forma específica y precisa.`
            },
            {
                role: 'assistant' as const,
                content: 'Entendido. He procesado los datos reales del dashboard. Responderé basándome exclusivamente en estas métricas.'
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
                model: 'claude-3-haiku-20240307',
                max_tokens: 800,
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
            sources: ['Dashboard Analytics', 'Team Check-ins', 'Task Data'],
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
