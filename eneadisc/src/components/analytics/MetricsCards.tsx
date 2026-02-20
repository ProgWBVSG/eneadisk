import React from 'react';
import type { TeamAnalytics, PeriodComparison } from '../../utils/analytics';
import { TrendingUp, TrendingDown, Users, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { MetricDelta } from './MetricDelta';

interface MetricsCardsProps {
    analytics: TeamAnalytics | null;
    companyWide?: {
        overallCompletionRate: number;
        overallMoodScore: number;
        totalTasksCompleted: number;
        totalCheckIns: number;
    };
    comparison?: PeriodComparison | null;
}

interface MetricCardData {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    delta?: React.ReactNode;  // For comparison deltas
    color: string;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({ analytics, companyWide, comparison }) => {
    if (!analytics && !companyWide) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white rounded-lg border border-slate-200 p-6 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
                        <div className="h-8 bg-slate-200 rounded w-16 mb-2"></div>
                        <div className="h-3 bg-slate-200 rounded w-32"></div>
                    </div>
                ))}
            </div>
        );
    }

    const metrics: MetricCardData[] = analytics ? [
        {
            title: 'Tasa de Completación',
            value: `${Math.round(analytics.completionRate)}%`,
            subtitle: `${analytics.tasksCompleted}/${analytics.tasksAssigned} tareas`,
            icon: <CheckCircle2 className="w-6 h-6" />,
            trend: {
                value: analytics.completionRate,
                isPositive: analytics.completionRate >= 75
            },
            color: analytics.completionRate >= 75 ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50'
        },
        {
            title: 'Velocidad del Equipo',
            value: `${Math.round(analytics.velocityPerWeek)}`,
            subtitle: 'tareas por semana',
            icon: <TrendingUp className="w-6 h-6" />,
            color: 'text-blue-600 bg-blue-50'
        },
        {
            title: 'Mood Promedio',
            value: `${analytics.avgMoodScore.toFixed(1)}/5`,
            subtitle: `${analytics.checkInCount} check-ins`,
            icon: <Users className="w-6 h-6" />,
            trend: {
                value: analytics.avgMoodScore,
                isPositive: analytics.avgMoodScore >= 3.5
            },
            color: analytics.avgMoodScore >= 3.5 ? 'text-purple-600 bg-purple-50' : 'text-red-600 bg-red-50'
        },
        {
            title: 'Tareas Atrasadas',
            value: `${analytics.tasksOverdue}`,
            subtitle: analytics.tasksOverdue === 0 ? '¡Todo al día!' : 'requieren atención',
            icon: <AlertCircle className="w-6 h-6" />,
            color: analytics.tasksOverdue === 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
        }
    ] : [
        {
            title: 'Completación General',
            value: `${Math.round(companyWide!.overallCompletionRate)}%`,
            subtitle: 'promedio de todos los equipos',
            icon: <CheckCircle2 className="w-6 h-6" />,
            delta: comparison ? <MetricDelta value={comparison.delta.completionRate} unit="%" /> : undefined,
            color: 'text-green-600 bg-green-50'
        },
        {
            title: 'Tareas Completados',
            value: `${companyWide!.totalTasksCompleted}`,
            subtitle: 'en el período',
            icon: <TrendingUp className="w-6 h-6" />,
            delta: comparison ? <MetricDelta value={comparison.delta.tasksCompleted} unit=" tareas" /> : undefined,
            color: 'text-blue-600 bg-blue-50'
        },
        {
            title: 'Mood Promedio',
            value: `${companyWide!.overallMoodScore.toFixed(1)}/5`,
            subtitle: `${companyWide!.totalCheckIns} check-ins`,
            icon: <Users className="w-6 h-6" />,
            delta: comparison ? <MetricDelta value={comparison.delta.moodScore} unit="" /> : undefined,
            color: 'text-purple-600 bg-purple-50'
        },
        {
            title: 'Check-ins',
            value: `${companyWide!.totalCheckIns}`,
            subtitle: 'registros de bienestar',
            icon: <Clock className="w-6 h-6" />,
            delta: comparison ? <MetricDelta value={comparison.delta.checkIns} unit=" check-ins" /> : undefined,
            color: 'text-slate-600 bg-slate-50'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
            ))}
        </div>
    );
};

const MetricCard: React.FC<MetricCardData> = ({ title, value, subtitle, icon, trend, delta, color }) => {
    return (
        <div className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-lg ${color}`}>
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'
                        }`}>
                        {trend.isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                )}
            </div>
            <h3 className="text-sm font-medium text-slate-600 mb-1">{title}</h3>
            <p className="text-3xl font-bold text-slate-900 mb-1">{value}</p>
            <p className="text-xs text-slate-500 mb-2">{subtitle}</p>
            {delta && <div className="mt-2">{delta}</div>}
        </div>
    );
};
