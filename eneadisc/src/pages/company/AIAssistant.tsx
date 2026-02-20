import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getTeams } from '../../utils/teams';
import { calculateCompanyAnalytics, getDateRange } from '../../utils/analytics';
import { generateAnalyticsContext } from '../../utils/aiContext';
import { sendToAI } from '../../services/aiService';
import { MessageBubble } from '../../components/ai/MessageBubble';
import { SuggestedPrompts } from '../../components/ai/SuggestedPrompts';
import type { Message } from '../../types/ai';
import { SUGGESTED_PROMPTS } from '../../types/ai';

export const AIAssistant: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Welcome message

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: '0',
                role: 'assistant',
                content: `¡Hola! 👋 Soy tu **Asistente de IA** para análisis de equipos.

Puedo ayudarte con:

📊 **Resúmenes automáticos** de estado de equipos
🔮 **Predicciones** basadas en tendencias actuales
💡 **Recomendaciones** accionables para mejorar productividad
⚠️ **Alertas tempranas** de posibles problemas

**¿En qué te puedo ayudar hoy?**`,
                timestamp: new Date(),
                recommendations: []
            }]);
        }
    }, []);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        setError(null);
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setShowSuggestions(false); // Ocultar sugerencias al enviar
        setIsLoading(true);

        // Add loading message
        const loadingMessage: Message = {
            id: `${Date.now()}-loading`,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isLoading: true
        };
        setMessages(prev => [...prev, loadingMessage]);

        try {
            // Generate context from analytics
            const context = await generateContext();

            // Send to AI service
            const response = await sendToAI({
                message: text,
                context,
                userId: user?.id || 'anonymous',
                companyId: user?.companyId || 'demo',
                conversationHistory: messages.slice(-5) // Last 5 messages for context
            });

            // Remove loading message and add AI response
            setMessages(prev => {
                const withoutLoading = prev.filter(m => !m.isLoading);
                const aiMessage: Message = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: response.answer,
                    timestamp: new Date(),
                    recommendations: response.recommendations
                };
                return [...withoutLoading, aiMessage];
            });
        } catch (err) {
            console.error('Error sending message:', err);
            setError('No se pudo conectar con el asistente. Por favor, intenta de nuevo.');

            // Remove loading message
            setMessages(prev => prev.filter(m => !m.isLoading));
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const generateContext = async (): Promise<string> => {
        if (!user?.companyId) return 'No hay datos disponibles';

        try {
            const teams = getTeams(user.companyId);
            const teamsData = teams.map(team => ({
                id: team.id,
                name: team.name,
                memberCount: team.memberIds.length
            }));

            if (teamsData.length === 0) {
                return 'La empresa aún no tiene equipos creados';
            }

            const dateRange = getDateRange('month');
            const analytics = calculateCompanyAnalytics(teamsData, dateRange);

            return generateAnalyticsContext(analytics);
        } catch (error) {
            console.error('Error generating context:', error);
            return 'Error al obtener datos analíticos';
        }
    };

    const handleSuggestedPrompt = (text: string) => {
        setInput(text);
        setShowSuggestions(false); // Cerrar sugerencias al seleccionar
        inputRef.current?.focus();
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        sendMessage(input);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-8">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                            <Bot className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl font-bold text-slate-900">Asistente de IA</h1>
                                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                    Beta
                                </span>
                            </div>
                            <p className="text-slate-600 mt-1">
                                Análisis inteligente powered by AI
                            </p>
                        </div>
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm font-medium text-green-700">
                                {isLoading ? 'Procesando...' : 'En línea'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Chat Container */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col relative" style={{ height: 'calc(100vh - 220px)', minHeight: '400px' }}>
                    {/* Suggested Prompts - Collapsible */}
                    {showSuggestions && (
                        <div className="p-4 border-b border-slate-200 bg-slate-50">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    <h3 className="text-sm font-semibold text-slate-700">Sugerencias rápidas</h3>
                                </div>
                                <button
                                    onClick={() => setShowSuggestions(false)}
                                    className="text-slate-400 hover:text-slate-600 transition-colors"
                                    title="Ocultar sugerencias"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <SuggestedPrompts
                                prompts={SUGGESTED_PROMPTS}
                                onSelectPrompt={handleSuggestedPrompt}
                                disabled={isLoading}
                            />
                        </div>
                    )}

                    {/* Show suggestions button - Floating */}
                    {!showSuggestions && messages.length > 0 && (
                        <div className="absolute top-2 right-2 z-10">
                            <button
                                onClick={() => setShowSuggestions(true)}
                                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-purple-600 bg-white/90 backdrop-blur border border-purple-200 shadow-sm hover:shadow hover:bg-white rounded-full transition-all"
                            >
                                <Sparkles className="w-3 h-3" />
                                <span>Sugerencias</span>
                            </button>
                        </div>
                    )}

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 relative">
                        {messages.map(message => (
                            <MessageBubble key={message.id} message={message} />
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Error Banner */}
                    {error && (
                        <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-800 flex-1">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="text-red-600 hover:text-red-700"
                            >
                                ✕
                            </button>
                        </div>
                    )}

                    {/* Input Section */}
                    <div className="border-t border-slate-200 p-4 bg-white">
                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Escribe tu pregunta aquí... (Shift+Enter para nueva línea)"
                                disabled={isLoading}
                                rows={1}
                                className="
                                    flex-1 px-4 py-3 rounded-lg
                                    border border-slate-300
                                    focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    resize-none
                                "
                                style={{ minHeight: '48px', maxHeight: '120px' }}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="
                                    px-6 py-3 bg-gradient-to-br from-purple-500 to-pink-500
                                    text-white rounded-lg font-medium
                                    hover:from-purple-600 hover:to-pink-600
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                    transition-all duration-200
                                    flex items-center gap-2
                                "
                            >
                                {isLoading ? (
                                    <>
                                        <Sparkles className="w-5 h-5 animate-spin" />
                                        <span className="hidden sm:inline">Procesando</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        <span className="hidden sm:inline">Enviar</span>
                                    </>
                                )}
                            </button>
                        </form>
                        <p className="text-xs text-slate-500 mt-2 text-center">
                            El asistente usa datos de Analytics para generar respuestas personalizadas
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
