import React from 'react';
import { AlertCircle, CheckCircle2, Info, Lightbulb, TrendingUp, TrendingDown } from 'lucide-react';
import type { Insight } from '../../utils/analytics';

interface InsightsPanelProps {
    insights: Insight[];
    maxInsights?: number;
}

const ICON_MAP = {
    warning: AlertCircle,
    success: CheckCircle2,
    info: Info,
    recommendation: Lightbulb
};

const COLOR_MAP = {
    warning: {
        bg: 'bg-orange-50',
        border: 'border-orange-500',
        text: 'text-orange-900',
        icon: 'text-orange-600'
    },
    success: {
        bg: 'bg-green-50',
        border: 'border-green-500',
        text: 'text-green-900',
        icon: 'text-green-600'
    },
    info: {
        bg: 'bg-blue-50',
        border: 'border-blue-500',
        text: 'text-blue-900',
        icon: 'text-blue-600'
    },
    recommendation: {
        bg: 'bg-purple-50',
        border: 'border-purple-500',
        text: 'text-purple-900',
        icon: 'text-purple-600'
    }
};

const PRIORITY_BADGE_MAP = {
    high: 'bg-red-100 text-red-700',
    medium: 'bg-yellow-100 text-yellow-700',
    low: 'bg-slate-100 text-slate-700'
};

const PRIORITY_LABEL_MAP = {
    high: 'Alta',
    medium: 'Media',
    low: 'Baja'
};

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ insights, maxInsights = 5 }) => {
    const displayInsights = insights.slice(0, maxInsights);

    if (displayInsights.length === 0) {
        return (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                    Insights Accionables
                </h3>
                <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-slate-600 font-medium">¡Todo en orden!</p>
                    <p className="text-sm text-slate-500 mt-1">No hay insights críticos en este momento</p>
                </div>
            </div>
        );
    }

    // Count insights by type
    const insightCounts = insights.reduce((acc, insight) => {
        acc[insight.type] = (acc[insight.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
            {/* Header with Summary */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                        <Lightbulb className="w-5 h-5 text-purple-600" />
                        Insights Accionables
                    </h3>
                    <div className="flex items-center gap-2 text-xs">
                        {insightCounts.warning && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full font-medium">
                                {insightCounts.warning} Advertencias
                            </span>
                        )}
                        {insightCounts.success && (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                                {insightCounts.success} Éxitos
                            </span>
                        )}
                        {insightCounts.recommendation && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-medium">
                                {insightCounts.recommendation} Recomendaciones
                            </span>
                        )}
                    </div>
                </div>
                <p className="text-sm text-slate-600">
                    Mostrando {displayInsights.length} de {insights.length} insights detectados
                </p>
            </div>

            {/* Insights List */}
            <div className="space-y-3">
                {displayInsights.map((insight) => {
                    const colors = COLOR_MAP[insight.type];
                    const Icon = ICON_MAP[insight.type];

                    return (
                        <div
                            key={insight.id}
                            className={`p-4 rounded-lg border-l-4 ${colors.bg} ${colors.border} hover:shadow-md transition-shadow`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Icon */}
                                <div className={`flex-shrink-0 ${colors.icon}`}>
                                    <Icon className="w-5 h-5" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-2">
                                        <h4 className={`font-semibold ${colors.text}`}>
                                            {insight.title}
                                        </h4>
                                        <span className={`flex-shrink-0 px-2 py-0.5 text-xs font-medium rounded-full ${PRIORITY_BADGE_MAP[insight.priority]}`}>
                                            {PRIORITY_LABEL_MAP[insight.priority]}
                                        </span>
                                    </div>

                                    <p className={`text-sm ${colors.text} mb-3`}>
                                        {insight.description}
                                    </p>

                                    {/* Metrics */}
                                    {insight.metrics && (
                                        <div className={`mb-3 p-2 ${colors.bg} border border-opacity-20 rounded`}>
                                            <div className="flex items-center gap-2 text-sm">
                                                {insight.metrics.benchmark ? (
                                                    <>
                                                        <span className="font-semibold">
                                                            {insight.metrics.value.toFixed(1)} {insight.metrics.unit}
                                                        </span>
                                                        {insight.metrics.value < insight.metrics.benchmark ? (
                                                            <TrendingDown className="w-4 h-4 text-red-500" />
                                                        ) : (
                                                            <TrendingUp className="w-4 h-4 text-green-500" />
                                                        )}
                                                        <span className="text-slate-600">
                                                            vs objetivo: {insight.metrics.benchmark} {insight.metrics.unit}
                                                        </span>
                                                    </>
                                                ) : (
                                                    <span className="font-semibold">
                                                        {insight.metrics.value.toFixed(1)} {insight.metrics.unit}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action */}
                                    {insight.actionable && insight.suggestedAction && (
                                        <div className={`flex items-start gap-2 p-2 ${colors.bg} border border-opacity-30 rounded`}>
                                            <Lightbulb className={`w-4 h-4 flex-shrink-0 mt-0.5 ${colors.icon}`} />
                                            <p className={`text-sm font-medium ${colors.text}`}>
                                                {insight.suggestedAction}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Show More Link */}
            {insights.length > maxInsights && (
                <div className="mt-4 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline">
                        Ver {insights.length - maxInsights} insights más →
                    </button>
                </div>
            )}
        </div>
    );
};
