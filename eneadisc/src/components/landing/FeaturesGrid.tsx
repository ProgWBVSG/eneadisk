import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const features = [
  {
    title: 'Analíticas Gerenciales',
    category: 'Métricas',
    description: 'Tableros de control sobrios con índices de productividad, burn-out y compatibilidad operativa analizados retrospectivamente y en tiempo real.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    )
  },
  {
    title: 'Inteligencia Aplicada (IA)',
    category: 'Sistemas',
    description: 'Motor conversacional B2B que procesa los datos del organigrama para entregar resoluciones precisas sobre el comportamiento y management del capital humano.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
      </svg>
    )
  },
  {
    title: 'Topología Organizacional',
    category: 'Estructura',
    description: 'Visualización clara del entramado de personalidades en cada sector de su compañía, revelando asimetrías de roles y déficits estructurales.',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    )
  }
];

const FeatureCard: React.FC<{ feature: typeof features[0]; index: number }> = ({ feature, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 60, rotateX: 15 }}
      animate={isInView ? { opacity: 1, y: 0, rotateX: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.15, ease: "easeOut" }}
      whileHover={{ 
        y: -10, 
        boxShadow: "0 25px 50px rgba(99, 102, 241, 0.15)",
        transition: { duration: 0.3 }
      }}
      className="group cursor-default h-full bg-[#0f1a3a] border border-white/10 rounded-xl p-8 backdrop-blur-sm"
      style={{ perspective: "1000px" }}
    >
      {/* Icon */}
      <motion.div 
        className="w-14 h-14 rounded-lg bg-indigo-500/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400 mb-6"
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ duration: 0.3 }}
      >
        {feature.icon}
      </motion.div>

      <span className="text-xs font-bold tracking-widest text-indigo-400/70 uppercase block mb-3">{feature.category}</span>
      <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
      <p className="text-slate-400 font-light leading-relaxed text-sm">
        {feature.description}
      </p>

      {/* Bottom accent line */}
      <motion.div 
        className="mt-6 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: index * 0.15 + 0.5 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.div>
  );
};

export const FeaturesGrid: React.FC = () => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-100px" });

  return (
    <section className="py-32 bg-[#0b132b] relative overflow-hidden" id="platform">
      {/* Background accents */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-600/5 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div 
          ref={headerRef}
          initial={{ opacity: 0, y: 30 }}
          animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <span className="text-xs font-bold tracking-widest text-indigo-400/60 uppercase block mb-4">Plataforma</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white" style={{ fontFamily: "'Rubik', sans-serif" }}>
            Arquitectura de la Plataforma
          </h2>
          <motion.div 
            className="h-[1px] w-full bg-gradient-to-r from-white/20 to-transparent mt-8"
            initial={{ scaleX: 0 }}
            animate={headerInView ? { scaleX: 1 } : {}}
            transition={{ duration: 1.2, delay: 0.3 }}
            style={{ transformOrigin: "left" }}
          />
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};
