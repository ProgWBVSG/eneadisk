import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import Enneagram from "../ui/Enneagram";
import { cn } from "../../lib/utils";
import { useNavigate } from "react-router-dom";

interface ScrollSection {
  id: string;
  badge?: string;
  title: string;
  subtitle?: string;
  description: string;
  align?: 'left' | 'center' | 'right';
  features?: { title: string; description: string }[];
  actions?: { label: string; variant: 'primary' | 'secondary'; path?: string }[];
}

interface ScrollEnneagramProps {
  sections: ScrollSection[];
  enneagramConfig?: {
    positions: { top: string; left: string; scale: number }[];
  };
  className?: string;
}

const defaultConfig = {
  positions: [
    { top: "50%", left: "75%", scale: 1.4 },
    { top: "25%", left: "50%", scale: 0.9 },
    { top: "15%", left: "85%", scale: 2 },
    { top: "50%", left: "50%", scale: 1.8 },
  ]
};

const parsePercent = (str: string): number => parseFloat(str.replace('%', ''));

function ScrollEnneagram({ sections, enneagramConfig = defaultConfig, className }: ScrollEnneagramProps) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [enneagramTransform, setEnneagramTransform] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameId = useRef<number>();

  const calculatedPositions = useMemo(() => {
    return enneagramConfig.positions.map(pos => ({
      top: parsePercent(pos.top),
      left: parsePercent(pos.left),
      scale: pos.scale
    }));
  }, [enneagramConfig.positions]);

  const updateScrollPosition = useCallback(() => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.min(Math.max(scrollTop / docHeight, 0), 1);
    setScrollProgress(progress);

    const viewportCenter = window.innerHeight / 2;
    let newActiveSection = 0;
    let minDistance = Infinity;

    sectionRefs.current.forEach((ref, index) => {
      if (ref) {
        const rect = ref.getBoundingClientRect();
        const sectionCenter = rect.top + rect.height / 2;
        const distance = Math.abs(sectionCenter - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          newActiveSection = index;
        }
      }
    });

    const currentPos = calculatedPositions[newActiveSection];
    if (currentPos) {
      const transform = `translate3d(${currentPos.left}vw, ${currentPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${currentPos.scale}, ${currentPos.scale}, 1)`;
      setEnneagramTransform(transform);
    }

    setActiveSection(newActiveSection);
  }, [calculatedPositions]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        animationFrameId.current = requestAnimationFrame(() => {
          updateScrollPosition();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollPosition();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
    };
  }, [updateScrollPosition]);

  useEffect(() => {
    const initialPos = calculatedPositions[0];
    if (initialPos) {
      setEnneagramTransform(
        `translate3d(${initialPos.left}vw, ${initialPos.top}vh, 0) translate3d(-50%, -50%, 0) scale3d(${initialPos.scale}, ${initialPos.scale}, 1)`
      );
    }
  }, [calculatedPositions]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full max-w-screen overflow-x-hidden min-h-screen text-white", className)}
      style={{ background: "linear-gradient(180deg, #060a18 0%, #0b132b 25%, #0f1940 50%, #0b132b 75%, #060a18 100%)" }}
    >
      {/* ═══ Ambient Background Layer ═══ */}
      
      {/* Soft gradient glows that shift with scroll */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Primary glow - moves down-right as you scroll */}
        <div 
          className="absolute w-[600px] h-[600px] rounded-full transition-all duration-[2000ms] ease-out"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
            top: `${15 + scrollProgress * 40}%`,
            left: `${10 + scrollProgress * 30}%`,
            filter: "blur(80px)",
          }}
        />
        {/* Secondary glow - moves opposite */}
        <div 
          className="absolute w-[500px] h-[500px] rounded-full transition-all duration-[2500ms] ease-out"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)",
            top: `${60 - scrollProgress * 30}%`,
            right: `${5 + scrollProgress * 20}%`,
            filter: "blur(100px)",
          }}
        />
        {/* Tertiary accent - subtle teal */}
        <div 
          className="absolute w-[400px] h-[400px] rounded-full transition-all duration-[3000ms] ease-out"
          style={{
            background: "radial-gradient(circle, rgba(56, 189, 248, 0.04) 0%, transparent 70%)",
            bottom: `${10 + scrollProgress * 25}%`,
            left: `${50 - scrollProgress * 15}%`,
            filter: "blur(120px)",
          }}
        />
      </div>

      {/* Floating particles / spores */}
      <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
        <style>{`
          @keyframes floatUp1 { 0% { transform: translateY(100vh) translateX(0); opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { transform: translateY(-10vh) translateX(30px); opacity: 0; } }
          @keyframes floatUp2 { 0% { transform: translateY(100vh) translateX(0); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.6; } 100% { transform: translateY(-10vh) translateX(-20px); opacity: 0; } }
          @keyframes floatUp3 { 0% { transform: translateY(100vh) translateX(0); opacity: 0; } 15% { opacity: 0.6; } 85% { opacity: 0.4; } 100% { transform: translateY(-10vh) translateX(15px); opacity: 0; } }
          @keyframes drift { 0%,100% { transform: translateX(0) translateY(0); } 25% { transform: translateX(10px) translateY(-5px); } 50% { transform: translateX(-5px) translateY(-10px); } 75% { transform: translateX(8px) translateY(-3px); } }
        `}</style>
        {/* Rising spores */}
        {[
          { left: '8%', size: 3, dur: 18, delay: 0, anim: 'floatUp1' },
          { left: '15%', size: 2, dur: 22, delay: 3, anim: 'floatUp2' },
          { left: '25%', size: 2.5, dur: 20, delay: 7, anim: 'floatUp3' },
          { left: '35%', size: 1.5, dur: 25, delay: 2, anim: 'floatUp1' },
          { left: '45%', size: 3, dur: 19, delay: 5, anim: 'floatUp2' },
          { left: '55%', size: 2, dur: 23, delay: 8, anim: 'floatUp3' },
          { left: '65%', size: 2.5, dur: 17, delay: 1, anim: 'floatUp1' },
          { left: '75%', size: 1.5, dur: 21, delay: 6, anim: 'floatUp2' },
          { left: '85%', size: 2, dur: 24, delay: 4, anim: 'floatUp3' },
          { left: '92%', size: 3, dur: 20, delay: 9, anim: 'floatUp1' },
        ].map((p, i) => (
          <div
            key={`spore-${i}`}
            className="absolute rounded-full"
            style={{
              left: p.left,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: `radial-gradient(circle, rgba(139, 92, 246, ${0.4 + Math.random() * 0.3}) 0%, rgba(99, 102, 241, 0.1) 100%)`,
              animation: `${p.anim} ${p.dur}s linear infinite`,
              animationDelay: `${p.delay}s`,
              boxShadow: `0 0 ${p.size * 3}px rgba(99, 102, 241, 0.2)`,
            }}
          />
        ))}
        {/* Static drifting orbs (always visible, gentle) */}
        {[
          { top: '20%', left: '12%', size: 4, opacity: 0.15, dur: 12 },
          { top: '40%', left: '80%', size: 3, opacity: 0.12, dur: 15 },
          { top: '65%', left: '30%', size: 5, opacity: 0.1, dur: 18 },
          { top: '80%', left: '70%', size: 3, opacity: 0.15, dur: 14 },
          { top: '10%', left: '60%', size: 4, opacity: 0.08, dur: 20 },
        ].map((orb, i) => (
          <div
            key={`orb-${i}`}
            className="absolute rounded-full"
            style={{
              top: orb.top,
              left: orb.left,
              width: `${orb.size}px`,
              height: `${orb.size}px`,
              background: `rgba(147, 130, 255, ${orb.opacity})`,
              animation: `drift ${orb.dur}s ease-in-out infinite`,
              animationDelay: `${i * 2}s`,
              boxShadow: `0 0 ${orb.size * 4}px rgba(147, 130, 255, ${orb.opacity})`,
            }}
          />
        ))}
      </div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-0.5 bg-white/5 z-50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-700 will-change-transform shadow-sm"
          style={{
            transform: `scaleX(${scrollProgress})`,
            transformOrigin: 'left center',
            transition: 'transform 0.15s ease-out',
            filter: 'drop-shadow(0 0 4px rgba(99, 102, 241, 0.5))'
          }}
        />
      </div>

      {/* Side Navigation Dots */}
      <div className="hidden sm:flex fixed right-4 lg:right-8 top-1/2 -translate-y-1/2 z-40">
        <div className="space-y-4 lg:space-y-6">
          {sections.map((section, index) => (
            <div key={index} className="relative group">
              {/* Label on hover */}
              <div className={cn(
                "absolute right-6 lg:right-8 top-1/2 -translate-y-1/2",
                "px-3 py-1.5 rounded-lg text-xs font-bold tracking-widest uppercase whitespace-nowrap",
                "bg-[#0b132b]/95 backdrop-blur-md border border-white/10 shadow-xl",
                "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              )}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  <span className="text-slate-300">{section.badge || `Sección ${index + 1}`}</span>
                </div>
              </div>

              <button
                onClick={() => sectionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                className={cn(
                  "relative w-2.5 h-2.5 lg:w-3 lg:h-3 rounded-full border-2 transition-all duration-300 hover:scale-125",
                  activeSection === index
                    ? "bg-indigo-500 border-indigo-400 shadow-lg shadow-indigo-500/30"
                    : "bg-transparent border-slate-600 hover:border-indigo-400/60 hover:bg-indigo-500/10"
                )}
              />
            </div>
          ))}
        </div>
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent -translate-x-1/2 -z-10" />
      </div>

      {/* Floating Enneagram */}
      <div
        className="fixed z-10 pointer-events-none will-change-transform transition-all duration-[1400ms] ease-[cubic-bezier(0.23,1,0.32,1)]"
        style={{
          transform: enneagramTransform,
          filter: `opacity(${activeSection === sections.length - 1 ? 0.3 : 0.7})`,
        }}
      >
        <div className="scale-75 sm:scale-90 lg:scale-100">
          <Enneagram />
        </div>
      </div>

      {/* Sections */}
      {sections.map((section, index) => (
        <section
          key={section.id}
          ref={(el) => { sectionRefs.current[index] = el; }}
          className={cn(
            "relative min-h-screen flex flex-col justify-center px-6 md:px-8 lg:px-12 z-20 py-16 lg:py-20",
            "w-full max-w-full overflow-hidden",
            section.align === 'center' && "items-center text-center",
            section.align === 'right' && "items-end text-right",
            section.align !== 'center' && section.align !== 'right' && "items-start text-left"
          )}
        >
          <div className="w-full max-w-sm sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-5xl">
            {/* Badge */}
            {section.badge && (
              <span className="inline-block text-xs font-bold tracking-widest text-indigo-400/60 uppercase mb-6">{section.badge}</span>
            )}

            {/* Title */}
            <h1 className={cn(
              "font-bold mb-6 sm:mb-8 leading-[1.05] tracking-tight",
              index === 0
                ? "text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
                : "text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl"
            )} style={{ fontFamily: "'Rubik', sans-serif", textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}>
              {section.subtitle ? (
                <div className="space-y-1 sm:space-y-2">
                  <div className="bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">{section.title}</div>
                  <div className="text-slate-400 text-[0.6em] sm:text-[0.7em] font-medium tracking-wider">{section.subtitle}</div>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">{section.title}</div>
              )}
            </h1>

            {/* Description */}
            <div className={cn(
              "text-slate-400 leading-relaxed mb-8 sm:mb-10 text-base sm:text-lg lg:text-xl font-light",
              section.align === 'center' ? "max-w-3xl mx-auto" : "max-w-2xl"
            )}>
              <p className="mb-4">{section.description}</p>
              {index === 0 && (
                <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 mt-6">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    <span>Experiencia Interactiva</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                    <span>Scrolleá para Explorar</span>
                  </div>
                </div>
              )}
            </div>

            {/* Features */}
            {section.features && (
              <div className="grid gap-4 mb-10">
                {section.features.map((feature, fi) => (
                  <div
                    key={feature.title}
                    className="group p-5 lg:p-6 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm hover:bg-white/[0.06] transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:border-indigo-500/20 hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-2 h-2 rounded-full bg-indigo-500/60 mt-2 group-hover:bg-indigo-400 transition-colors flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white text-base sm:text-lg mb-1">{feature.title}</h3>
                        <p className="text-slate-400 leading-relaxed text-sm sm:text-base">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            {section.actions && (
              <div className={cn(
                "flex flex-col sm:flex-row flex-wrap gap-4",
                section.align === 'center' && "justify-center",
                section.align === 'right' && "justify-end",
                (!section.align || section.align === 'left') && "justify-start"
              )}>
                {section.actions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => action.path && navigate(action.path)}
                    className={cn(
                      "group relative px-8 py-4 rounded-sm font-bold tracking-widest uppercase text-sm transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto",
                      action.variant === 'primary'
                        ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30 border border-indigo-500"
                        : "border border-white/20 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-indigo-400/30 text-slate-300"
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

export default ScrollEnneagram;
