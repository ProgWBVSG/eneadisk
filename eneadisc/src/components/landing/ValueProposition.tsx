import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const pillars = [
  {
    num: '01',
    title: 'Mapeo Psicométrico',
    description: 'Estandarizamos la estructura psicológica de sus equipos utilizando los marcos analíticos probados de Eneagrama y DISC, transformando perfiles abstractos en datos cuantitativos procesables.'
  },
  {
    num: '02',
    title: 'Ingeniería Predictiva',
    description: 'Anticipamos la rotación (desgaste) y los conflictos de liderazgo antes de que se manifiesten. Los algoritmos de mapeo aseguran emparejamientos de alta sinergia entre roles e individuos.'
  },
  {
    num: '03',
    title: 'Direccionamiento Asistido (IA)',
    description: 'Proporciona a directores y gerentes tácticas de management personalizadas en tiempo real. Obtenga consejos específicos de liderazgo adaptados a la matriz de personalidad exacta de cada empleado.'
  },
  {
    num: '04',
    title: 'Adopción sin Fricción',
    description: 'Diseñado para integrarse al flujo de trabajo corporativo con check-ins no intrusivos que mantienen a la inteligencia organizacional permanentemente actualizada.'
  }
];

const PillarCard: React.FC<{ pillar: typeof pillars[0]; index: number }> = ({ pillar, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: index * 0.12, ease: "easeOut" }}
      className="group relative"
    >
      {/* Number accent */}
      <motion.span 
        className="text-7xl font-black text-white/[0.03] absolute -top-6 -left-2 select-none pointer-events-none"
        style={{ fontFamily: "'Rubik', sans-serif" }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={isInView ? { opacity: 1, scale: 1 } : {}}
        transition={{ duration: 0.5, delay: index * 0.12 + 0.3 }}
      >
        {pillar.num}
      </motion.span>

      <span className="text-xs font-bold tracking-widest text-indigo-400/60 uppercase block mb-3">{pillar.num} / ENFOQUE ENEATEAMS</span>
      <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-indigo-300 transition-colors duration-300 cursor-default">{pillar.title}</h3>
      <p className="text-slate-400 font-light leading-relaxed text-sm">
        {pillar.description}
      </p>

      {/* Hover line */}
      <motion.div 
        className="mt-5 h-[1px] bg-gradient-to-r from-indigo-500/50 to-transparent"
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: index * 0.12 + 0.5 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.div>
  );
};

export const ValueProposition: React.FC = () => {
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: "-80px" });

  return (
    <section className="py-32 bg-[#0d1730] relative overflow-hidden border-t border-white/5" id="solutions">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-[600px] h-[600px] bg-purple-700/5 blur-[180px] rounded-full pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 md:gap-24 items-start">
          
          <div className="lg:w-1/3 lg:sticky lg:top-32">
            <motion.div
              ref={headerRef}
              initial={{ opacity: 0, y: 30 }}
              animate={headerInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <span className="text-xs font-bold tracking-widest text-indigo-400/60 uppercase block mb-4">Soluciones</span>
              <h2 
                className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6"
                style={{ fontFamily: "'Rubik', sans-serif" }}
              >
                El Riesgo del Instinto
              </h2>
              <p className="text-slate-400 font-light leading-relaxed mb-8">
                El management tradicional confía ciegamente en la intuición para construir y alinear talento. Este enfoque carece de estructura, provocando fricciones de equipo invisibles, burnout silencioso y fugas de capital humano valioso.
              </p>
              <motion.div 
                className="h-[2px] w-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                initial={{ scaleX: 0 }}
                animate={headerInView ? { scaleX: 1 } : {}}
                transition={{ duration: 0.8, delay: 0.4 }}
                style={{ transformOrigin: "left" }}
              />
            </motion.div>
          </div>

          <div className="lg:w-2/3 grid sm:grid-cols-2 gap-x-12 gap-y-16">
            {pillars.map((pillar, index) => (
              <PillarCard key={index} pillar={pillar} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
