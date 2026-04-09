import React from 'react';
import type { EmployeeTracking } from '../../utils/trackingMocks';

interface Props {
  matrix: EmployeeTracking[];
}

export const EvolutionMatrix: React.FC<Props> = ({ matrix }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <h2 className="text-lg font-bold text-slate-900">Matriz de Evolución de Enfoque</h2>
        <p className="text-sm text-slate-600 mt-1">Progreso actual de los retos de desarrollo de tu equipo.</p>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-slate-200 text-sm font-medium text-slate-500 uppercase tracking-wider">
              <th className="p-4 pl-6">Colaborador</th>
              <th className="p-4">Eneatipo</th>
              <th className="p-4">Foco de Desarrollo (Reto Actual)</th>
              <th className="p-4">Progreso</th>
              <th className="p-4 pr-6 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {matrix.map((emp) => (
              <tr key={emp.employeeId} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                      {emp.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-slate-900">{emp.name}</span>
                  </div>
                </td>
                <td className="p-4">
                  {emp.enneagramType ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      Tipo {emp.enneagramType}
                    </span>
                  ) : (
                    <span className="text-slate-400 text-sm">Pendiente</span>
                  )}
                </td>
                <td className="p-4 text-sm text-slate-700">
                  {emp.currentFocus}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500"
                        style={{ width: `${emp.focusProgress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 w-8">{emp.focusProgress}%</span>
                  </div>
                </td>
                <td className="p-4 pr-6 text-center">
                  {emp.status === 'aligned' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Alineado
                    </span>
                  ) : emp.status === 'warning' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Atención
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Crítico
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {matrix.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  Aún no hay integrantes en el equipo con foco establecido.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
