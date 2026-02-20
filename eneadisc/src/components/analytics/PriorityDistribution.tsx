import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import type { TeamAnalytics } from '../../utils/analytics';

interface PriorityDistributionProps {
    analytics: TeamAnalytics;
}

const COLORS = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#3b82f6'
};

const LABELS = {
    high: 'Alta Prioridad',
    medium: 'Media Prioridad',
    low: 'Baja Prioridad'
};

export const PriorityDistribution: React.FC<PriorityDistributionProps> = ({ analytics }) => {
    const data = [
        { name: LABELS.high, value: analytics.highPriorityCompleted, color: COLORS.high },
        { name: LABELS.medium, value: analytics.mediumPriorityCompleted, color: COLORS.medium },
        { name: LABELS.low, value: analytics.lowPriorityCompleted, color: COLORS.low }
    ].filter(item => item.value > 0); // Only show non-zero values

    const totalTasks = data.reduce((sum, item) => sum + item.value, 0);

    // Custom label
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        if (percent < 0.05) return null; // Don't show label if too small

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="font-bold text-sm"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // Custom tooltip
    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
                    <p className="font-semibold text-slate-900 mb-1">{data.name}</p>
                    <p className="text-sm text-slate-700">
                        Completadas: <span className="font-bold">{data.value}</span>
                    </p>
                    <p className="text-sm text-slate-700">
                        Porcentaje: <span className="font-bold">{((data.value / totalTasks) * 100).toFixed(1)}%</span>
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
                    Distribución por Prioridad
                </h3>
                <p className="text-sm text-slate-600">
                    Tareas completadas: {totalTasks}
                </p>
            </div>

            {data.length === 0 ? (
                <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                    <p className="text-slate-500">No hay tareas completadas aún</p>
                </div>
            ) : (
                <>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={renderCustomLabel}
                                outerRadius={90}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                wrapperStyle={{ fontSize: '14px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Stats Summary */}
                    <div className="mt-4 grid grid-cols-3 gap-3">
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                            <div className="w-3 h-3 rounded-full bg-red-500"></div>
                            <div>
                                <p className="text-xs text-slate-600">Alta</p>
                                <p className="text-lg font-bold text-slate-900">{analytics.highPriorityCompleted}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-orange-50 rounded-lg">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <div>
                                <p className="text-xs text-slate-600">Media</p>
                                <p className="text-lg font-bold text-slate-900">{analytics.mediumPriorityCompleted}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <div>
                                <p className="text-xs text-slate-600">Baja</p>
                                <p className="text-lg font-bold text-slate-900">{analytics.lowPriorityCompleted}</p>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
