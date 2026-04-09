import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingSplit: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-1 w-full flex-col md:flex-row min-h-screen">
      {/* Left Side - Company */}
      <div className="relative flex flex-col items-center justify-center bg-slate-900 text-white p-6 md:p-16 min-h-[50vh] md:min-h-0 md:w-1/2 transition-all duration-500 ease-in-out hover:md:w-[55%] group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-slate-900/90 pointer-events-none" />
        <div className="z-10 text-center max-w-md space-y-6 w-full px-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-800/30 backdrop-blur-sm border border-blue-700">
            <Building2 size={36} className="text-blue-200" />
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-white">
              Para Empresas
            </h2>
            <p className="text-lg text-slate-300 mt-3">
              Ingresa al panel de control de tu organización.
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-6">
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
          </div>
        </div>
      </div>

      {/* Right Side - Employee */}
      <div className="relative flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-6 md:p-16 md:border-l border-slate-200 min-h-[50vh] md:min-h-0 md:w-1/2 transition-all duration-500 ease-in-out hover:md:w-[55%]">
        <div className="absolute inset-0 bg-gradient-to-tl from-amber-50 to-white pointer-events-none" />
        <div className="z-10 text-center max-w-md space-y-6 w-full px-4">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 border border-amber-200">
            <Users size={36} className="text-amber-700" />
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
              Para Colaboradores
            </h2>
            <p className="text-lg text-slate-600 mt-3">
              Accedé a tu perfil y herramientas.
            </p>
          </div>
          <div className="flex flex-col gap-3 mt-6">
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
          </div>
        </div>
      </div>
    </div>
  );
};
