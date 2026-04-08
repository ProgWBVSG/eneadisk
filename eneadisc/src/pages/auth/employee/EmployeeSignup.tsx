import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Users, CheckCircle, ChevronLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

const schema = z.object({
  inviteCode: z.string().min(6, 'El código debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export const EmployeeSignup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultCode = searchParams.get('code') || '';

  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { inviteCode: defaultCode }
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);

    // 1. Validate invite code
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('invite_code', data.inviteCode.trim().toUpperCase())
      .single();

    if (companyError || !company) {
      setError('inviteCode', { message: 'Código inválido. Pedíselo al administrador de tu empresa.' });
      return;
    }

    // 2. Sign up (direct, no OTP — email confirmation disabled in Supabase)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          role: 'employee',
          full_name: data.name,
          company_id: company.id,
        },
      },
    });

    if (signUpError) {
      if (signUpError.message.toLowerCase().includes('already registered') ||
          signUpError.message.toLowerCase().includes('user already exists')) {
        setServerError('Este email ya está registrado. Por favor iniciá sesión.');
      } else {
        setServerError(signUpError.message);
      }
      return;
    }

    const userId = signUpData.user?.id;
    if (!userId) {
      setServerError('Error al crear la cuenta. Intentá de nuevo.');
      return;
    }

    // 3. Create/upsert profile
    await supabase.from('profiles').upsert({
      id: userId,
      role: 'employee',
      company_id: company.id,
      full_name: data.name,
      email: data.email,
    });

    setSuccess(true);

    // Small delay then redirect
    setTimeout(() => navigate('/questionnaire'), 1500);
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

        {!success ? (
          <>
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Users size={32} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Crear Cuenta</h1>
            <p className="text-slate-500 mb-8 text-sm">
              Ingresá el código de tu empresa para unirte al equipo
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
              <Input
                label="Código de Empresa"
                {...register('inviteCode')}
                placeholder="ENEA-XXXXXX"
                className="uppercase tracking-widest font-mono"
                error={errors.inviteCode?.message}
              />
              <Input label="Nombre Completo" {...register('name')} error={errors.name?.message} />
              <Input label="Email" type="email" {...register('email')} error={errors.email?.message} />
              <Input label="Contraseña" type="password" {...register('password')} error={errors.password?.message} />
              <Input label="Confirmar Contraseña" type="password" {...register('confirmPassword')} error={errors.confirmPassword?.message} />
              {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white mt-4"
                isLoading={isSubmitting}
              >
                Crear Cuenta
              </Button>
            </form>

            <button
              onClick={() => navigate('/auth/employee/login')}
              className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline"
            >
              ¿Ya tenés cuenta? Iniciá sesión
            </button>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center gap-4">
            <CheckCircle size={52} className="text-green-500" />
            <h2 className="text-xl font-bold text-slate-900">¡Cuenta creada!</h2>
            <p className="text-slate-500 text-sm">Accediendo al cuestionario...</p>
          </div>
        )}
      </div>
    </div>
  );
};
