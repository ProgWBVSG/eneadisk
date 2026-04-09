import React from 'react';
import { Target, TrendingDown, TrendingUp } from 'lucide-react';

export const ValueProposition: React.FC = () => {
  return (
    <section className="py-24 bg-white" id="problem">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">¿Por qué los equipos fallan?</h2>
          <p className="text-lg text-slate-600">
            La mayoría de las empresas intentan mejorar el rendimiento enfocándose solo en procesos y herramientas técnicas, ignorando el factor humano y las dinamicas de personalidad.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Problema */}
          <div className="bg-slate-50 p-8 md:p-12 rounded-3xl border border-slate-100 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-400 group-hover:bg-red-500 transition-colors" />
            <TrendingDown className="w-12 h-12 text-red-500 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-4">El Enfoque Tradicional</h3>
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-1 font-bold text-red-400 text-xl">×</span>
                <span className="mt-1.5">Gestión basada en pura intuición y pruebas de ensayo/error.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 font-bold text-red-400 text-xl">×</span>
                <span className="mt-1.5">Burnout silencioso, detectado recién cuando el talento renuncia.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 font-bold text-red-400 text-xl">×</span>
                <span className="mt-1.5">Dinámicas tóxicas por incompatibilidad de perfiles.</span>
              </li>
            </ul>
          </div>

          {/* Solución EneaTeams */}
          <div className="bg-blue-50 p-8 md:p-12 rounded-3xl border border-blue-100 relative overflow-hidden group shadow-xl shadow-blue-900/5 transform transition-transform hover:-translate-y-2">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 group-hover:bg-amber-500 transition-colors" />
            <TrendingUp className="w-12 h-12 text-blue-600 mb-6" />
            <h3 className="text-2xl font-bold text-slate-900 mb-4">El Enfoque EneaTeams</h3>
            <ul className="space-y-4 text-slate-700 font-medium">
              <li className="flex items-start gap-3">
                <Target className="w-5 h-5 text-amber-500 shrink-0 mt-1.5" />
                <span>Decisiones 100% basadas en datos psicológicos estructurados.</span>
              </li>
              <li className="flex items-start gap-3">
                <Target className="w-5 h-5 text-amber-500 shrink-0 mt-1.5" />
                <span>Predicción de desgaste emocional mediante nuestro AI Smart Engine.</span>
              </li>
              <li className="flex items-start gap-3">
                <Target className="w-5 h-5 text-amber-500 shrink-0 mt-1.5" />
                <span>Match perfecto entre puestos, tareas y mapas de personalidad.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
