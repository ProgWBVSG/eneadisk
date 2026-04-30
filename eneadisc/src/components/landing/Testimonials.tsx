import React from 'react';
import { motion } from 'framer-motion';

const testimonials = [
  {
    name: 'Martín Gutiérrez',
    role: 'Director de RRHH, TechCorp',
    text: 'EneaTeams revolucionó nuestra forma de armar equipos. En 3 meses redujimos la rotación un 40%.',
    avatar: 'MG'
  },
  {
    name: 'Carolina Vásquez',
    role: 'CEO, Innovar Labs',
    text: 'Ahora entendemos por qué ciertos equipos funcionan y otros no. La IA nos da insights que antes eran imposibles.',
    avatar: 'CV'
  },
  {
    name: 'Fernando Ruiz',
    role: 'Gerente de Operaciones, Logística Sur',
    text: 'Los check-ins nos permitieron detectar burnout antes de que se convirtiera en renuncias. Herramienta esencial.',
    avatar: 'FR'
  },
  {
    name: 'Lucía Mendoza',
    role: 'VP de Talento, Grupo Nexo',
    text: 'Implementamos EneaTeams en 12 equipos. La compatibilidad entre perfiles mejoró un 65% la productividad.',
    avatar: 'LM'
  },
  {
    name: 'Alejandro Torres',
    role: 'CTO, DataFlow',
    text: 'Como CTO, necesitaba datos concretos sobre dinámica de equipo. EneaTeams me dio exactamente eso.',
    avatar: 'AT'
  },
  {
    name: 'Valentina Herrera',
    role: 'Directora, Consultoría Apex',
    text: 'Nuestros clientes corporativos quedaron impresionados con los reportes de mapeo organizacional.',
    avatar: 'VH'
  },
  {
    name: 'Ricardo Paz',
    role: 'Head of People, FinTech Plus',
    text: 'La predicción de conflictos es increíblemente precisa. Nos anticipamos a problemas que antes nos tomaban por sorpresa.',
    avatar: 'RP'
  },
  {
    name: 'Sofía Duarte',
    role: 'COO, Retail Group',
    text: 'Pasamos de gestionar personas por intuición a hacerlo con datos reales. El ROI fue inmediato.',
    avatar: 'SD'
  }
];

const TestimonialCard: React.FC<{ testimonial: typeof testimonials[0] }> = ({ testimonial }) => (
  <div className="flex-shrink-0 w-[300px] sm:w-[380px] bg-white/[0.04] border border-white/10 rounded-xl p-6 mx-3 backdrop-blur-sm hover:bg-white/[0.08] transition-colors duration-300">
    <div className="flex items-center gap-4 mb-4">
      <div className="w-11 h-11 rounded-full bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold text-sm">
        {testimonial.avatar}
      </div>
      <div>
        <p className="text-white font-semibold text-sm">{testimonial.name}</p>
        <p className="text-slate-500 text-xs">{testimonial.role}</p>
      </div>
    </div>
    <p className="text-slate-400 text-sm leading-relaxed font-light">"{testimonial.text}"</p>
    {/* Stars */}
    <div className="mt-4 flex gap-1 text-amber-400 text-xs">
      {'★★★★★'}
    </div>
  </div>
);

// Duplicate for seamless loop
const row1 = [...testimonials.slice(0, 4), ...testimonials.slice(0, 4)];
const row2 = [...testimonials.slice(4, 8), ...testimonials.slice(4, 8)];

export const Testimonials: React.FC = () => {
  return (
    <section className="py-28 bg-[#0a1128] relative overflow-hidden border-t border-white/5">
      {/* Background accent */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-indigo-700/5 blur-[180px] rounded-full pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-6 mb-16 relative z-10">
        <span className="text-xs font-bold tracking-widest text-indigo-400/60 uppercase block mb-4">Testimonios</span>
        <h2 
          className="text-4xl md:text-5xl font-bold tracking-tight text-white"
          style={{ fontFamily: "'Rubik', sans-serif" }}
        >
          Lo que dicen nuestros clientes
        </h2>
      </div>

      {/* Marquee Row 1 - moves left */}
      <div className="relative mb-6 overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a1128] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a1128] to-transparent z-10 pointer-events-none" />
        
        <motion.div
          className="flex"
          animate={{ x: ['0%', '-50%'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        >
          {row1.map((t, i) => (
            <TestimonialCard key={`r1-${i}`} testimonial={t} />
          ))}
        </motion.div>
      </div>

      {/* Marquee Row 2 - moves right */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a1128] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a1128] to-transparent z-10 pointer-events-none" />
        
        <motion.div
          className="flex"
          animate={{ x: ['-50%', '0%'] }}
          transition={{ duration: 35, repeat: Infinity, ease: 'linear' }}
        >
          {row2.map((t, i) => (
            <TestimonialCard key={`r2-${i}`} testimonial={t} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};
