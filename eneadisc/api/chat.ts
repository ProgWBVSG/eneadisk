export const config = { runtime: 'edge' };

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
1. Basate SIEMPRE en los datos reales del dashboard que se te proporcionan
2. Usa emojis estratégicamente para mejorar la legibilidad
3. Sé específico: menciona nombres de equipos, porcentajes concretos, números reales
4. Proporciona recomendaciones accionables
5. Limita tus respuestas a 250-350 palabras máximo
6. Usa formato Markdown con headers (##) y bullets (•)
7. Cierra con una pregunta para continuar el análisis

TONO: Profesional pero accesible. Orientado a la acción.`;

const CORS_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req: Request): Promise<Response> {
    // Handle CORS preflight
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
        return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY not configured' }), {
            status: 500, headers: CORS_HEADERS
        });
    }

    try {
        const body: ChatRequest = await req.json();
        const { message, context, conversationHistory = [] } = body;

        if (!message) {
            return new Response(JSON.stringify({ error: 'Message is required' }), {
                status: 400, headers: CORS_HEADERS
            });
        }

        // Build messages for Claude
        const messages = [
            {
                role: 'user',
                content: `Datos actuales del dashboard:\n\n${context}`
            },
            {
                role: 'assistant',
                content: 'Datos del dashboard procesados. Listo para analizar.'
            },
            ...conversationHistory.slice(-4),
            { role: 'user', content: message }
        ];

        // Call Anthropic API directly via fetch (Edge-compatible, no SDK needed)
        const anthropicResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307', // Fastest model, lowest latency
                max_tokens: 700,
                system: SYSTEM_PROMPT,
                messages
            })
        });

        if (!anthropicResponse.ok) {
            const errText = await anthropicResponse.text();
            console.error('Anthropic API error:', anthropicResponse.status, errText);
            return new Response(JSON.stringify({ error: `Anthropic error: ${anthropicResponse.status}` }), {
                status: 502, headers: CORS_HEADERS
            });
        }

        const data = await anthropicResponse.json() as {
            content: Array<{ type: string; text: string }>;
        };

        const answer = data.content?.[0]?.type === 'text' ? data.content[0].text : 'Sin respuesta';

        return new Response(JSON.stringify({
            answer,
            recommendations: [],
            confidence: 95,
            sources: ['Dashboard Analytics', 'Team Check-ins', 'Task Data'],
            processingTime: 0
        }), { status: 200, headers: CORS_HEADERS });

    } catch (error: unknown) {
        console.error('Chat handler error:', error);
        const msg = error instanceof Error ? error.message : 'Unknown error';
        return new Response(JSON.stringify({ error: msg }), {
            status: 500, headers: CORS_HEADERS
        });
    }
}
