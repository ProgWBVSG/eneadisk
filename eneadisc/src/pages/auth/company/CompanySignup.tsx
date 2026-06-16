import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Combobox } from '../../../components/ui/Combobox';
import { COUNTRIES, INDUSTRIES, TEAM_SIZES } from '../../../data/formOptions';
import { Building2, ChevronLeft, CheckCircle, Copy, Mail } from 'lucide-react';
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

// ── Schemas ─────────────────────────────────────────
const step1Schema = z.object({
  companyName: z.string().min(2, 'Nombre de empresa requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

const step2Schema = z.object({
  industry: z.string().min(2, 'Industria requerida'),
  size: z.string().min(1, 'Selecciona un tamaño'),
  country: z.string().min(2, 'País requerido'),
});

const otpSchema = z.object({
  token: z.string().min(6, 'Ingresá el código que te enviamos'),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;
type OtpData = z.infer<typeof otpSchema>;

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ENEA-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── Component ────────────────────────────────────────
export const CompanySignup: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser, signInWithGoogle } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);

  // step 1 = datos personales, step 2 = datos empresa, step 3 = OTP, step 4 = éxito
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });
  const formOtp = useForm<OtpData>({ resolver: zodResolver(otpSchema) });

  // Countdown para reenviar OTP
  useEffect(() => {
    if (step !== 3 || resendTimer === 0) return;
    const t = setInterval(() => setResendTimer((p) => p - 1), 1000);
    return () => clearInterval(t);
  }, [step, resendTimer]);

  // ── Step 1: datos básicos ────────────────────────
  const onStep1 = (data: Step1Data) => {
    setFormData((p) => ({ ...p, ...data }));
    setStep(2);
  };

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    const companyName = form1.getValues('companyName');
    const { error } = await signInWithGoogle('company_admin', { companyName: companyName || undefined });
    if (error) {
      setServerError('No se pudo conectar con Google. Intentá de nuevo.');
      setGoogleLoading(false);
    }
  };

  // ── Crear empresa + perfil (reutilizable para ambos flujos) ──
  const createCompanyAndProfile = async (
    userId: string,
    data: Partial<Step1Data & Step2Data>
  ): Promise<void> => {
    const code = generateInviteCode();

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: data.companyName,
        industry: data.industry,
        size: data.size,
        country: data.country,
        invite_code: code,
        owner_id: userId,
      })
      .select()
      .single();

    if (companyError) {
      setServerError('Error al crear la empresa. Intentá de nuevo.');
      return;
    }

    // Upsert: el trigger ya creó el perfil con role='employee'; lo corregimos.
    await supabase.from('profiles').upsert(
      {
        id: userId,
        role: 'company_admin',
        company_id: company.id,
        full_name: data.companyName,
        email: data.email,
        questionnaire_completed: true, // los admins no hacen cuestionario
      },
      { onConflict: 'id' }
    );

    await refreshUser();
    setInviteCode(code);
    setStep(4);
  };

  // ── Step 2: datos empresa → signUp ──
  const onStep2 = async (dataForm2: Step2Data) => {
    setServerError(null);
    const all = { ...formData, ...dataForm2 };
    setFormData(all);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: all.email!,
      password: all.password!,
      options: {
        data: { role: 'company_admin', full_name: all.companyName },
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

    // identities vacío = el email YA existe
    if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
      setServerError('Este email ya tiene una cuenta. Por favor iniciá sesión o recuperá tu contraseña.');
      return;
    }

    // Si la confirmación de email está DESACTIVADA, hay sesión inmediata
    // → creamos la empresa directo, sin pedir código.
    if (signUpData.session && signUpData.user) {
      await createCompanyAndProfile(signUpData.user.id, all);
      return;
    }

    // Si requiere confirmación por email → ir al paso del código OTP
    setResendTimer(30);
    setStep(3);
  };

  // ── Step 3: verificar OTP (solo si la confirmación está activada) ──
  const onOtp = async (data: OtpData) => {
    setServerError(null);

    const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
      email: formData.email!,
      token: data.token,
      type: 'signup',
    });

    if (verifyError || !verifyData.user) {
      setServerError('Código incorrecto o expirado. Revisá tu email e intentá de nuevo.');
      return;
    }

    await createCompanyAndProfile(verifyData.user.id, formData);
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

  const copyCode = () => {
    if (!inviteCode) return;
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

        {/* Header */}
        <div className="mb-8 text-center pt-4">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
            <Building2 size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Crear Cuenta Empresa</h1>
          {step < 4 && (
            <div className="mt-3 flex justify-center gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 w-8 rounded-full transition-colors ${
                    s < step ? 'bg-blue-600' : s === step ? 'bg-blue-400' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* STEP 1 ── Datos básicos */}
        {step === 1 && (
          <div className="space-y-4">
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
              <Input label="Nombre de la Empresa" {...form1.register('companyName')} error={form1.formState.errors.companyName?.message} />
              <Input label="Email Corporativo" type="email" {...form1.register('email')} error={form1.formState.errors.email?.message} />
              <Input label="Contraseña (mín. 8 caracteres)" type="password" {...form1.register('password')} error={form1.formState.errors.password?.message} />
              <Input label="Confirmar Contraseña" type="password" {...form1.register('confirmPassword')} error={form1.formState.errors.confirmPassword?.message} />
              {serverError && step === 1 && <p className="text-sm text-red-500 text-center">{serverError}</p>}
              <Button type="submit" className="w-full" size="lg">Siguiente →</Button>
            </form>
          </div>
        )}

        {/* STEP 2 ── Datos empresa */}
        {step === 2 && (
          <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-4">
            <Controller
              name="industry"
              control={form2.control}
              render={({ field }) => (
                <Combobox
                  label="Industria / Sector"
                  options={INDUSTRIES}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Buscá o escribí tu industria..."
                  allowCustom
                  error={form2.formState.errors.industry?.message}
                />
              )}
            />
            <Controller
              name="country"
              control={form2.control}
              render={({ field }) => (
                <Combobox
                  label="País"
                  options={COUNTRIES}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Buscá tu país..."
                  error={form2.formState.errors.country?.message}
                />
              )}
            />
            <Controller
              name="size"
              control={form2.control}
              render={({ field }) => (
                <Combobox
                  label="Tamaño del Equipo"
                  options={TEAM_SIZES}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Seleccioná el tamaño..."
                  error={form2.formState.errors.size?.message}
                />
              )}
            />
            {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3">
                ← Atrás
              </Button>
              <Button type="submit" className="w-2/3" isLoading={form2.formState.isSubmitting}>
                Crear Cuenta
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3 ── Verificación OTP */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3 text-left">
              <Mail size={20} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900">Revisá tu email</p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Enviamos un código de verificación a <strong>{formData.email}</strong>
                </p>
              </div>
            </div>
            <form onSubmit={formOtp.handleSubmit(onOtp)} className="space-y-4">
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
                className="w-full"
                isLoading={formOtp.formState.isSubmitting}
              >
                Verificar y Crear Empresa
              </Button>
            </form>
            <div className="text-center text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || isResending}
                className={resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-800 font-medium underline'}
              >
                {isResending ? 'Enviando...' : resendTimer > 0 ? `Reenviar código en ${resendTimer}s` : 'Reenviar código'}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4 ── Éxito + código de invitación */}
        {step === 4 && inviteCode && (
          <div className="text-center space-y-6">
            <CheckCircle size={48} className="text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">¡Cuenta verificada!</h2>
              <p className="text-slate-500 mt-2 text-sm">
                Compartí este código con tu equipo para que puedan unirse.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-medium uppercase tracking-wide mb-2">
                Código de invitación
              </p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl font-mono font-bold text-blue-800 tracking-widest">
                  {inviteCode}
                </span>
                <button
                  onClick={copyCode}
                  className="p-2 rounded-md hover:bg-blue-100 transition-colors"
                  title="Copiar código"
                >
                  {copied
                    ? <CheckCircle size={18} className="text-green-500" />
                    : <Copy size={18} className="text-blue-600" />}
                </button>
              </div>
            </div>
            <Button className="w-full" size="lg" onClick={() => navigate('/dashboard/company')}>
              Ir al Panel de Control
            </Button>
          </div>
        )}

        {step < 4 && (
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/auth/company/login')}
              className="text-sm text-slate-400 hover:text-slate-600 underline"
            >
              ¿Ya tenés cuenta? Iniciá sesión
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
