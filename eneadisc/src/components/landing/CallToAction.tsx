import React from 'react';
import { useNavigate } from 'react-router-dom';

export const CallToAction: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-slate-50 border-t border-slate-100">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-slate-900 mb-8">
          Elevá el nivel de tu Organización
        </h2>
        
        <p className="text-lg md:text-xl font-light text-slate-500 mb-12 max-w-2xl mx-auto">
          Inicie su despliegue y acceda de inmediato a nuestro motor de analíticas predictivas impulsado por IA, diseñado exclusivamente para optimizar la cultura corporativa de su firma.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <button 
            onClick={() => navigate('/auth/portal')}
            className="px-10 py-5 bg-slate-900 text-white text-sm font-medium tracking-wide hover:bg-slate-800 transition-colors w-full sm:w-auto"
          >
            Configurar Empresa
          </button>
          <button 
            onClick={() => navigate('/auth/portal')}
            className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Ingresar como Colaborador <span className="ml-1">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};
