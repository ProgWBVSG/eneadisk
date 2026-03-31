import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Building2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type LoginData = z.infer<typeof loginSchema>;

export const CompanyLogin: React.FC = () => {
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
    navigate('/dashboard/company');
  };

  return (
    <div className="flex min-h-full p-4 sm:p-8">
      <div className="m-auto w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100 relative">
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors p-2"
          title="Volver al inicio"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="mb-8 text-center pt-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <Building2 size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Iniciar Sesión</h1>
          <p className="text-slate-500 mt-1">Empresa</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
          <Input label="Contraseña" type="password" {...register('password')} error={errors.password?.message} />
          {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            Ingresar
          </Button>
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
