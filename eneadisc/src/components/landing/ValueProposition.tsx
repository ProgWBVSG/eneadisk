import React from 'react';
import { Reveal } from '../ui/Reveal';

export const ValueProposition: React.FC = () => {
  return (
    <section className="py-24 bg-slate-50 border-y border-slate-100" id="solutions">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-16 md:gap-24 items-start">
          
          <div className="lg:w-1/3">
            <Reveal>
              <h2 className="text-3xl font-semibold tracking-tight text-slate-900 mb-6 relative">
                El Riesgo del Instinto
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-slate-500 font-light leading-relaxed mb-6">
                El management tradicional confía ciegamente en la intuición para construir y alinear talento. Este enfoque carece de estructura, provocando fricciones de equipo invisibles, burnout silencioso y fugas de capital humano valioso.
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <div className="h-[1px] w-12 bg-slate-300"></div>
            </Reveal>
          </div>

          <div className="lg:w-2/3 grid sm:grid-cols-2 gap-x-12 gap-y-16">
            <Reveal delay={0.1}>
              <div>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase block mb-3">01 / ENFOQUE ENEATEAMS</span>
                <h3 className="text-xl font-medium text-slate-900 mb-4 transition-colors hover:text-slate-600 cursor-default">Mapeo Psicométrico</h3>
                <p className="text-slate-500 font-light leading-relaxed">
                  Estandarizamos la estructura psicológica de sus equipos utilizando los marcos analíticos probados de Eneagrama y DISC, transformando perfiles abstractos en datos cuantitativos procesables.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <div>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase block mb-3">02 / ENFOQUE ENEATEAMS</span>
                <h3 className="text-xl font-medium text-slate-900 mb-4 transition-colors hover:text-slate-600 cursor-default">Ingeniería Predictiva</h3>
                <p className="text-slate-500 font-light leading-relaxed">
                  Anticipamos la rotación (desgaste) y los conflictos de liderazgo antes de que se manifiesten. Los algoritmos de mapeo aseguran emparejamientos de alta sinergia entre roles e individuos.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.3}>
              <div>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase block mb-3">03 / ENFOQUE ENEATEAMS</span>
                <h3 className="text-xl font-medium text-slate-900 mb-4 transition-colors hover:text-slate-600 cursor-default">Direccionamiento Asistido (IA)</h3>
                <p className="text-slate-500 font-light leading-relaxed">
                  Proporciona a directores y gerentes tácticas de management personalizadas en tiempo real. Obtenga consejos específicos de liderazgo adaptados a la matriz de personalidad exacta de cada empleado.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.4}>
              <div>
                <span className="text-xs font-bold tracking-widest text-slate-400 uppercase block mb-3">04 / ENFOQUE ENEATEAMS</span>
                <h3 className="text-xl font-medium text-slate-900 mb-4 transition-colors hover:text-slate-600 cursor-default">Adopción sin Fricción</h3>
                <p className="text-slate-500 font-light leading-relaxed">
                  Diseñado para integrarse al flujo de trabajo corporativo con check-ins no intrusivos que mantienen a la inteligencia organizacional permanentemente actualizada.
                </p>
              </div>
            </Reveal>
          </div>

        </div>
      </div>
    </section>
  );
};
