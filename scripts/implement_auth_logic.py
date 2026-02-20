import os

def create_file(filepath, content):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created file: {filepath}")

def main():
    project_root = os.path.join(os.getcwd(), "eneadisc")
    
    # --- Auth Context ---
    create_file(os.path.join(project_root, "src/context/AuthContext.tsx"), """
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  role: 'company_admin' | 'employee';
  companyId: string;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
    window.location.href = '/'; // Force refresh/redirect
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50">Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
""")

    # --- Refactor Company Register to use useAuth ---
    # We replace the file functionality but keep the UI structure
    create_file(os.path.join(project_root, "src/pages/auth/company/CompanyRegister.tsx"), """
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ChevronRight, ChevronLeft, Building2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

// Schema for Step 1
const step1Schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  companyName: z.string().min(2, "Nombre de empresa requerido"),
});

// Schema for Step 2
const step2Schema = z.object({
  industry: z.string().min(2, "Industria requerida"),
  size: z.string().min(1, "Selecciona un tamaño"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

export const CompanyRegister: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data>>({});

  const { register: register1, handleSubmit: handleSubmit1, formState: { errors: errors1 } } = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const { register: register2, handleSubmit: handleSubmit2, formState: { errors: errors2 } } = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });

  const onStep1Submit = (data: Step1Data) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const onStep2Submit = (data: Step2Data) => {
    const finalData = { ...formData, ...data };
    console.log("Registering Company:", finalData);
    
    // Mock Backend Logic
    const companyId = Math.random().toString(36).substring(7);
    const inviteCode = "ENEA-" + Math.floor(1000 + Math.random() * 9000);
    const userId = 'admin-' + Math.random().toString(36).substring(7);
    
    // Create User Object
    const newUser = {
      id: userId,
      role: 'company_admin' as const,
      companyId: companyId,
      name: finalData.companyName,
      email: finalData.email
    };

    // Save to Context & LocalStorage
    login(newUser);
    
    // Save Code for demo purposes (usually this would be in DB)
    localStorage.setItem(`company_${companyId}_code`, inviteCode);
    alert(`Cuenta creada! Guarda tu código de invitación: ${inviteCode}`);
    
    navigate('/dashboard/company'); // Redirect to dashboard
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100">
        <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <Building2 size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Registro de Empresa</h1>
            <p className="text-slate-500">Paso {step} de 2</p>
        </div>

        {step === 1 && (
            <form onSubmit={handleSubmit1(onStep1Submit)} className="space-y-4">
                <Input label="Nombre de la Empresa" {...register1("companyName")} error={errors1.companyName?.message} />
                <Input label="Email Corporativo" type="email" {...register1("email")} error={errors1.email?.message} />
                <Input label="Contraseña" type="password" {...register1("password")} error={errors1.password?.message} />
                <Button type="submit" className="w-full" size="lg">Siguiente <ChevronRight className="ml-2 h-4 w-4" /></Button>
            </form>
        )}

        {step === 2 && (
             <form onSubmit={handleSubmit2(onStep2Submit)} className="space-y-4">
                <Input label="Industria / Sector" {...register2("industry")} error={errors2.industry?.message} />
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-slate-700">Tamaño del Equipo</label>
                    <select {...register2("size")} className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none">
                        <option value="">Selecciona...</option>
                        <option value="1-10">1-10 empleados</option>
                        <option value="11-50">11-50 empleados</option>
                        <option value="50+">50+ empleados</option>
                    </select>
                    {errors2.size && <p className="text-xs text-red-500">{errors2.size.message}</p>}
                </div>
                
                <div className="flex gap-3 pt-2">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3"><ChevronLeft className="mr-2 h-4 w-4" /> Atrás</Button>
                    <Button type="submit" className="w-2/3">Finalizar Registro</Button>
                </div>
            </form>
        )}
      </div>
    </div>
  );
};
""")

    # --- Refactor Employee Join to use useAuth ---
    create_file(os.path.join(project_root, "src/pages/auth/employee/EmployeeJoin.tsx"), """
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Users } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const joinSchema = z.object({
  code: z.string().length(6, "El código debe tener 6 caracteres"), // Adjusted validation for demo
});

type JoinData = z.infer<typeof joinSchema>;

export const EmployeeJoin: React.FC = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JoinData>({
        resolver: zodResolver(joinSchema)
    });

    const onSubmit = async (data: JoinData) => {
        // Mock validation
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // In a real app, we would validate code against DB
        // Here we just accept mostly anything for demo, or could check localStorage if needed
        // But for "Entry Flow" demo, let's just succeed.
        
        const newUser = {
            id: 'emp-' + Math.random().toString(36).substring(7),
            role: 'employee' as const,
            companyId: 'mock-company-id'
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
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Unite a tu equipo</h1>
                <p className="text-slate-500 mb-8">Ingresa el código de invitación provisto por tu administrador.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input 
                        {...register("code")} 
                        placeholder="Ej: ENEA-12" 
                        className="text-center text-2xl tracking-widest uppercase"
                        // maxLength={6} 
                        error={errors.code?.message}
                    />
                    <Button type="submit" size="lg" className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white" isLoading={isSubmitting}>
                        Ingresar
                    </Button>
                </form>
                 <button onClick={() => navigate('/')} className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline">
                    Volver al inicio
                </button>
             </div>
        </div>
    );
};
""")

    # --- Update App.tsx to use Provider ---
    create_file(os.path.join(project_root, "src/App.tsx"), """
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EntryLayout } from './layouts/EntryLayout';
import { LandingSplit } from './pages/entry/LandingSplit';
import { CompanyRegister } from './pages/auth/company/CompanyRegister';
import { EmployeeJoin } from './pages/auth/employee/EmployeeJoin';

// Simple protected route component
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
        <Route path="/auth/company/register" element={<CompanyRegister />} />
        <Route path="/auth/employee/join" element={<EmployeeJoin />} />
      </Route>
      
      {/* Protected Routes */}
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
    
    print("Auth Logic Implementation Complete.")

if __name__ == "__main__":
    main()
