import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Navbar } from '../../components/landing/Navbar';
import { Testimonials } from '../../components/landing/Testimonials';
import ScrollEnneagram from '../../components/landing/ScrollEnneagram';

const sections = [
  {
    id: "hero",
    badge: "Bienvenido",
    title: "La Nueva Era",
    subtitle: "De los Equipos",
    description: "Transformamos la complejidad de la personalidad humana en datos estructurados y medibles. Anticipá conflictos, predecí burn-out y construí ecosistemas de trabajo excepcionales con EneaTeams.",
    align: "left" as const,
    actions: [
      { label: "Comenzar Ahora", variant: "primary" as const, path: "/auth/portal" },
      { label: "Conocer Más", variant: "secondary" as const, path: "#platform" },
    ]
  },
  {
    id: "platform",
    badge: "Plataforma",
    title: "Conectados Globalmente",
    description: "Desde cada rincón de su organización, mapeamos la red interconectada de personalidades. Cada conexión representa sinergia, cada interacción impulsa la productividad hacia territorios inexplorados.",
    align: "center" as const,
  },
  {
    id: "solutions",
    badge: "Soluciones",
    title: "Expandiendo",
    subtitle: "Posibilidades",
    description: "A medida que su organización crece, nuevos mundos de oportunidad emergen. Lo que parecía imposible ayer se convierte en la base de logros extraordinarios para sus equipos.",
    align: "left" as const,
    features: [
      { title: "Mapeo Psicométrico", description: "Estandarizamos la estructura psicológica de sus equipos utilizando Eneagrama y DISC, transformando perfiles abstractos en datos procesables." },
      { title: "Inteligencia Predictiva", description: "Anticipamos la rotación y los conflictos de liderazgo antes de que se manifiesten con algoritmos de alta sinergia." },
      { title: "Asistente IA Personalizado", description: "Motor conversacional que procesa los datos del organigrama para entregar resoluciones precisas sobre management del capital humano." }
    ]
  },
  {
    id: "future",
    badge: "El Futuro",
    title: "Su Equipo",
    subtitle: "Excepcional",
    description: "En este momento de transformación digital, no vemos solo una empresa, sino un lienzo de potencial humano infinito. Cada conexión representa esperanza, cada innovación construye puentes hacia un futuro colectivo de posibilidades ilimitadas.",
    align: "center" as const,
    actions: [
      { label: "Configurar Empresa", variant: "primary" as const, path: "/auth/portal" },
      { label: "Ingresar como Colaborador", variant: "secondary" as const, path: "/auth/portal" }
    ]
  }
];

export const HomeLanding: React.FC = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  // Si un usuario ya autenticado cae en la landing (p. ej. tras volver de
  // Google OAuth), lo mandamos a donde corresponde en vez de dejarlo acá.
  useEffect(() => {
    if (isLoading || !user) return;
    if (user.companyId) {
      navigate(user.role === 'company_admin' ? '/dashboard/company' : '/dashboard/employee', { replace: true });
    } else {
      // Sesión válida pero registro incompleto (típico de Google nuevo) →
      // el callback decide si completar como empresa o empleado.
      navigate('/auth/callback', { replace: true });
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-[#0b132b] font-sans text-white antialiased selection:bg-indigo-600 selection:text-white">
      <Navbar />
      
      <ScrollEnneagram 
        sections={sections}
        className="bg-[#0b132b]"
      />
      
      <Testimonials />
      
      {/* Footer */}
      <footer className="py-8 bg-[#080e1f] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs tracking-widest text-slate-500 uppercase">
          <p>© {new Date().getFullYear()} ENEATEAMS. TODOS LOS DERECHOS RESERVADOS.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-white transition-colors">Políticas</a>
            <a href="#" className="hover:text-white transition-colors">Términos</a>
            <a href="#" className="hover:text-white transition-colors">Contacto</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
