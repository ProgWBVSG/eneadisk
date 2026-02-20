
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { DemoLoginModal } from '../../components/DemoLoginModal';

export const LandingSplit: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="flex flex-1 w-full flex-col md:flex-row">
      {/* Left Side - Company */}
      <div
        className={`relative flex flex-col items-center justify-center bg-slate-900 text-white p-6 md:p-8 transition-all duration-500 ease-in-out min-h-[50vh] md:min-h-0 ${hoveredSide === 'left' ? 'md:w-[60%]' : hoveredSide === 'right' ? 'md:w-[40%]' : 'md:w-[50%]'
          }`}
        onMouseEnter={() => setHoveredSide('left')}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900/80 pointer-events-none" />
        <div className="z-10 text-center max-w-md space-y-4 md:space-y-6 w-full px-4">
          <div className="mx-auto flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-blue-800/30 backdrop-blur-sm border border-blue-700">
            <Building2 size={32} className="text-blue-200 md:w-10 md:h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-white">
            Para Empresas
          </h2>
          <p className="text-base md:text-lg text-slate-300">
            Entendé tu organización. Toma decisiones basadas en datos reales.
          </p>
          <div className="flex flex-col gap-3 mt-4 md:mt-6">
            <Button
              variant="secondary"
              size="lg"
              className="w-full min-h-[48px]"
              onClick={() => navigate('/auth/company/signup')}
            >
              Crear Cuenta
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20 w-full min-h-[48px]"
              onClick={() => navigate('/auth/company/login')}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-white/5 border-white/20 text-white/80 hover:bg-white/10 w-full text-sm"
              onClick={() => setShowDemoModal(true)}
            >
              🧪 Sesión de prueba
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Employee */}
      <div
        className={`relative flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-6 md:p-8 md:border-l border-slate-200 transition-all duration-500 ease-in-out min-h-[50vh] md:min-h-0 ${hoveredSide === 'right' ? 'md:w-[60%]' : hoveredSide === 'left' ? 'md:w-[40%]' : 'md:w-[50%]'
          }`}
        onMouseEnter={() => setHoveredSide('right')}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <div className="absolute inset-0 bg-gradient-to-tl from-amber-50 to-white pointer-events-none" />
        <div className="z-10 text-center max-w-md space-y-4 md:space-y-6 w-full px-4">
          <div className="mx-auto flex h-16 w-16 md:h-20 md:w-20 items-center justify-center rounded-full bg-amber-100 border border-amber-200">
            <Users size={32} className="text-amber-700 md:w-10 md:h-10" />
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            Para Colaboradores
          </h2>
          <p className="text-base md:text-lg text-slate-600">
            Descubrí tus fortalezas. Unite a tu equipo y comenzá tu evaluación.
          </p>
          <div className="flex flex-col gap-3 mt-4 md:mt-6">
            <Button
              variant="primary"
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 border-none text-white shadow-md w-full min-h-[48px]"
              onClick={() => navigate('/auth/employee/signup')}
            >
              Registrarme con Código
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full min-h-[48px]"
              onClick={() => navigate('/auth/employee/login')}
            >
              Iniciar Sesión
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-amber-300 text-amber-800 hover:bg-amber-50 w-full text-sm"
              onClick={() => setShowDemoModal(true)}
            >
              🧪 Sesión de prueba
            </Button>
          </div>
        </div>
      </div>

      {/* Demo Login Modal */}
      <DemoLoginModal isOpen={showDemoModal} onClose={() => setShowDemoModal(false)} />
    </div>
  );
};
