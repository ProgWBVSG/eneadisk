import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface TrendIndicatorProps {
    trend: 'up' | 'down' | 'stable';
    value?: number;
    label?: string;
}

/**
 * Display trend indicator with icon and optional value
 */
export const TrendIndicator: React.FC<TrendIndicatorProps> = ({ trend, value, label }) => {
    const config = {
        up: {
            icon: TrendingUp,
            color: 'text-green-600 bg-green-50',
            text: 'Tendencia positiva'
        },
        down: {
            icon: TrendingDown,
            color: 'text-red-600 bg-red-50',
            text: 'Tendencia negativa'
        },
        stable: {
            icon: Minus,
            color: 'text-slate-600 bg-slate-50',
            text: 'Estable'
        }
    };

    const { icon: Icon, color, text } = config[trend];

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${color}`}>
            <Icon className="w-4 h-4" />
            <span className="text-sm font-medium">
                {label || text}
                {value !== undefined && ` (${value > 0 ? '+' : ''}${value.toFixed(1)}%)`}
            </span>
        </div>
    );
};
