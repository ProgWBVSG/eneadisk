import React from 'react';
import { Target, TrendingUp, HeartPulse } from 'lucide-react';
import type { TrackingKPIs as KPIs } from '../../utils/trackingMocks';

interface Props {
  kpis: KPIs;
}

export const TrackingKPIs: React.FC<Props> = ({ kpis }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {/* Retos Completados */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <Target className="w-6 h-6" />
          </div>
          <div className="flex items-center space-x-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp className="w-4 h-4" />
            <span>+{kpis.completedChallengesGrowth}%</span>
          </div>
        </div>
        <h3 className="text-slate-500 text-sm font-medium">Retos Completados</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{kpis.completedChallenges}</span>
          <span className="text-sm text-slate-500">este mes</span>
        </div>
      </div>

      {/* Alineamiento Energético */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div className="flex items-center space-x-1 text-sm font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
            <TrendingUp className="w-4 h-4" />
            <span>+{kpis.wellbeingGrowth}%</span>
          </div>
        </div>
        <h3 className="text-slate-500 text-sm font-medium">Bienestar Promedio</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{kpis.averageWellbeing}</span>
          <span className="text-sm text-slate-500">/ 5.0</span>
        </div>
      </div>

      {/* Focos Activos */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>
        <h3 className="text-slate-500 text-sm font-medium">Focos de Desarrollo Activos</h3>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-3xl font-bold text-slate-900">{kpis.activeFocusAreas}</span>
          <span className="text-sm text-slate-500">colaboradores</span>
        </div>
      </div>
    </div>
  );
};
