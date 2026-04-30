import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

export const CallToAction: React.FC = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-40 bg-[#0b132b] relative overflow-hidden border-t border-white/5" id="about">
      {/* Animated background glows */}
      <motion.div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 blur-[200px] rounded-full pointer-events-none"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div 
        className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/8 blur-[150px] rounded-full pointer-events-none"
        animate={{ 
          scale: [1, 1.15, 1],
          opacity: [0.2, 0.4, 0.2] 
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10" ref={ref}>
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-xs font-bold tracking-widest text-indigo-400/60 uppercase block mb-6"
        >
          Empezá ahora
        </motion.span>

        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-8"
          style={{ fontFamily: "'Rubik', sans-serif" }}
        >
          Elevá el nivel de tu Organización
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-lg md:text-xl font-light text-slate-400 mb-14 max-w-2xl mx-auto leading-relaxed"
        >
          Inicie su despliegue y acceda de inmediato a nuestro motor de analíticas predictivas impulsado por IA, diseñado exclusivamente para optimizar la cultura corporativa de su firma.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row justify-center items-center gap-6"
        >
          <motion.button 
            whileHover={{ y: -3, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)" }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/auth/portal')}
            className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold tracking-widest uppercase transition-colors w-full sm:w-auto rounded-sm border border-indigo-500"
          >
            Configurar Empresa
          </motion.button>
          <motion.button 
            whileHover={{ x: 5 }}
            onClick={() => navigate('/auth/portal')}
            className="text-sm font-bold tracking-widest text-slate-400 hover:text-white transition-colors flex items-center uppercase"
          >
            Ingresar como Colaborador <span className="ml-2">→</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
