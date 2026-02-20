import os
import subprocess
import sys

def run_command(command, cwd=None):
    try:
        subprocess.run(command, check=True, shell=True, cwd=cwd)
        print(f"Successfully ran: {command}")
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(e)
        sys.exit(1)

def create_file(filepath, content):
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created file: {filepath}")

def main():
    project_root = os.path.join(os.getcwd(), "eneadisc")
    if not os.path.exists(project_root):
        print("Error: 'eneadisc' directory not found. Run init script first.")
        sys.exit(1)

    print("Installing dependencies...")
    run_command("npm install framer-motion react-router-dom lucide-react zod react-hook-form clsx tailwind-merge", cwd=project_root)

    print("Creating Component Structure...")
    
    # --- UI Components ---
    create_file(os.path.join(project_root, "src/components/ui/Button.tsx"), """
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50";
    
    const variants = {
      primary: "bg-blue-900 text-white hover:bg-blue-800 shadow-sm",
      secondary: "bg-amber-400 text-blue-900 hover:bg-amber-500 shadow-sm",
      outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-900",
      ghost: "hover:bg-slate-100 text-slate-900",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
""")

    create_file(os.path.join(project_root, "src/components/ui/Input.tsx"), """
import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>}
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-all",
            error && "border-red-500 focus:ring-red-500",
            className
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
""")

    # --- Layouts ---
    create_file(os.path.join(project_root, "src/layouts/EntryLayout.tsx"), """
import React from 'react';
import { Outlet } from 'react-router-dom';

export const EntryLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Outlet />
    </div>
  );
};
""")

    # --- Pages: Landing Split ---
    create_file(os.path.join(project_root, "src/pages/entry/LandingSplit.tsx"), """
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const LandingSplit: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredSide, setHoveredSide] = useState<'left' | 'right' | null>(null);

  const leftWidth = hoveredSide === 'left' ? '60%' : hoveredSide === 'right' ? '40%' : '50%';
  const rightWidth = hoveredSide === 'right' ? '60%' : hoveredSide === 'left' ? '40%' : '50%';

  return (
    <div className="flex h-screen w-full flex-col md:flex-row overflow-hidden">
      {/* Left Side - Company */}
      <motion.div
        className="relative flex flex-col items-center justify-center bg-slate-900 text-white p-8 cursor-pointer"
        initial={{ width: '50%' }}
        animate={{ width: window.innerWidth > 768 ? leftWidth : '100%' }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        onMouseEnter={() => setHoveredSide('left')}
        onMouseLeave={() => setHoveredSide(null)}
        onClick={() => navigate('/auth/company/register')}
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
          <Button variant="secondary" className="mt-4" onClick={(e) => {
             e.stopPropagation();
             navigate('/auth/company/register');
          }}>
            Crear Cuenta Empresa
          </Button>
        </div>
      </motion.div>

      {/* Right Side - Employee */}
      <motion.div
        className="relative flex flex-col items-center justify-center bg-slate-50 text-slate-900 p-8 cursor-pointer border-l border-slate-200"
        initial={{ width: '50%' }}
        animate={{ width: window.innerWidth > 768 ? rightWidth : '100%' }}
        transition={{ type: 'spring', stiffness: 200, damping: 30 }}
        onMouseEnter={() => setHoveredSide('right')}
        onMouseLeave={() => setHoveredSide(null)}
        onClick={() => navigate('/auth/employee/join')}
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
          <Button variant="primary" className="mt-4 bg-amber-500 hover:bg-amber-600 border-none text-white shadow-md" onClick={(e) => {
             e.stopPropagation();
             navigate('/auth/employee/join');
          }}>
            Unirme con Código
          </Button>
        </div>
      </motion.div>
    </div>
  );
};
""")

    # --- Pages: Company Register (Wizard) ---
    create_file(os.path.join(project_root, "src/pages/auth/company/CompanyRegister.tsx"), """
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { ChevronRight, ChevronLeft, Building2 } from 'lucide-react';

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
    // Mock save to localStorage
    const companyId = Math.random().toString(36).substring(7);
    const inviteCode = "ENEA-" + Math.floor(1000 + Math.random() * 9000);
    
    // Save minimal auth state
    localStorage.setItem('currentUser', JSON.stringify({ 
      id: 'admin-1', 
      role: 'company_admin', 
      companyId,
      companyName: finalData.companyName 
    }));
    
    // Simulating API call
    setTimeout(() => {
        alert(`Cuenta creada! Tu código de invitación es: ${inviteCode}`);
        navigate('/'); // Redirect to dashboard eventually
    }, 1000);
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

    # --- Pages: Employee Join ---
    create_file(os.path.join(project_root, "src/pages/auth/employee/EmployeeJoin.tsx"), """
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Users } from 'lucide-react';

const joinSchema = z.object({
  code: z.string().length(6, "El código debe tener 6 caracteres"),
});

type JoinData = z.infer<typeof joinSchema>;

export const EmployeeJoin: React.FC = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<JoinData>({
        resolver: zodResolver(joinSchema)
    });

    const onSubmit = async (data: JoinData) => {
        console.log("Joining with code:", data.code);
        // Mock validation
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (data.code === "000000") { // Force error for testing
             alert("Código inválido");
             return;
        }

        // Mock success
        localStorage.setItem('currentUser', JSON.stringify({
            id: 'emp-1',
            role: 'employee',
            companyId: 'company-mock-1'
        }));
        navigate('/employee/dashboard'); // Future route
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
             <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Users size={32} />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Unite a tu equipo</h1>
                <p className="text-slate-500 mb-8">Ingresa el código de 6 dígitos provisto por tu administrador.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <Input 
                        {...register("code")} 
                        placeholder="Ej: ENEA-12" 
                        className="text-center text-2xl tracking-widest uppercase"
                        maxLength={6}
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

    # --- Routing ---
    create_file(os.path.join(project_root, "src/App.tsx"), """
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { EntryLayout } from './layouts/EntryLayout';
import { LandingSplit } from './pages/entry/LandingSplit';
import { CompanyRegister } from './pages/auth/company/CompanyRegister';
import { EmployeeJoin } from './pages/auth/employee/EmployeeJoin';

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<EntryLayout />}>
          <Route path="/" element={<LandingSplit />} />
          <Route path="/auth/company/register" element={<CompanyRegister />} />
          <Route path="/auth/employee/join" element={<EmployeeJoin />} />
          
          {/* Placeholder for protected routes */}
          <Route path="/employee/dashboard" element={<div className="p-8"><h1>Employee Dashboard (Coming Soon)</h1></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
""")
    
    print("Implementation complete. Run 'npm run dev' inside 'eneadisc' folder to test.")

if __name__ == "__main__":
    main()
