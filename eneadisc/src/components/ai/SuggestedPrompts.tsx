import React from 'react';
import { Sparkles } from 'lucide-react';
import type { SuggestedPrompt } from '../../types/ai';

interface SuggestedPromptsProps {
    prompts: SuggestedPrompt[];
    onSelectPrompt: (text: string) => void;
    disabled?: boolean;
}

const categoryColors = {
    summary: 'from-blue-500 to-cyan-500',
    analysis: 'from-purple-500 to-pink-500',
    prediction: 'from-orange-500 to-red-500',
    help: 'from-green-500 to-emerald-500'
};

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
    prompts,
    onSelectPrompt,
    disabled = false
}) => {
    return (
        <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-semibold text-slate-700">Sugerencias rápidas</h3>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                {prompts.map((prompt) => (
                    <button
                        key={prompt.id}
                        onClick={() => onSelectPrompt(prompt.text)}
                        disabled={disabled}
                        className={`
                            group relative overflow-hidden
                            px-3 py-2 rounded-lg text-left
                            border border-slate-200
                            bg-white hover:bg-gradient-to-br ${categoryColors[prompt.category]}
                            hover:text-white hover:border-transparent
                            transition-all duration-300
                            disabled:opacity-50 disabled:cursor-not-allowed
                            hover:shadow-md hover:scale-105
                        `}
                    >
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-base group-hover:scale-110 transition-transform">
                                    {prompt.icon}
                                </span>
                            </div>
                            <p className="text-xs font-medium text-slate-700 group-hover:text-white line-clamp-2">
                                {prompt.text}
                            </p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};
