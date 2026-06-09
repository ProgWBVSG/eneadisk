import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Users, Mail, CheckCircle, ChevronLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="mr-2 shrink-0">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const step1Schema = z.object({
  inviteCode: z.string().min(6, 'El código debe tener al menos 6 caracteres'),
  name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

const otpSchema = z.object({
  token: z.string().min(6, 'Ingresá el código que te enviamos'),
});

type Step1Data = z.infer<typeof step1Schema>;
type OtpData = z.infer<typeof otpSchema>;

export const EmployeeSignup: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultCode = searchParams.get('code') || '';
  const { signInWithGoogle } = useAuth();

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Step1Data & { companyId: string }>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Countdown para reenviar OTP
  useEffect(() => {
    if (step !== 2 || resendTimer === 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, resendTimer]);

  const form1 = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: { inviteCode: defaultCode },
  });
  const formOtp = useForm<OtpData>({ resolver: zodResolver(otpSchema) });

  // ── Step 1: validar código + signUp → envía OTP ──
  const onStep1 = async (data: Step1Data) => {
    setServerError(null);
    setIsLoading(true);

    try {
      // Validar código de empresa vía RPC (funciona sin sesión iniciada)
      const { data: companyRows, error: companyError } = await supabase
        .rpc('get_company_by_invite_code', { p_code: data.inviteCode.trim().toUpperCase() });
      const company = Array.isArray(companyRows) ? companyRows[0] : null;

      if (companyError || !company) {
        form1.setError('inviteCode', { message: 'Código inválido. Pedíselo al administrador de tu empresa.' });
        return;
      }

      // Intentar crear la cuenta
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: { role: 'employee', full_name: data.name, company_id: company.id },
        },
      });

      if (signUpError) {
        if (
          signUpError.message.toLowerCase().includes('already registered') ||
          signUpError.message.toLowerCase().includes('user already exists')
        ) {
          setServerError('Este email ya tiene una cuenta. Por favor iniciá sesión.');
        } else {
          setServerError(signUpError.message);
        }
        return;
      }

      // Detectar email duplicado silencioso (identities vacías = email ya existe)
      if (signUpData.user?.identities && signUpData.user.identities.length === 0) {
        setServerError('Este email ya tiene una cuenta. Por favor iniciá sesión o recuperá tu contraseña.');
        return;
      }

      // Si Supabase tiene email confirmation DESACTIVADO, la sesión ya está disponible
      if (signUpData.session && signUpData.user) {
        // Crear perfil directamente (el trigger lo crea, pero hacemos upsert por si acaso)
        await supabase.from('profiles').upsert({
          id: signUpData.user.id,
          role: 'employee',
          company_id: company.id,
          full_name: data.name,
          email: data.email,
        });
        navigate('/questionnaire');
        return;
      }

      // Si requiere confirmación por email → ir al OTP
      setFormData({ ...data, companyId: company.id });
      setResendTimer(30);
      setStep(2);
    } catch (err) {
      setServerError('Ocurrió un error inesperado. Intentá de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: verificar OTP → crear perfil ──
  const onOtp = async (data: OtpData) => {
    setServerError(null);
    setIsLoading(true);

    try {
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: formData.email!,
        token: data.token,
        type: 'signup',
      });

      if (verifyError || !verifyData.user) {
        setServerError('Código incorrecto o expirado. Revisá tu email e intentá de nuevo.');
        return;
      }

      const userId = verifyData.user.id;

      await supabase.from('profiles').upsert({
        id: userId,
        role: 'employee',
        company_id: formData.companyId,
        full_name: formData.name,
        email: formData.email,
      });

      navigate('/questionnaire');
    } catch (err) {
      setServerError('Error al verificar. Intentá de nuevo.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Google signup: validate invite code first, then OAuth ──
  const handleGoogleSignup = async () => {
    setServerError(null);
    const inviteCode = form1.getValues('inviteCode').trim().toUpperCase();
    if (!inviteCode || inviteCode.length < 6) {
      form1.setError('inviteCode', { message: 'Ingresá el código de empresa antes de continuar con Google.' });
      return;
    }

    setGoogleLoading(true);

    const { data: companyRows, error: companyError } = await supabase
      .rpc('get_company_by_invite_code', { p_code: inviteCode });
    const company = Array.isArray(companyRows) ? companyRows[0] : null;

    if (companyError || !company) {
      form1.setError('inviteCode', { message: 'Código inválido. Pedíselo al administrador de tu empresa.' });
      setGoogleLoading(false);
      return;
    }

    const { error } = await signInWithGoogle('employee', {
      inviteCode,
      companyId: company.id,
    });

    if (error) {
      setServerError('No se pudo conectar con Google. Intentá de nuevo.');
      setGoogleLoading(false);
    }
  };

  // ── Reenviar OTP ─────────────────────────────────
  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setServerError(null);
    const { error } = await supabase.auth.resend({ type: 'signup', email: formData.email! });
    setIsResending(false);
    if (error) setServerError('Error al reenviar. Intentá de nuevo.');
    else setResendTimer(30);
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
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Crear Cuenta</h1>
        <p className="text-slate-500 mb-6 text-sm">
          {step === 1 ? 'Ingresá el código de tu empresa para unirte al equipo' : 'Verificá tu email para activar la cuenta'}
        </p>

        {/* Barra de progreso */}
        <div className="flex justify-center gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`h-2 w-12 rounded-full transition-colors ${
                s < step ? 'bg-amber-500' : s === step ? 'bg-amber-400' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>

        {/* STEP 1 ── Datos + código empresa */}
        {step === 1 && (
          <div className="space-y-4 text-left">
            {/* Invite code field — needed before Google too */}
            <Input
              label="Código de Empresa"
              {...form1.register('inviteCode')}
              placeholder="ENEA-XXXXXX"
              className="uppercase tracking-widest font-mono"
              error={form1.formState.errors.inviteCode?.message}
            />

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
            >
              {googleLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
              ) : (
                <GoogleIcon />
              )}
              Registrarse con Google
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400">o con email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
              <Input label="Nombre Completo" {...form1.register('name')} error={form1.formState.errors.name?.message} />
              <Input label="Email" type="email" {...form1.register('email')} error={form1.formState.errors.email?.message} />
              <Input label="Contraseña (mín. 8 caracteres)" type="password" {...form1.register('password')} error={form1.formState.errors.password?.message} />
              <Input label="Confirmar Contraseña" type="password" {...form1.register('confirmPassword')} error={form1.formState.errors.confirmPassword?.message} />
              {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white mt-4"
                isLoading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </Button>
            </form>
          </div>
        )}

        {/* STEP 2 ── Verificación OTP */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-left">
              <Mail size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Revisá tu email</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Enviamos un código de verificación a <strong>{formData.email}</strong>
                </p>
              </div>
            </div>
            <form onSubmit={formOtp.handleSubmit(onOtp)} className="space-y-4 text-left">
              <Input
                label="Código de verificación"
                {...formOtp.register('token')}
                placeholder="Ingresá el código del email"
                className="text-center text-xl tracking-widest font-mono"
                error={formOtp.formState.errors.token?.message}
              />
              {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white"
                isLoading={isLoading}
                disabled={isLoading}
              >
                <CheckCircle className="mr-2 h-4 w-4" /> {isLoading ? 'Verificando...' : 'Verificar y Entrar'}
              </Button>
            </form>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || isResending}
                className={resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-amber-600 hover:text-amber-800 font-medium underline'}
              >
                {isResending ? 'Enviando...' : resendTimer > 0 ? `Reenviar código en ${resendTimer}s` : 'Reenviar código'}
              </button>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-slate-400 hover:text-slate-600 underline flex items-center justify-center gap-1 mx-auto"
            >
              <ChevronLeft size={14} /> Volver al formulario
            </button>
          </div>
        )}

        <button
          onClick={() => navigate('/auth/employee/login')}
          className="mt-6 text-sm text-slate-400 hover:text-slate-600 underline"
        >
          ¿Ya tenés cuenta? Iniciá sesión
        </button>
      </div>
    </div>
  );
};
