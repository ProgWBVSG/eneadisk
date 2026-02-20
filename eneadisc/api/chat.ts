import Anthropic from '@anthropic-ai/sdk';

interface ChatRequest {
    message: string;
    context: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

const SYSTEM_PROMPT = `Eres el Asistente de IA de ENEADISC, una plataforma de gestión de equipos basada en el Eneagrama y el modelo DISC.

Tu rol es analizar datos reales de productividad y bienestar de equipos de trabajo, y proporcionar insights accionables, predicciones y recomendaciones concretas.

CONTEXTO DEL PRODUCTO:
- ENEADISC ayuda a empresas a gestionar equipos considerando los tipos de personalidad del Eneagrama (9 tipos) y perfiles DISC
- Los datos disponibles incluyen: check-ins emocionales (mood, energía, estrés), tareas (completación, prioridades, velocidad), y métricas de colaboración
- Los usuarios son gerentes/líderes de empresa que necesitan tomar decisiones basadas en datos

INSTRUCCIONES DE RESPUESTA:
1. Basate SIEMPRE en los datos reales del dashboard que se te proporcionan en cada mensaje
2. Usa emojis estratégicamente para mejorar la legibilidad
3. Sé específico: menciona nombres de equipos, porcentajes concretos, números reales
4. Proporciona recomendaciones accionables (qué hacer, cuándo, cómo)
5. Si los datos muestran algo preocupante, sé directo pero constructivo
6. Limita tus respuestas a 300-400 palabras máximo, priorizando claridad sobre extensión
7. Usa formato Markdown con headers (##) y bullets (•) para estructurar bien la respuesta
8. Cierra siempre con una pregunta o sugerencia para continuar el análisis

TONO: Profesional pero accesible. Orientado a la acción. Empático con los líderes de equipo.`;

export default async function handler(req: Request): Promise<Response> {
    // Only allow POST
    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    // Check API key
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
        return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body: ChatRequest = await req.json();
        const { message, context, conversationHistory = [] } = body;

        if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const client = new Anthropic({ apiKey });

        // Build messages array with conversation history
        const messages: Anthropic.MessageParam[] = [
            // Inject dashboard context as first user turn
            {
                role: 'user',
                content: `Aquí están los datos actuales del dashboard de tu empresa:\n\n${context}\n\nTen en cuenta estos datos para todas las respuestas de esta conversación.`
            },
            {
                role: 'assistant',
                content: 'Entendido. He procesado los datos del dashboard. Estoy listo para analizar y responder con información específica basada en estas métricas reales.'
            },
            // Add conversation history (last 6 turns max)
            ...conversationHistory.slice(-6).map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
            })),
            // Current user message
            { role: 'user', content: message }
        ];

        const response = await client.messages.create({
            model: 'claude-3-5-haiku-20241022', // Fast and cost-effective
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages
        });

        const answer = response.content[0].type === 'text' ? response.content[0].text : '';

        return new Response(JSON.stringify({
            answer,
            recommendations: [], // Claude's answer already contains recommendations inline
            confidence: 95,
            sources: ['Dashboard Analytics', 'Team Check-ins', 'Task Data'],
            processingTime: 0
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error: unknown) {
        console.error('Claude API error:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: `AI service error: ${message}` }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
