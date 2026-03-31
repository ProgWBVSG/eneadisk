import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Users, Mail, ChevronLeft } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

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
  token: z.string().length(6, 'El código tiene 6 dígitos'),
});

type Step1Data = z.infer<typeof step1Schema>;
type OtpData = z.infer<typeof otpSchema>;

export const EmployeeSignup: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & { companyId: string }>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  const [resendTimer, setResendTimer] = useState(30);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => setResendTimer((p) => p - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  const handleResend = async () => {
    if (resendTimer > 0 || isResending) return;
    setIsResending(true);
    setServerError(null);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: formData.email!,
    });
    setIsResending(false);
    if (error) setServerError('Error al reenviar: ' + error.message);
    else setResendTimer(30);
  };

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const formOtp = useForm<OtpData>({ resolver: zodResolver(otpSchema) });

  // ── Step 1: validate invite code + signUp → show OTP ──
  const onStep1 = async (data: Step1Data) => {
    setServerError(null);

    // Validate invite code
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('invite_code', data.inviteCode.toUpperCase())
      .single();

    if (companyError || !company) {
      form1.setError('inviteCode', { message: 'Código inválido. Pedíselo a tu empresa.' });
      return;
    }

    // Create auth user
    const { error: signupError } = await supabase.auth.signUp({
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

    if (signupError) {
      if (signupError.message.includes('already registered')) {
        setServerError('Este email ya está registrado. Iniciá sesión.');
      } else {
        setServerError(signupError.message);
      }
      return;
    }

    setFormData({ ...data, companyId: company.id });
    setStep(2);
  };

  // ── Step 2: verify OTP → create profile ──
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

    const userId = verifyData.user.id;

    // Upsert profile with company (trigger may have inserted partial)
    await supabase.from('profiles').upsert({
      id: userId,
      role: 'employee',
      company_id: formData.companyId,
      full_name: formData.name,
    });

    navigate('/questionnaire');
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Crear Cuenta</h1>
        <p className="text-slate-500 mb-8 text-sm">
          {step === 1
            ? 'Ingresá el código de tu empresa para unirte'
            : 'Verificá tu email para activar la cuenta'}
        </p>

        {/* STEP 1 ─ Datos + código empresa */}
        {step === 1 && (
          <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4 text-left">
            <Input
              label="Código de Empresa"
              {...form1.register('inviteCode')}
              placeholder="ENEA-XXXXXX"
              className="uppercase tracking-widest font-mono"
              error={form1.formState.errors.inviteCode?.message}
            />
            <Input label="Nombre Completo" {...form1.register('name')} error={form1.formState.errors.name?.message} />
            <Input label="Email" type="email" {...form1.register('email')} error={form1.formState.errors.email?.message} />
            <Input label="Contraseña" type="password" {...form1.register('password')} error={form1.formState.errors.password?.message} />
            <Input label="Confirmar Contraseña" type="password" {...form1.register('confirmPassword')} error={form1.formState.errors.confirmPassword?.message} />
            {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
            <Button
              type="submit"
              size="lg"
              className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white mt-4"
              isLoading={form1.formState.isSubmitting}
            >
              Crear Cuenta
            </Button>
          </form>
        )}

        {/* STEP 2 ─ Verificación OTP */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-left">
              <Mail size={20} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-900">Revisá tu email</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  Enviamos un código de 6 dígitos a <strong>{formData.email}</strong>.
                </p>
              </div>
            </div>
            <form onSubmit={formOtp.handleSubmit(onOtp)} className="space-y-4">
              <Input
                label="Código de verificación"
                {...formOtp.register('token')}
                placeholder="123456"
                className="text-center text-2xl tracking-widest font-mono"
                maxLength={6}
                error={formOtp.formState.errors.token?.message}
              />
              {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white"
                isLoading={formOtp.formState.isSubmitting}
              >
                Verificar y Entrar
              </Button>
            </form>
            <div className="text-center mt-8 mb-2 text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendTimer > 0 || isResending}
                className={resendTimer > 0 ? 'text-slate-400 cursor-not-allowed' : 'text-amber-600 hover:text-amber-800 font-medium underline'}
              >
                {isResending ? 'Enviando...' : resendTimer > 0 ? `Reenviar código en ${resendTimer}s` : 'Volver a enviar código'}
              </button>
            </div>
            <button
              onClick={() => setStep(1)}
              className="text-sm text-slate-400 hover:text-slate-600 underline flex items-center justify-center gap-1 mx-auto"
            >
              <ChevronLeft size={14} /> Volver
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
