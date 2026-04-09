import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Activity } from 'lucide-react';
import { Button } from '../ui/Button';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden bg-slate-900 text-white min-h-[85vh] flex items-center">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl pointer-events-none" />
        <div className="absolute top-40 -left-20 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 relative z-10 mt-16 md:mt-0">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-900/40 border border-blue-700/50 text-blue-300 text-sm font-medium mb-4 animate-[fadeIn_1s_ease-out]">
            <Activity size={16} />
            <span>El GPS emocional de tu organización</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight animate-[slideUp_0.8s_ease-out]">
            Descubrí la verdadera <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-amber-400">fuerza de tu equipo</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto leading-relaxed animate-[slideUp_1s_ease-out]">
            Plataforma SaaS integral basada en Eneagrama y DISC para predecir productividad, medir el bienestar emocional y potenciar el talento oculto.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 animate-[fadeIn_1.2s_ease-out]">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white border-none px-8 py-4 h-auto text-lg rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all hover:scale-105"
              onClick={() => navigate('/auth/portal')}
            >
              Comenzar Ahora <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              variant="outline"
              size="lg" 
              className="w-full sm:w-auto border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 px-8 py-4 h-auto text-lg rounded-xl transition-all"
              onClick={() => {
                document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Descubrir más
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
