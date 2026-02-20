import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TeamAnalytics } from '../../utils/analytics';

interface ProductivityChartProps {
    analytics: TeamAnalytics;
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({ analytics }) => {
    // Combinar los datos de productividad y mood por fecha
    const chartData = analytics.moodTrend.map(moodPoint => {
        const productivityPoint = analytics.productivityTrend.find(p => p.date === moodPoint.date);
        return {
            date: new Date(moodPoint.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
            mood: parseFloat(moodPoint.value.toFixed(1)),
            tareas: productivityPoint ? productivityPoint.value : 0
        };
    });

    // Custom tooltip
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-slate-900 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <p key={index} style={{ color: entry.color }} className="text-sm">
                            {entry.name}: <span className="font-bold">{entry.value}</span>
                            {entry.name === 'Mood' && '/5'}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">
                    Productividad vs Bienestar
                </h3>
                <p className="text-sm text-slate-600">
                    Tendencia de los últimos 7 días
                </p>
            </div>

            {chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                    <p className="text-slate-500">No hay datos suficientes para mostrar el gráfico</p>
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            stroke="#64748b"
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#8b5cf6"
                            style={{ fontSize: '12px' }}
                            label={{ value: 'Mood (1-5)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#3b82f6"
                            style={{ fontSize: '12px' }}
                            label={{ value: 'Tareas', angle: 90, position: 'insideRight', style: { fontSize: '12px' } }}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            wrapperStyle={{ fontSize: '14px', paddingTop: '10px' }}
                            iconType="line"
                        />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="mood"
                            stroke="#8b5cf6"
                            strokeWidth={3}
                            name="Mood"
                            dot={{ fill: '#8b5cf6', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="tareas"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            name="Tareas Completadas"
                            dot={{ fill: '#3b82f6', r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}

            {/* Correlation Info */}
            {analytics.wellnessProductivityCorr !== 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                        <span className="font-semibold">Correlación:</span> {' '}
                        {analytics.wellnessProductivityCorr > 0 ? '📈' : '📉'} {' '}
                        {Math.abs(analytics.wellnessProductivityCorr * 100).toFixed(0)}% {' '}
                        {analytics.wellnessProductivityCorr > 0.5 ? '(Fuerte positiva)' :
                            analytics.wellnessProductivityCorr > 0 ? '(Positiva)' :
                                analytics.wellnessProductivityCorr > -0.5 ? '(Negativa)' : '(Fuerte negativa)'}
                    </p>
                </div>
            )}
        </div>
    );
};
