import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Reveal } from '../ui/Reveal';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-white min-h-[80vh] flex flex-col justify-center items-center py-20 overflow-hidden">
      {/* Background Subtle Gradients */}
      <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#f0f0f0] to-[#e2e8f0] opacity-50 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-[pulse_8s_ease-in-out_infinite]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center z-10 flex flex-col items-center">
        
        <Reveal>
          <div className="mb-8 px-4 py-1.5 border border-slate-200 text-xs font-semibold tracking-widest text-slate-500 uppercase rounded-[1px]">
            La nueva era del Management Humano
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-slate-900 leading-[1.1] mb-8 max-w-4xl">
            Explorá estrategias innovadoras de gestión de talento diseñadas para equipos de alto rendimiento.
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-xl md:text-2xl font-light text-slate-500 max-w-3xl leading-relaxed mb-12">
            Transformamos la complejidad de la personalidad humana en datos estructurados y medibles. Anticipá conflictos, predecí burn-out y construí ecosistemas de trabajo excepcionales con EneaTeams.
          </p>
        </Reveal>

        <Reveal delay={0.3} direction="up">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button 
              onClick={() => navigate('/auth/portal')}
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium tracking-wide transition-transform hover:-translate-y-1 hover:shadow-xl w-full sm:w-auto"
            >
              Explorar Plataforma
            </button>
            
            <button 
              onClick={() => {
                  document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-transparent border border-slate-300 text-slate-700 hover:border-slate-900 hover:text-slate-900 text-sm font-medium tracking-wide transition-all w-full sm:w-auto"
            >
              Nuestra Metodología
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
