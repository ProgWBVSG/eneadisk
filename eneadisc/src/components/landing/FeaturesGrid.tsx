import React from 'react';
import { Reveal } from '../ui/Reveal';

const features = [
  {
    title: 'Analíticas Gerenciales',
    category: 'Métricas',
    description: 'Tableros de control sobrios con índices de productividad, burn-out y compatibilidad operativa analizados retrospectivamente y en tiempo real.'
  },
  {
    title: 'Inteligencia Aplicada (IA)',
    category: 'Sistemas',
    description: 'Motor conversacional B2B que procesa los datos del organigrama para entregar resoluciones precisas sobre el comportamiento y management del capital humano.'
  },
  {
    title: 'Topología Organizacional',
    category: 'Estructura',
    description: 'Visualización clara del entramado de personalidades en cada sector de su compañía, revelando asimetrías de roles y déficits estructurales.'
  }
];

export const FeaturesGrid: React.FC = () => {
  return (
    <section className="py-24 bg-white" id="platform">
      <div className="max-w-7xl mx-auto px-6">
        <Reveal>
          <div className="mb-16">
            <h2 className="text-3xl font-semibold tracking-tight text-slate-900">
              Arquitectura de la Plataforma
            </h2>
            <div className="h-[1px] w-full bg-slate-100 mt-8"></div>
          </div>
        </Reveal>

        <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
          {features.map((feature, index) => (
            <Reveal key={index} delay={0.1 * (index + 1)}>
              <div className="group cursor-default h-full">
                <div className="mb-6 overflow-hidden bg-slate-50 aspect-video flex items-center justify-center border border-slate-100 transition-all duration-500 group-hover:border-slate-300 group-hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                  <span className="text-slate-300 font-light tracking-widest text-sm uppercase transform transition-transform duration-500 group-hover:scale-105">Interfaz {index + 1}</span>
                </div>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase block mb-2">{feature.category}</span>
                <h3 className="text-lg font-medium text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};
