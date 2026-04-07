import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, AlertCircle, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getCheckInsFromLastDays } from '../../utils/checkIns';
import { getTaskStats } from '../../utils/tasks';
import { sendToAI } from '../../services/aiService';
import { MessageBubble } from '../../components/ai/MessageBubble';
import { SuggestedPrompts } from '../../components/ai/SuggestedPrompts';
import { getEnneagramResult } from '../../utils/calculateEnneagram';
import { ENNEAGRAM_TYPES } from '../../data/enneagramData';
import type { Message, SuggestedPrompt } from '../../types/ai';

const EMPLOYEE_PROMPTS: SuggestedPrompt[] = [
    {
        title: "Analizar mi Eneatipo",
        description: "¿Cómo mi personalidad afecta mi forma de trabajar?",
        prompt: "Dime cómo mi Eneatipo principal influye en mi productividad y cuáles áreas debería cuidar.",
        category: "growth"
    },
    {
        title: "Manejar estrés laboral",
        description: "Consejos para descompresión emocional",
        prompt: "Siento estrés últimamente por la carga de tareas. Dame tácticas específicas para mi eneatipo para evitar el burnout.",
        category: "team"
    },
    {
        title: "Mejorar comunicación",
        description: "Aprende a comunicarte mejor con tu equipo",
        prompt: "¿Cómo puedo comunicar mejor mis ideas en el equipo y evitar malentendidos?",
        category: "management"
    }
];

export const EmployeeAssistant: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const enneagramResult = user ? getEnneagramResult(user.id) : null;
    const primaryType = enneagramResult ? ENNEAGRAM_TYPES[enneagramResult.primaryType] : null;

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: '0',
                role: 'assistant',
                content: `¡Hola, ${user?.name?.split(' ')[0] || 'alli'}! 👋 Soy tu **Asistente Experto en Desarrollo Personal**.
${primaryType ? `\nVeo que tienes un perfil con predominancia **Eneatipo ${primaryType.id} (${primaryType.name})**.` : ''}

Estoy aquí para ayudarte a:

🎯 **Mejorar tu productividad** según tu forma de ser.
🧘‍♀️ **Gestionar emociones** como la frustración o el estrés.
🤝 **Mejorar tu comunicación** y relación con tu equipo.

**¿Qué te gustaría charlar hoy?**`,
                timestamp: new Date(),
                recommendations: []
            }]);
        }
    }, [user, primaryType]);

    const generateContext = (): string => {
        if (!user) return 'No user info';
        
        let ctx = `User Enneagram Profile: ${primaryType ? `Type ${primaryType.id} - ${primaryType.name}` : 'Unknown'}. `;
        
        // Include last week's mood
        const recentCheckins = getCheckInsFromLastDays(user.id, 7);
        if (recentCheckins.length > 0) {
            const avgStress = recentCheckins.reduce((sum, c) => sum + c.stress, 0) / recentCheckins.length;
            ctx += `Recent check-ins average stress level: ${avgStress.toFixed(1)}/5. `;
        }
        
        // Include task completion
        const tasks = getTaskStats(user.id);
        if (tasks) {
            ctx += `Tasks status: ${tasks.completed} completed, ${tasks.pending} pending.`;
        }

        return ctx;
    };

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
        setShowSuggestions(false);
        setIsLoading(true);

        const loadingMessage: Message = {
            id: `${Date.now()}-loading`,
            role: 'assistant',
            content: '',
            timestamp: new Date(),
            isLoading: true
        };
        setMessages(prev => [...prev, loadingMessage]);

        try {
            const context = generateContext();

            const response = await sendToAI({
                message: text + " \\n\\nPor favor responde como si fueras un coach de vida y carrera compasivo, y bríndame consejos si es necesario.",
                context,
                userId: user?.id || 'employee-demo',
                companyId: user?.companyId || 'demo',
                conversationHistory: messages.slice(-5)
            });

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
            console.error('Error in chat:', err);
            setError('La inteligencia artificial está tomando un respiro. Inténtalo otra vez más tarde.');
            setMessages(prev => prev.filter(m => !m.isLoading));
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    const handleSuggestedPrompt = (text: string) => {
        setInput(text);
        setShowSuggestions(false);
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
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 120px)', minHeight: '500px' }}>
                    {/* Header */}
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white flex items-center justify-between shadow-md z-10 relative">
                        <div className="flex items-center gap-4">
                            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm border border-white/20">
                                <Bot className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold tracking-tight">Tu Coach Personal IA</h1>
                                <p className="text-indigo-100 text-sm mt-0.5">Asesoramiento impulsado por tu Eneatipo</p>
                            </div>
                        </div>
                    </div>

                    {/* Chat Area */}
                    <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 bg-slate-50/50 space-y-6 relative">
                        {showSuggestions && messages.length <= 1 && (
                            <div className="mb-6 fade-in">
                                <div className="flex items-center gap-2 mb-3 px-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-semibold text-slate-700">Para empezar:</span>
                                </div>
                                <SuggestedPrompts
                                    prompts={EMPLOYEE_PROMPTS}
                                    onSelectPrompt={handleSuggestedPrompt}
                                    disabled={isLoading}
                                />
                            </div>
                        )}
                        
                        {messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))}

                        <div ref={messagesEndRef} />
                    </div>

                    {error && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-6 my-2 text-sm text-red-700 flex items-center gap-2 rounded-r-lg">
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-slate-100">
                        <form onSubmit={handleSubmit} className="relative">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                placeholder="Pídele consejo a tu coach sobre tus interacciones o motivación..."
                                className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 pr-14 focus:ring-2 focus:ring-purple-500 focus:outline-none resize-none hide-scrollbar transition-all"
                                rows={Math.max(1, Math.min(4, input.split('\\n').length))}
                                style={{ maxHeight: '120px' }}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 bottom-2 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50 disabled:bg-slate-300 transition-colors"
                            >
                                {isLoading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
