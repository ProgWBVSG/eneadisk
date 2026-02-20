// AI Assistant Types and Interfaces

export interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    recommendations?: Recommendation[];
    isLoading?: boolean;
}

export interface Recommendation {
    type: 'warning' | 'suggestion' | 'insight' | 'action';
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    icon?: string;
}

export interface AIRequest {
    message: string;
    context: string;
    userId: string;
    companyId: string;
    conversationHistory?: Message[];
}

export interface AIResponse {
    answer: string;
    recommendations: Recommendation[];
    confidence: number;
    sources?: string[];
    processingTime?: number;
}

export interface SuggestedPrompt {
    id: string;
    text: string;
    icon: string;
    category: 'summary' | 'analysis' | 'prediction' | 'help';
}

export const SUGGESTED_PROMPTS: SuggestedPrompt[] = [
    {
        id: '1',
        text: 'Dame un resumen del estado actual de los equipos',
        icon: '📊',
        category: 'summary'
    },
    {
        id: '2',
        text: '¿Qué equipos necesitan atención inmediata?',
        icon: '⚠️',
        category: 'analysis'
    },
    {
        id: '3',
        text: 'Predicciones para la próxima semana',
        icon: '🔮',
        category: 'prediction'
    },
    {
        id: '4',
        text: 'Analiza las tendencias de productividad',
        icon: '📈',
        category: 'analysis'
    },
    {
        id: '5',
        text: '¿Cómo puedo mejorar el mood del equipo?',
        icon: '💡',
        category: 'help'
    },
    {
        id: '6',
        text: 'Identifica riesgos de burnout',
        icon: '🔥',
        category: 'prediction'
    }
];
