import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Building2, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { supabase } from '../../../lib/supabase';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="mr-2 shrink-0">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
});

type LoginData = z.infer<typeof loginSchema>;

export const CompanyLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, signInWithGoogle } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [unconfirmedEmail, setUnconfirmedEmail] = useState<string | null>(null);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setServerError(null);
    setResendMsg(null);
    setUnconfirmedEmail(null);
    const { error, needsConfirmation } = await login(data.email, data.password);
    if (error) {
      setServerError(error);
      if (needsConfirmation) setUnconfirmedEmail(data.email);
      return;
    }
    navigate('/dashboard/company');
  };

  const handleResendConfirmation = async () => {
    if (!unconfirmedEmail) return;
    setResendMsg('Enviando...');
    const { error } = await supabase.auth.resend({ type: 'signup', email: unconfirmedEmail });
    setResendMsg(error ? 'No se pudo reenviar. Intentá en unos minutos.' : '✓ Código reenviado. Revisá tu email (y la carpeta de spam).');
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await signInWithGoogle('company_admin');
    if (error) {
      setServerError('No se pudo conectar con Google. Intentá de nuevo.');
      setGoogleLoading(false);
    }
    // On success the browser redirects — no need to setGoogleLoading(false)
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
          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate('/auth/reset-password')}
              className="text-xs text-blue-600 hover:text-blue-700 underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
          {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
          {unconfirmedEmail && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center space-y-2">
              <button
                type="button"
                onClick={handleResendConfirmation}
                className="text-sm font-medium text-amber-700 hover:text-amber-900 underline"
              >
                Reenviar email de confirmación
              </button>
              {resendMsg && <p className="text-xs text-amber-700">{resendMsg}</p>}
            </div>
          )}
          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            Ingresar
          </Button>
        </form>

        <div className="mt-4 flex items-center gap-3">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="text-xs text-slate-400">o</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        <button
          onClick={handleGoogle}
          disabled={googleLoading}
          className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
        >
          {googleLoading ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
          ) : (
            <GoogleIcon />
          )}
          Continuar con Google
        </button>

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
