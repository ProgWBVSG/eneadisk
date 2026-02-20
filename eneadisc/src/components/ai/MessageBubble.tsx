import React from 'react';
import { User, Bot, AlertCircle, Lightbulb, AlertTriangle, Zap } from 'lucide-react';
import type { Message, Recommendation } from '../../types/ai';
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
    message: Message;
}

const recommendationConfig = {
    warning: {
        icon: AlertTriangle,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-500',
        iconColor: 'text-orange-600',
        textColor: 'text-orange-900'
    },
    suggestion: {
        icon: Lightbulb,
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-500',
        iconColor: 'text-purple-600',
        textColor: 'text-purple-900'
    },
    insight: {
        icon: Zap,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-500',
        iconColor: 'text-blue-600',
        textColor: 'text-blue-900'
    },
    action: {
        icon: AlertCircle,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-500',
        iconColor: 'text-green-600',
        textColor: 'text-green-900'
    }
};

const priorityBadge = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-slate-100 text-slate-700'
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
    const isUser = message.role === 'user';

    if (message.isLoading) {
        return (
            <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                        <span className="text-sm text-slate-600">Analizando datos...</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex items-start gap-3 mb-6 ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`
                p-2 rounded-lg flex-shrink-0
                ${isUser
                    ? 'bg-gradient-to-br from-blue-500 to-cyan-500'
                    : 'bg-gradient-to-br from-purple-500 to-pink-500'
                }
            `}>
                {isUser ? (
                    <User className="w-5 h-5 text-white" />
                ) : (
                    <Bot className="w-5 h-5 text-white" />
                )}
            </div>

            {/* Message Content */}
            <div className={`
                flex-1 max-w-3xl
                ${isUser ? 'mr-auto' : 'ml-auto'}
            `}>
                <div className={`
                    rounded-lg p-4
                    ${isUser
                        ? 'bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200'
                        : 'bg-white border border-slate-200'
                    }
                `}>
                    <div className="prose prose-sm max-w-none">
                        {isUser ? (
                            <p className="text-slate-800 m-0">{message.content}</p>
                        ) : (
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="mb-3 last:mb-0 text-slate-700">{children}</p>,
                                    strong: ({ children }) => <strong className="font-semibold text-slate-900">{children}</strong>,
                                    ul: ({ children }) => <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="text-slate-700">{children}</li>,
                                    h3: ({ children }) => <h3 className="text-base font-bold text-slate-900 mb-2 mt-4 first:mt-0">{children}</h3>,
                                    code: ({ children }) => <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">{children}</code>
                                }}
                            >
                                {message.content}
                            </ReactMarkdown>
                        )}
                    </div>

                    <div className="text-xs text-slate-500 mt-2">
                        {new Date(message.timestamp).toLocaleTimeString('es', {
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>

                {/* Recommendations */}
                {!isUser && message.recommendations && message.recommendations.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {message.recommendations.map((rec: Recommendation, index: number) => {
                            const config = recommendationConfig[rec.type];
                            const RecIcon = config.icon;

                            return (
                                <div
                                    key={index}
                                    className={`
                                        p-3 rounded-lg border-l-4
                                        ${config.bgColor} ${config.borderColor}
                                    `}
                                >
                                    <div className="flex items-start gap-2">
                                        <RecIcon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${config.iconColor}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className={`font-semibold text-sm ${config.textColor}`}>
                                                    {rec.title}
                                                </h4>
                                                <span className={`
                                                    px-2 py-0.5 rounded-full text-xs font-medium
                                                    ${priorityBadge[rec.priority]}
                                                `}>
                                                    {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                                                </span>
                                            </div>
                                            <p className={`text-sm ${config.textColor} opacity-90`}>
                                                {rec.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
