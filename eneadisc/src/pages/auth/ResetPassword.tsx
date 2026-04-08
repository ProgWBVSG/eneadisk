import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { KeyRound, Mail, CheckCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const emailSchema = z.object({
  email: z.string().email('Email inválido'),
});

const newPasswordSchema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

type EmailData = z.infer<typeof emailSchema>;
type NewPasswordData = z.infer<typeof newPasswordSchema>;

export const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  // If Supabase redirects back with a hash fragment (recovery mode)
  // we enter the "set new password" phase.
  const [mode, setMode] = useState<'request' | 'sent' | 'reset' | 'done'>('request');
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Detect recovery session from Supabase callback
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errDesc = searchParams.get('error_description') || hashParams.get('error_description');
    
    if (errDesc) {
      setServerError(decodeURIComponent(errDesc).replace(/\+/g, ' '));
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('reset');
      } else if (event === 'SIGNED_IN' && session) {
        if (window.location.search.includes('code=') || window.location.hash.includes('type=recovery')) {
          setMode('reset');
        }
      }
    });

    const hash = window.location.hash;
    if (hash.includes('type=recovery') || hash.includes('access_token')) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) setMode('reset');
      });
    }

    return () => subscription.unsubscribe();
  }, []);

  const emailForm = useForm<EmailData>({ resolver: zodResolver(emailSchema) });
  const passwordForm = useForm<NewPasswordData>({ resolver: zodResolver(newPasswordSchema) });

  // ── Phase 1: Send reset email ─────────────────────
  const onRequestReset = async (data: EmailData) => {
    setServerError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setServerError('No pudimos enviar el email. Verificá la dirección e intentá de nuevo.');
    } else {
      setMode('sent');
    }
  };

  // ── Phase 2: Set new password (after returning from email link) ────────
  const onSetNewPassword = async (data: NewPasswordData) => {
    setServerError(null);
    const { error } = await supabase.auth.updateUser({ password: data.password });

    if (error) {
      setServerError('Error al actualizar la contraseña. El enlace puede haber expirado.');
    } else {
      setMode('done');
      setTimeout(() => navigate('/'), 2500);
    }
  };

  return (
    <div className="flex min-h-full p-4 sm:p-8">
      <div className="m-auto w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-slate-100 relative">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors p-2 flex items-center gap-1 text-sm"
        >
          <ArrowLeft size={18} /> Volver
        </button>

        {/* ── REQUEST PHASE ── */}
        {mode === 'request' && (
          <>
            <div className="mb-8 text-center pt-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-700">
                <KeyRound size={26} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Recuperar Contraseña</h1>
              <p className="text-slate-500 mt-2 text-sm">
                Ingresá tu email y te enviaremos un link para restablecer tu contraseña.
              </p>
            </div>
            <form onSubmit={emailForm.handleSubmit(onRequestReset)} className="space-y-4">
              <Input
                label="Email"
                type="email"
                {...emailForm.register('email')}
                error={emailForm.formState.errors.email?.message}
                placeholder="tu@email.com"
              />
              {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={emailForm.formState.isSubmitting}
              >
                <Mail className="mr-2 h-4 w-4" /> Enviar Link de Recuperación
              </Button>
            </form>
            <div className="mt-6 text-center space-y-2">
              <button onClick={() => navigate('/auth/company/login')} className="text-sm text-slate-400 hover:text-slate-600 underline block mx-auto">
                Iniciar sesión como empresa
              </button>
              <button onClick={() => navigate('/auth/employee/login')} className="text-sm text-slate-400 hover:text-slate-600 underline block mx-auto">
                Iniciar sesión como colaborador
              </button>
            </div>
          </>
        )}

        {/* ── SENT PHASE ── */}
        {mode === 'sent' && (
          <div className="text-center pt-6 space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Mail size={30} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">¡Revisá tu email!</h2>
            <p className="text-slate-500 text-sm">
              Si el email existe en nuestro sistema, recibirás un link para restablecer tu contraseña en los próximos minutos.
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
              Revisá también tu carpeta de spam o correo no deseado.
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setMode('request')}>
              Usar otro email
            </Button>
          </div>
        )}

        {/* ── RESET PHASE (user came from email link) ── */}
        {mode === 'reset' && (
          <>
            <div className="mb-8 text-center pt-6">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                <KeyRound size={26} />
              </div>
              <h1 className="text-2xl font-bold text-slate-900">Nueva Contraseña</h1>
              <p className="text-slate-500 mt-2 text-sm">
                Elegí una nueva contraseña segura para tu cuenta.
              </p>
            </div>
            <form onSubmit={passwordForm.handleSubmit(onSetNewPassword)} className="space-y-4">
              <div className="relative">
                <Input
                  label="Nueva Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  {...passwordForm.register('password')}
                  error={passwordForm.formState.errors.password?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="relative">
                <Input
                  label="Confirmar Contraseña"
                  type={showConfirm ? 'text' : 'password'}
                  {...passwordForm.register('confirmPassword')}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-8 text-slate-400 hover:text-slate-600"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={passwordForm.formState.isSubmitting}
              >
                Guardar Nueva Contraseña
              </Button>
            </form>
          </>
        )}

        {/* ── DONE PHASE ── */}
        {mode === 'done' && (
          <div className="text-center pt-6 space-y-4">
            <CheckCircle size={52} className="text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900">¡Contraseña actualizada!</h2>
            <p className="text-slate-500 text-sm">Tu contraseña fue cambiada exitosamente. Redirigiendo al inicio...</p>
          </div>
        )}
      </div>
    </div>
  );
};
