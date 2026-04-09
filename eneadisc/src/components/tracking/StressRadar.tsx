import React from 'react';
import { AlertTriangle, Info, ArrowRight } from 'lucide-react';
import type { EmployeeTracking } from '../../utils/trackingMocks';

interface Props {
  matrix: EmployeeTracking[];
}

export const StressRadar: React.FC<Props> = ({ matrix }) => {
  const warnings = matrix.filter(emp => emp.status !== 'aligned');

  if (warnings.length === 0) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-8 flex items-start gap-4">
        <div className="p-2 bg-emerald-100 text-emerald-600 rounded-full shrink-0">
          <HeartPulse className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-emerald-900">Equipo Alineado y Saludable</h3>
          <p className="text-emerald-700 mt-1 text-sm">
            Actualmente ningún miembro del equipo reporta indicadores que coincidan con su línea de estrés según el Eneagrama. El equipo mantiene un nivel de bienestar positivo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-red-100 bg-red-50 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" /> Radar de Estrés Temprano
          </h2>
          <p className="text-sm text-red-700 mt-1">
            Detecta quiénes están manifestando signos de desintegración según su Eneatipo.
          </p>
        </div>
        <div className="bg-red-100 text-red-800 text-sm font-bold px-3 py-1 rounded-full">
          {warnings.length} Alertas
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {warnings.map((emp) => (
            <div key={emp.employeeId} className={`p-4 rounded-lg border ${emp.status === 'critical' ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'} flex flex-col md:flex-row md:items-center gap-4`}>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-900">{emp.name}</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 shadow-sm">
                    Tipo {emp.enneagramType}
                  </span>
                </div>
                <p className={`text-sm ${emp.status === 'critical' ? 'text-red-700' : 'text-amber-800'}`}>
                  <strong>Señal:</strong> {emp.stressWarning}
                </p>
              </div>
              <div className="shrink-0 flex items-center gap-3">
                <button className="text-sm px-3 py-1.5 bg-white border border-slate-300 rounded-md font-medium text-slate-700 hover:bg-slate-50 transition-colors">
                  Ver Historial
                </button>
                <button className={`text-sm px-3 py-1.5 rounded-md font-medium text-white transition-colors flex items-center gap-1 ${emp.status === 'critical' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'}`}>
                  Recomendación IA <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex items-start gap-2 text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
          <Info className="w-5 h-5 shrink-0 text-blue-500" />
          <p>
            El radar utiliza los check-ins emocionales recientes y cruza la información con el comportamiento de alerta (dirección de desintegración) del Eneatipo de cada colaborador. Un Tipo 2 bajo estrés tenderá a comportamientos del Tipo 8, mientras que un Tipo 7 reaccionará con patrones de un Tipo 1.
          </p>
        </div>
      </div>
    </div>
  );
};

// Extrayendo el icono HeartPulse para el estado vacío
const HeartPulse = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27"/>
  </svg>
);
