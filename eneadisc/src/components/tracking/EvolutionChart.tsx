import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { EvolutionDataPoint } from '../../utils/trackingMocks';

interface Props {
  data: EvolutionDataPoint[];
}

export const EvolutionChart: React.FC<Props> = ({ data }) => {
  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-lg">
          <p className="font-semibold text-slate-900 mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <span className="font-bold">{entry.value}</span>
              {entry.name === 'Bienestar del Equipo' && ' / 5.0'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mb-8">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900">Evolución Semestral</h2>
        <p className="text-sm text-slate-600 mt-1">Comparativa a mediano plazo del Bienestar Promedio y la Finalización de Retos por Eneatipo.</p>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorBienestar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRetos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 13 }}
              dy={10}
            />
            <YAxis 
              yAxisId="left" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 13 }}
              domain={[1, 5]}
              width={40}
            />
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 13 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
            
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="bienestar" 
              name="Bienestar del Equipo"
              stroke="#8b5cf6" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorBienestar)" 
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            
            <Area 
              yAxisId="right"
              type="monotone" 
              dataKey="retosCompletados" 
              name="Retos Superados"
              stroke="#10b981" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRetos)" 
              activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
