import React from 'react';
import { Network, Brain, BarChart3, Clock } from 'lucide-react';

const features = [
  {
    icon: <BarChart3 className="w-8 h-8 text-blue-500" />,
    title: 'Analíticas Avanzadas',
    description: 'Tableros de control con índices de productividad, burn-out y compatibilidad de equipos en tiempo real.'
  },
  {
    icon: <Brain className="w-8 h-8 text-amber-500" />,
    title: 'Asistente de Inteligencia Artificial',
    description: 'Recibe consejos gerenciales adaptados a la personalidad exacta de cada miembro de tu equipo.'
  },
  {
    icon: <Network className="w-8 h-8 text-indigo-500" />,
    title: 'Mapeo de Personalidad',
    description: 'Identifica la estructura base de tu organización utilizando Eneagrama y modelo DISC.'
  },
  {
    icon: <Clock className="w-8 h-8 text-emerald-500" />,
    title: 'Check-ins Automatizados',
    description: 'Seguimiento emocional de baja fricción para anticipar problemas de motivación antes de que sucedan.'
  }
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50" id="features">
      <div className="container mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Herramientas diseñadas para el Nuevo Management
          </h2>
          <p className="text-lg text-slate-600">
            Todo lo que necesitas para liderar equipos sanos, felices y extremadamente productivos.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="mb-6 p-4 bg-slate-50 rounded-xl inline-block group-hover:bg-blue-50 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
              <p className="text-slate-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
