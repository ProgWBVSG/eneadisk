
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-800 text-slate-300 py-3 md:py-4 px-4 md:px-6">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-2 md:gap-3 text-xs">
        <div className="text-center md:text-left">
          <p className="text-slate-400">&copy; 2026 ENEADISC</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          <a href="#" className="hover:text-white transition-colors">Ayuda</a>
          <a href="#" className="hover:text-white transition-colors">Políticas</a>
          <a href="#" className="hover:text-white transition-colors">Términos</a>
          <a href="#" className="hover:text-white transition-colors">Contacto</a>
        </div>
      </div>
    </footer>
  );
};
