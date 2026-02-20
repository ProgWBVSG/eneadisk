import React from 'react';
import { TrendingUp, LineChart } from 'lucide-react';
import { calculateTrend, calculateTrendSlope } from '../../utils/analytics';
import type { CompanyWideAnalytics } from '../../utils/analytics';
import { TrendIndicator } from './TrendIndicator';

interface ProjectionsPanelProps {
    analytics: CompanyWideAnalytics;
}

/**
 * Display trend projections for key metrics
 */
export const ProjectionsPanel: React.FC<ProjectionsPanelProps> = ({ analytics }) => {
    // Calculate trends for each team
    const teamTrends = analytics.teams.map(team => {
        const moodTrend = calculateTrend(team.moodTrend);
        const productivityTrend = calculateTrend(team.productivityTrend);
        const moodSlope = calculateTrendSlope(team.moodTrend);
        const productivitySlope = calculateTrendSlope(team.productivityTrend);

        // Simple projection: current value + (slope * periods ahead)
        const currentMood = team.avgMoodScore;
        const currentVelocity = team.velocityPerWeek;
        const projectedMood = Math.max(1, Math.min(5, currentMood + moodSlope * 2)); // 2 periods ahead
        const projectedVelocity = Math.max(0, currentVelocity + productivitySlope * 2);

        return {
            teamId: team.teamId,
            teamName: team.teamName,
            moodTrend,
            productivityTrend,
            projectedMood,
            projectedVelocity,
            moodChange: ((projectedMood - currentMood) / currentMood) * 100,
            velocityChange: currentVelocity > 0 ? ((projectedVelocity - currentVelocity) / currentVelocity) * 100 : 0
        };
    });

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg">
                    <LineChart className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">Proyecciones</h3>
                    <p className="text-sm text-slate-600">Estimaciones basadas en tendencias actuales</p>
                </div>
            </div>

            <div className="space-y-4">
                {teamTrends.map(trend => (
                    <div key={trend.teamId} className="border-t border-slate-100 pt-4 first:border-0 first:pt-0">
                        <h4 className="font-medium text-slate-900 mb-3">{trend.teamName}</h4>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Mood Projection */}
                            <div className="bg-purple-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-700">Mood Proyectado</span>
                                    <TrendIndicator trend={trend.moodTrend} />
                                </div>
                                <p className="text-2xl font-bold text-purple-700">
                                    {trend.projectedMood.toFixed(1)}/5
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                    {trend.moodChange > 0 ? '+' : ''}{trend.moodChange.toFixed(1)}% vs actual
                                </p>
                            </div>

                            {/* Velocity Projection */}
                            <div className="bg-blue-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-slate-700">Velocidad Proyectada</span>
                                    <TrendIndicator trend={trend.productivityTrend} />
                                </div>
                                <p className="text-2xl font-bold text-blue-700">
                                    {trend.projectedVelocity.toFixed(1)}
                                </p>
                                <p className="text-xs text-slate-600 mt-1">
                                    tareas/sem ({trend.velocityChange > 0 ? '+' : ''}{trend.velocityChange.toFixed(1)}%)
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-xs text-slate-600">
                    <TrendingUp className="w-3 h-3 inline mr-1" />
                    Las proyecciones se basan en regresión lineal simple de los últimos 7 días de datos.
                </p>
            </div>
        </div>
    );
};
