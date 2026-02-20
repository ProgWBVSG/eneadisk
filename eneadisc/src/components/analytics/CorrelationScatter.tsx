import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { TeamAnalytics } from '../../utils/analytics';

interface CorrelationScatterProps {
    teams: TeamAnalytics[];
}

export const CorrelationScatter: React.FC<CorrelationScatterProps> = ({ teams }) => {
    // Prepare data for scatter plot
    const scatterData = teams.map(team => ({
        name: team.teamName,
        productividad: parseFloat(team.completionRate.toFixed(1)),
        bienestar: parseFloat(team.avgMoodScore.toFixed(1)),
        size: team.memberCount * 5 // Size based on team size
    }));

    // Color based on mood score
    const getColor = (mood: number) => {
        if (mood >= 4) return '#10b981'; // green
        if (mood >= 3) return '#3b82f6'; // blue
        if (mood >= 2) return '#f59e0b'; // orange
        return '#ef4444'; // red
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-slate-900 mb-2">{data.name}</p>
                    <p className="text-sm text-slate-700">
                        Completación: <span className="font-bold">{data.productividad}%</span>
                    </p>
                    <p className="text-sm text-slate-700">
                        Mood: <span className="font-bold">{data.bienestar}/5</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Correlación Avanzada
                </h3>
                <p className="text-sm text-slate-600">
                    Productividad vs Bienestar por equipo
                </p>
            </div>

            {scatterData.length === 0 ? (
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                    <p className="text-slate-500">No hay datos suficientes</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            type="number"
                            dataKey="productividad"
                            name="Productividad"
                            unit="%"
                            domain={[0, 100]}
                            stroke="#64748b"
                            style={{ fontSize: '12px' }}
                            label={{ value: 'Completación (%)', position: 'insideBottom', offset: -10, style: { fontSize: '12px' } }}
                        />
                        <YAxis
                            type="number"
                            dataKey="bienestar"
                            name="Bienestar"
                            domain={[1, 5]}
                            stroke="#64748b"
                            style={{ fontSize: '12px' }}
                            label={{ value: 'Mood (1-5)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
                        <Scatter name="Equipos" data={scatterData} fill="#8884d8">
                            {scatterData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={getColor(entry.bienestar)} />
                            ))}
                        </Scatter>
                    </ScatterChart>
                </ResponsiveContainer>
            )}

            {/* Legend */}
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-slate-600">Excelente (4-5)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-slate-600">Bueno (3-4)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                    <span className="text-slate-600">Regular (2-3)</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-slate-600">Bajo (&lt;2)</span>
                </div>
            </div>
        </div>
    );
};
