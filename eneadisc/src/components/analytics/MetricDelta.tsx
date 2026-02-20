import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricDeltaProps {
    value: number;
    unit?: string;
    reversePolarity?: boolean; // True if lower is better (e.g., stress)
}

/**
 * Display metric delta with visual indicator
 */
export const MetricDelta: React.FC<MetricDeltaProps> = ({
    value,
    unit = '%',
    reversePolarity = false
}) => {
    if (value === 0) {
        return (
            <div className="flex items-center gap-1 text-sm text-slate-500">
                <Minus className="w-4 h-4" />
                <span>Sin cambios</span>
            </div>
        );
    }

    const isPositive = value > 0;
    const isGood = reversePolarity ? !isPositive : isPositive;

    const colorClass = isGood ? 'text-green-600' : 'text-red-600';
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
        <div className={`flex items-center gap-1 text-sm font-medium ${colorClass}`}>
            <Icon className="w-4 h-4" />
            <span>
                {isPositive ? '+' : ''}{value.toFixed(1)}{unit}
            </span>
            <span className="text-xs text-slate-500 font-normal">vs anterior</span>
        </div>
    );
};
