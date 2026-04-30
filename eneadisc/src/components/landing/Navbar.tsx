import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        isScrolled 
          ? "bg-[#0b132b]/90 backdrop-blur-md border-b border-white/10 py-2 shadow-2xl" 
          : "bg-gradient-to-b from-black/60 via-black/20 to-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Left - Logo */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <img src="/logo.png" alt="EneaTeams" className="h-8 w-auto drop-shadow-md" />
        </div>

        {/* Center - Links (Hidden on very small screens) */}
        <div className={`hidden md:flex items-center gap-8 text-xs font-bold tracking-widest transition-colors ${isScrolled ? "text-slate-300" : "text-white/80"}`}>
          <a href="#platform" className="hover:text-white hover:tracking-[0.15em] transition-all">PLATAFORMA</a>
          <a href="#solutions" className="hover:text-white hover:tracking-[0.15em] transition-all">SOLUCIONES</a>
          <a href="#about" className="hover:text-white hover:tracking-[0.15em] transition-all">NOSOTROS</a>
        </div>

        {/* Right - Auth */}
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/auth/portal')}
            className={`hidden sm:block text-xs font-bold tracking-widest transition-colors ${isScrolled ? "text-slate-300 hover:text-white" : "text-white/80 hover:text-white"}`}
          >
            INICIAR SESIÓN <span className="ml-1">→</span>
          </button>
          
          <button 
            onClick={() => navigate('/auth/portal')}
            className="px-6 py-2.5 bg-white text-slate-900 text-xs font-bold tracking-widest hover:bg-slate-200 transition-colors rounded-sm"
          >
            COMENZAR
          </button>
        </div>
      </div>
    </motion.nav>
  );
};
