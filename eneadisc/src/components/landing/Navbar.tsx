import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100 transition-all">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Left - Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <span className="text-xl font-bold tracking-widest text-slate-900 uppercase">
            EneaTeams
          </span>
        </div>

        {/* Center - Links (Hidden on very small screens) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-slate-500">
          <a href="#platform" className="hover:text-slate-900 hover:tracking-widest transition-all">PLATAFORMA</a>
          <a href="#solutions" className="hover:text-slate-900 hover:tracking-widest transition-all">SOLUCIONES</a>
          <a href="#about" className="hover:text-slate-900 hover:tracking-widest transition-all">NOSOTROS</a>
        </div>

        {/* Right - Auth */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/auth/portal')}
            className="hidden sm:block text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            Iniciar Sesión <span className="ml-1">→</span>
          </button>
          
          <button 
            onClick={() => navigate('/auth/portal')}
            className="px-5 py-2.5 bg-slate-900 text-white text-sm font-medium tracking-wide hover:bg-slate-800 transition-colors"
          >
            Comenzar
          </button>
        </div>
      </div>
    </nav>
  );
};
