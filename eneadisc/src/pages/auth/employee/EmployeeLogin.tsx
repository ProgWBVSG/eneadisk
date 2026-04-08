import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Users, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type LoginData = z.infer<typeof loginSchema>;

export const EmployeeLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setServerError(null);
    const { error } = await login(data.email, data.password);
    if (error) {
      setServerError(error);
      return;
    }
    navigate('/dashboard/employee');
  };

  return (
    <div className="flex min-h-full p-4 sm:p-8">
      <div className="m-auto w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100 text-center relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors p-2"
          title="Volver al inicio"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Users size={32} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Iniciar Sesión</h1>
        <p className="text-slate-500 mb-8">Colaborador</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Contraseña" type="password" {...register('password')} error={errors.password?.message} />
          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate('/auth/reset-password')}
              className="text-xs text-amber-600 hover:text-amber-700 underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
          <Button
            type="submit"
            size="lg"
            className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white"
            isLoading={isSubmitting}
          >
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
