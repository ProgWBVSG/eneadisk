import os

def create_file(filepath, content):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created file: {filepath}")

def main():
    project_root = os.path.join(os.getcwd(), "eneadisc")
    
    # --- 1. Navbar Component ---
    create_file(os.path.join(project_root, "src/components/layout/Navbar.tsx"), """
import React from 'react';

export const Navbar: React.FC = () => {
  return (
    <nav className="w-full bg-gradient-to-r from-blue-900 to-blue-800 text-white py-3 px-6 shadow-md">
      <div className="container mx-auto text-center">
        <h1 className="text-lg font-semibold tracking-wide">BIENVENIDOS A ENEADISC</h1>
      </div>
    </nav>
  );
};
""")

    # --- 2. Footer Component ---
    create_file(os.path.join(project_root, "src/components/layout/Footer.tsx"), """
import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-800 text-slate-300 py-6 px-6 mt-auto">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
        <div className="text-center md:text-left">
          <p className="text-slate-400">&copy; 2026 ENEADISC. Todos los derechos reservados.</p>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-white transition-colors">Ayuda</a>
          <a href="#" className="hover:text-white transition-colors">Políticas de Privacidad</a>
          <a href="#" className="hover:text-white transition-colors">Términos de Uso</a>
          <a href="#" className="hover:text-white transition-colors">Contacto</a>
        </div>
      </div>
    </footer>
  );
};
""")

    # --- 3. Update EntryLayout to include Navbar and Footer ---
    create_file(os.path.join(project_root, "src/layouts/EntryLayout.tsx"), """
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const EntryLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
""")

    # --- 4. Refactor Landing Page with Login/Signup Options ---
    create_file(os.path.join(project_root, "src/pages/entry/LandingSplit.tsx"), """
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingSplit: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);

  const leftWidth = hoveredSide === 'left' ? '60%' : hoveredSide === 'right' ? '40%' : '50%';
  const rightWidth = hoveredSide === 'right' ? '60%' : hoveredSide === 'left' ? '40%' : '50%';

  return (
    <div className="flex h-full w-full flex-col md:flex-row overflow-hidden">
      {/* Left Side - Company */}
      <div
        className="relative flex flex-col items-center justify-center bg-slate-900 text-white p-8 transition-all duration-500 ease-in-out"
        style={{ width: window.innerWidth > 768 ? leftWidth : '100%' }}
        onMouseEnter={() => setHoveredSide('left')}
        onMouseLeave={() => setHoveredSide(null)}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-slate-900/80 pointer-events-none" />
        <div className="z-10 text-center max-w-md space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-800/30 backdrop-blur-sm border border-blue-700">
            <Building2 size={40} className="text-blue-200" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-white">
            Para Empresas
          </h2>
          <p className="text-lg text-slate-300">
            Entendé tu organización. Toma decisiones basadas en datos reales sobre tu cultura y talento.
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              variant="secondary" 
              size="lg"
              onClick={() => navigate('/auth/company/signup')}
            >
              Crear Cuenta
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              onClick={() => navigate('/auth/company/login')}
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Right Side - Employee */}
      <div
        className="relative flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-8 border-l border-slate-200 transition-all duration-500 ease-in-out"
        style={{ width: window.innerWidth > 768 ? rightWidth : '100%' }}
        onMouseEnter={() => setHoveredSide('right')}
        onMouseLeave={() => setHoveredSide(null)}
      >
         <div className="absolute inset-0 bg-gradient-to-tl from-amber-50 to-white pointer-events-none" />
        <div className="z-10 text-center max-w-md space-y-6">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 border border-amber-200">
            <Users size={40} className="text-amber-700" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl text-slate-900">
            Para Colaboradores
          </h2>
          <p className="text-lg text-slate-600">
            Descubrí tus fortalezas. Unite a tu equipo y comenzá tu evaluación.
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <Button 
              variant="primary" 
              size="lg"
              className="bg-amber-500 hover:bg-amber-600 border-none text-white shadow-md"
              onClick={() => navigate('/auth/employee/signup')}
            >
              Registrarme con Código
            </Button>
            <Button 
              variant="outline" 
              size="lg"
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
""")

    # --- 5. Company Login Page ---
    create_file(os.path.join(project_root, "src/pages/auth/company/CompanyLogin.tsx"), """
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Building2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginData = z.infer<typeof loginSchema>;

export const CompanyLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginData>({ 
    resolver: zodResolver(loginSchema) 
  });

  const onSubmit = (data: LoginData) => {
    // Mock authentication check
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === data.email && user.role === 'company_admin') {
        login(user);
        navigate('/dashboard/company');
        return;
      }
    }
    
    setError('email', { message: 'Credenciales incorrectas' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <Building2 size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h1>
          <p className="text-slate-500">Empresa</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Contraseña" type="password" {...register("password")} error={errors.password?.message} />
          <Button type="submit" className="w-full" size="lg">Ingresar</Button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => navigate('/auth/company/signup')} 
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            ¿No tenés cuenta? Registrate aquí
          </button>
        </div>
      </div>
    </div>
  );
};
""")

    # --- 6. Enhanced Company Signup ---
    create_file(os.path.join(project_root, "src/pages/auth/company/CompanySignup.tsx"), """
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ChevronRight, ChevronLeft, Building2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const step1Schema = z.object({
  companyName: z.string().min(2, "Nombre de empresa requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

const step2Schema = z.object({
  industry: z.string().min(2, "Industria requerida"),
  size: z.string().min(1, "Selecciona un tamaño"),
  country: z.string().min(2, "País requerido"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export const CompanySignup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data>>({});

  const { register: register1, handleSubmit: handleSubmit1, formState: { errors: errors1 } } = useForm<Step1Data>({ 
    resolver: zodResolver(step1Schema) 
  });
  const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 } } = useForm<Step2Data>({ 
    resolver: zodResolver(step2Schema) 
  });

  const onStep1Submit = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const onStep2Submit = (data: Step2Data) => {
    const finalData = { ...formData, ...data };
    
    const companyId = Math.random().toString(36).substring(7);
    const inviteCode = "ENEA-" + Math.floor(1000 + Math.random() * 9000);
    const userId = 'admin-' + Math.random().toString(36).substring(7);
    
    const newUser = {
      id: userId,
      role: 'company_admin' as const,
      companyId: companyId,
      name: finalData.companyName,
      email: finalData.email
    };

    login(newUser);
    localStorage.setItem(`company_${companyId}_code`, inviteCode);
    
    alert(`¡Cuenta creada exitosamente!\\n\\nTu código de invitación es: ${inviteCode}\\n\\nCompártelo con tu equipo.`);
    navigate('/dashboard/company');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <Building2 size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Crear Cuenta Empresa</h1>
          <p className="text-slate-500">Paso {step} de 2</p>
        </div>

        {step === 1 && (
          <form onSubmit={handleSubmit1(onStep1Submit)} className="space-y-4">
            <Input label="Nombre de la Empresa" {...register1("companyName")} error={errors1.companyName?.message} />
            <Input label="Email Corporativo" type="email" {...register1("email")} error={errors1.email?.message} />
            <Input label="Teléfono" type="tel" {...register1("phone")} error={errors1.phone?.message} />
            <Input label="Contraseña" type="password" {...register1("password")} error={errors1.password?.message} />
            <Input label="Confirmar Contraseña" type="password" {...register1("confirmPassword")} error={errors1.confirmPassword?.message} />
            <Button type="submit" className="w-full" size="lg">Siguiente <ChevronRight className="ml-2 h-4 w-4" /></Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit2(onStep2Submit)} className="space-y-4">
            <Input label="Industria / Sector" {...register2("industry")} error={errors2.industry?.message} />
            <Input label="País" {...register2("country")} error={errors2.country?.message} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tamaño del Equipo</label>
              <select {...register2("size")} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                <option value="">Selecciona...</option>
                <option value="1-10">1-10 empleados</option>
                <option value="11-50">11-50 empleados</option>
                <option value="51-200">51-200 empleados</option>
                <option value="200+">200+ empleados</option>
              </select>
              {errors2.size && <p className="text-xs text-red-500">{errors2.size.message}</p>}
            </div>
            
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3">
                <ChevronLeft className="mr-2 h-4 w-4" /> Atrás
              </Button>
              <Button type="submit" className="w-2/3">Finalizar</Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
""")

    # --- 7. Employee Login Page ---
    create_file(os.path.join(project_root, "src/pages/auth/employee/EmployeeLogin.tsx"), """
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const loginSchema = z.object({
  identifier: z.string().min(1, "Email o teléfono requerido"),
  password: z.string().min(1, "Contraseña requerida"),
});

type LoginData = z.infer<typeof loginSchema>;

export const EmployeeLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginData>({ 
    resolver: zodResolver(loginSchema) 
  });

  const onSubmit = (data: LoginData) => {
    console.log("Employee login attempt:", data);
    
    // Mock authentication
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.role === 'employee') {
        login(user);
        navigate('/dashboard/employee');
        return;
      }
    }
    
    setError('identifier', { message: 'Credenciales incorrectas' });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Users size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Iniciar Sesión</h1>
        <p className="text-slate-500 mb-8">Colaborador</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input 
            label="Email o Teléfono" 
            {...register("identifier")} 
            error={errors.identifier?.message}
          />
          <Input 
            label="Contraseña" 
            type="password"
            {...register("password")} 
            error={errors.password?.message}
          />
          <Button type="submit" size="lg" className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white">
            Ingresar
          </Button>
        </form>

        <button 
          onClick={() => navigate('/auth/employee/signup')} 
          className="mt-6 text-sm text-amber-600 hover:text-amber-700 underline"
        >
          ¿No tenés cuenta? Registrate con código
        </button>
      </div>
    </div>
  );
};
""")

    # --- 8. Employee Signup (Code-based) ---
    create_file(os.path.join(project_root, "src/pages/auth/employee/EmployeeSignup.tsx"), """
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const signupSchema = z.object({
  code: z.string().min(6, "El código debe tener al menos 6 caracteres"),
  name: z.string().min(2, "Nombre requerido"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(10, "Teléfono inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type SignupData = z.infer<typeof signupSchema>;

export const EmployeeSignup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupData>({
    resolver: zodResolver(signupSchema)
  });

  const onSubmit = async (data: SignupData) => {
    console.log("Employee signup with data:", data);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In real app, validate code against backend
    const newUser = {
      id: 'emp-' + Math.random().toString(36).substring(7),
      role: 'employee' as const,
      companyId: 'mock-company-id',
      name: data.name,
      email: data.email
    };

    login(newUser);
    navigate('/dashboard/employee');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Users size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Crear Cuenta</h1>
        <p className="text-slate-500 mb-8">Ingresa el código de invitación de tu empresa</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <Input 
            label="Código de Empresa" 
            {...register("code")} 
            placeholder="ENEA-1234"
            className="text-center uppercase"
            error={errors.code?.message}
          />
          <Input label="Nombre Completo" {...register("name")} error={errors.name?.message} />
          <Input label="Email" type="email" {...register("email")} error={errors.email?.message} />
          <Input label="Teléfono" type="tel" {...register("phone")} error={errors.phone?.message} />
          <Input label="Contraseña" type="password" {...register("password")} error={errors.password?.message} />
          <Input label="Confirmar Contraseña" type="password" {...register("confirmPassword")} error={errors.confirmPassword?.message} />
          
          <Button type="submit" size="lg" className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white mt-6" isLoading={isSubmitting}>
            Crear Cuenta
          </Button>
        </form>

        <button onClick={() => navigate('/auth/employee/login')} className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline">
          ¿Ya tenés cuenta? Inicia sesión
        </button>
      </div>
    </div>
  );
};
""")

    # --- 9. Update App.tsx with new routes ---
    create_file(os.path.join(project_root, "src/App.tsx"), """
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EntryLayout } from './layouts/EntryLayout';
import { LandingSplit } from './pages/entry/LandingSplit';
import { CompanyLogin } from './pages/auth/company/CompanyLogin';
import { CompanySignup } from './pages/auth/company/CompanySignup';
import { EmployeeLogin } from './pages/auth/employee/EmployeeLogin';
import { EmployeeSignup } from './pages/auth/employee/EmployeeSignup';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route element={<EntryLayout />}>
        <Route path="/" element={<LandingSplit />} />
        
        {/* Company Routes */}
        <Route path="/auth/company/login" element={<CompanyLogin />} />
        <Route path="/auth/company/signup" element={<CompanySignup />} />
        
        {/* Employee Routes */}
        <Route path="/auth/employee/login" element={<EmployeeLogin />} />
        <Route path="/auth/employee/signup" element={<EmployeeSignup />} />
      </Route>
      
      {/* Protected Dashboards */}
      <Route path="/dashboard/company" element={
        <ProtectedRoute>
          <div className="p-8">
            <h1 className="text-2xl font-bold">Panel de Empresa</h1>
            <p className="text-slate-600 mt-2">Bienvenido al dashboard de gestión.</p>
          </div>
        </ProtectedRoute>
      } />
      
      <Route path="/dashboard/employee" element={
        <ProtectedRoute>
          <div className="p-8">
            <h1 className="text-2xl font-bold">Panel de Colaborador</h1>
            <p className="text-slate-600 mt-2">Bienvenido a tu evaluación.</p>
          </div>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
""")
    
    print("UI Enhancement Implementation Complete.")

if __name__ == "__main__":
    main()
