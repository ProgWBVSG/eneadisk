import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Reveal } from '../ui/Reveal';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full bg-slate-950 min-h-[90vh] flex flex-col justify-center items-center py-20 overflow-hidden">
      {/* Background Deep Gradients & Prominent Enneagram */}
      <div className="absolute inset-0 -z-20 h-full w-full overflow-hidden">
        {/* Deep mesh gradient */}
        <div className="absolute inset-x-0 -top-40 transform-gpu overflow-hidden blur-3xl sm:-top-80 pointer-events-none">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#3b82f6] to-[#8b5cf6] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem] animate-[pulse_8s_ease-in-out_infinite]" />
        </div>

        {/* Ambient glow in center behind Enneagram */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />

        {/* Highly Visible Enneagram Abstract Background */}
        <svg viewBox="0 0 1000 1000" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] md:w-[1200px] md:h-[1200px] opacity-[0.25] stroke-indigo-400/60 animate-[spin_180s_linear_infinite] pointer-events-none" fill="none" strokeWidth="2">
          {/* Main Circle */}
          <circle cx="500" cy="500" r="400" />
          {/* Triangle (9-3-6) */}
          <polygon points="500,100 846,700 154,700" />
          {/* Hexagram (1-4-2-8-5-7) */}
          <polygon points="757,194 637,876 894,431 243,194 363,876 106,431" />
          
          {/* Inner details for blueprint aesthetic */}
          <line x1="500" y1="100" x2="500" y2="900" strokeDasharray="4 12" strokeWidth="1" opacity="0.6" />
          <line x1="100" y1="500" x2="900" y2="500" strokeDasharray="4 12" strokeWidth="1" opacity="0.6" />
          <circle cx="500" cy="500" r="380" strokeDasharray="2 10" strokeWidth="1" opacity="0.4" />
        </svg>
      </div>

      <div className="max-w-5xl mx-auto px-6 text-center z-10 flex flex-col items-center">
        
        <Reveal>
          <div className="mb-8 px-4 py-1.5 border border-indigo-400/30 bg-indigo-500/10 backdrop-blur-sm text-xs font-semibold tracking-widest text-indigo-300 uppercase rounded-full shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            La nueva era del Management Humano
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-semibold tracking-tight text-white leading-[1.05] mb-8 max-w-4xl drop-shadow-lg">
            El ADN de los equipos excepcionales.
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="text-xl md:text-2xl font-light text-slate-300 max-w-3xl leading-relaxed mb-12 drop-shadow">
            Transformamos la complejidad de la personalidad humana en datos estructurados y medibles. Anticipá conflictos, predecí burn-out y construí ecosistemas de trabajo excepcionales con EneaTeams.
          </p>
        </Reveal>

        <Reveal delay={0.3} direction="up">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button 
              onClick={() => navigate('/auth/portal')}
              className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium tracking-wide transition-all hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(79,70,229,0.4)] w-full sm:w-auto rounded-sm border border-indigo-500"
            >
              Explorar Plataforma
            </button>
            
            <button 
              onClick={() => {
                  document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-8 py-4 bg-transparent backdrop-blur-sm border border-slate-600 text-slate-300 hover:border-slate-300 hover:text-white hover:bg-slate-800/50 text-sm font-medium tracking-wide transition-all w-full sm:w-auto rounded-sm"
            >
              Nuestra Metodología
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
