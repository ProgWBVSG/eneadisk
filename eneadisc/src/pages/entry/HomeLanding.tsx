import React from 'react';
import { Navbar } from '../../components/landing/Navbar';
import { HeroSection } from '../../components/landing/HeroSection';
import { ValueProposition } from '../../components/landing/ValueProposition';
import { FeaturesGrid } from '../../components/landing/FeaturesGrid';
import { CallToAction } from '../../components/landing/CallToAction';

export const HomeLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-slate-900 selection:text-white">
      <Navbar />
      <HeroSection />
      <FeaturesGrid />
      <ValueProposition />
      <CallToAction />
      
      {/* Subdued Footer */}
      <footer className="py-8 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs tracking-widest text-slate-400 uppercase">
          <p>© {new Date().getFullYear()} ENEATEAMS. TODOS LOS DERECHOS RESERVADOS.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-slate-900 transition-colors">Políticas</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Términos</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
