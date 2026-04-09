import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

export const CallToAction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 bg-slate-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-blue-900/20 mix-blend-multiply" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-blue-600/20 to-transparent blur-3xl pointer-events-none" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Empieza hoy a construir tu equipo ideal
          </h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Únete a la revolución de la gestión del talento. Acceso instantáneo a análisis predictivo y un asistente IA de vanguardia.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold border-none px-8 py-4 h-auto text-lg rounded-xl shadow-lg shadow-amber-500/25 transition-transform hover:scale-105"
              onClick={() => navigate('/auth/portal')}
            >
              Comenzar Ahora <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          
          <p className="mt-8 text-slate-400 text-sm">
            Sin tarjeta de crédito requerida para empezar. Podés registrar primero a tu Colaborador de forma libre.
          </p>
        </div>
      </div>
    </section>
  );
};
