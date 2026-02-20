
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
