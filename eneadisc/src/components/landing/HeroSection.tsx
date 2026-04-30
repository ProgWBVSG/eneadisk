import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';

export const HeroSection: React.FC = () => {
  const navigate = useNavigate();

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const textVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const buttonVariants: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.8, delay: 1, ease: "easeOut" } }
  };

  return (
    <section className="relative w-full min-h-screen bg-[#21346e] flex flex-col overflow-hidden pt-32 md:pt-48 px-6">
      {/* Background Video (Scaled to hide watermark) */}
      <motion.video 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        autoPlay 
        loop 
        muted 
        playsInline 
        className="absolute inset-0 w-full h-full object-cover z-0 scale-[1.12]"
        src="/floating-enneagram.mp4"
      />
      
      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/40 z-[1]" />

      {/* Main Content */}
      <motion.div 
        className="w-full max-w-7xl mx-auto z-[2] flex flex-col items-start"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Headline */}
        <h1 
          className="text-white font-bold uppercase leading-[0.95] tracking-[-0.04em] flex flex-col"
          style={{ fontFamily: "'Rubik', sans-serif", textShadow: '0 4px 30px rgba(0,0,0,0.7), 0 2px 8px rgba(0,0,0,0.5)' }}
        >
          <motion.span variants={textVariants} className="text-6xl md:text-8xl lg:text-[100px]">LA NUEVA ERA</motion.span>
          <motion.span variants={textVariants} className="text-6xl md:text-8xl lg:text-[100px]">DE LOS EQUIPOS</motion.span>
          <motion.span variants={textVariants} className="text-6xl md:text-8xl lg:text-[100px]">EMPIEZA HOY</motion.span>
        </h1>

        {/* Custom CTA Button */}
        <motion.button 
          variants={buttonVariants}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/auth/portal')}
          className="mt-12 relative w-[184px] h-[65px] flex items-center justify-center group drop-shadow-lg cursor-pointer"
        >
          {/* SVG Background Fill */}
          <svg 
            className="absolute inset-0 w-full h-full text-white"
            viewBox="0 0 184 65" 
            fill="currentColor" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 0H164L184 20V65H20L0 45V0Z" />
          </svg>
          
          <span 
            className="relative text-[#161a20] font-bold uppercase text-[20px]"
            style={{ fontFamily: "'Rubik', sans-serif" }}
          >
            COMENZAR
          </span>
        </motion.button>
      </motion.div>
    </section>
  );
};
