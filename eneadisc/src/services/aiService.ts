import type { AIRequest, AIResponse } from '../types/ai';

/**
 * Send message to Claude AI via Vercel Serverless Function.
 * NO silent fallback — if Claude fails, the user sees the real error.
 */
export async function sendToAI(request: AIRequest): Promise<AIResponse> {
    // Abort after 25 seconds
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
                message: request.message,
                context: request.context,
                conversationHistory: (request.conversationHistory || [])
                    .filter((m: { role: string }) => m.role === 'user' || m.role === 'assistant')
                    .map((m: { role: string; content: string }) => ({ role: m.role, content: m.content }))
            })
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
            const errorMsg = errorData.error || `Error del servidor: ${response.status}`;
            console.error('Claude API error:', response.status, errorData);
            throw new Error(errorMsg);
        }

        const data: AIResponse = await response.json();

        // Verify we got a real answer
        if (!data.answer || data.answer.trim() === '') {
            throw new Error('Claude no generó una respuesta. Intentá de nuevo.');
        }

        return data;
    } catch (error) {
        clearTimeout(timeoutId);

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error('La respuesta tardó demasiado (>25s). Intentá con una pregunta más corta.');
        }

        if (error instanceof Error) {
            throw error;
        }

        throw new Error('No se pudo conectar con el asistente de IA.');
    }
}
