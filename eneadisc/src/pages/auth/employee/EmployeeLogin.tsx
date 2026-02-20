
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
