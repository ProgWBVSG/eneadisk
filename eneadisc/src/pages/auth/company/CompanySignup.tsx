import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Building2, ChevronLeft, CheckCircle, Copy } from 'lucide-react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';

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

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ENEA-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── Component ────────────────────────────────────────
export const CompanySignup: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Step1Data & Step2Data>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const form1 = useForm<Step1Data>({ resolver: zodResolver(step1Schema) });
  const form2 = useForm<Step2Data>({ resolver: zodResolver(step2Schema) });

  // ── Step 1: collect base info ────────────────────
  const onStep1 = (data: Step1Data) => {
    setFormData((p) => ({ ...p, ...data }));
    setStep(2);
  };

  // ── Step 2: signUp → immediate session (no OTP) ──
  const onStep2 = async (dataForm2: Step2Data) => {
    setServerError(null);
    const all = { ...formData, ...dataForm2 };
    setFormData(all);

    // 1. Sign up (email confirmation disabled in Supabase dashboard)
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: all.email!,
      password: all.password!,
      options: {
        data: { role: 'company_admin', full_name: all.companyName },
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

    // Supabase returns a user immediately when email confirmation is disabled
    const userId = signUpData.user?.id;
    if (!userId) {
      setServerError('Error al crear la cuenta. Intentá de nuevo.');
      return;
    }

    const code = generateInviteCode();

    // 2. Create company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        name: all.companyName,
        industry: all.industry,
        size: all.size,
        country: all.country,
        invite_code: code,
        owner_id: userId,
      })
      .select()
      .single();

    if (companyError) {
      // Company may exist if user re-submitted — try fetching
      const { data: existingCompany } = await supabase
        .from('companies')
        .select()
        .eq('owner_id', userId)
        .single();

      if (!existingCompany) {
        setServerError('Error al crear la empresa. Intentá de nuevo.');
        return;
      }
      // Use the existing company
      await supabase.from('profiles').upsert({
        id: userId,
        role: 'company_admin',
        company_id: existingCompany.id,
        full_name: all.companyName,
        email: all.email,
      });
      await refreshUser();
      setInviteCode(existingCompany.invite_code);
      setStep(3);
      return;
    }

    // 3. Upsert profile
    await supabase.from('profiles').upsert({
      id: userId,
      role: 'company_admin',
      company_id: company.id,
      full_name: all.companyName,
      email: all.email,
    });

    await refreshUser();
    setInviteCode(code);
    setStep(3);
  };

  const copyCode = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
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
          {step < 3 && <p className="text-slate-500 mt-1">Paso {step} de 2</p>}
        </div>

        {/* STEP 1 ─ Datos básicos */}
        {step === 1 && (
          <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-4">
            <Input label="Nombre de la Empresa" {...form1.register('companyName')} error={form1.formState.errors.companyName?.message} />
            <Input label="Email Corporativo" type="email" {...form1.register('email')} error={form1.formState.errors.email?.message} />
            <Input label="Contraseña" type="password" {...form1.register('password')} error={form1.formState.errors.password?.message} />
            <Input label="Confirmar Contraseña" type="password" {...form1.register('confirmPassword')} error={form1.formState.errors.confirmPassword?.message} />
            <Button type="submit" className="w-full" size="lg">Siguiente →</Button>
          </form>
        )}

        {/* STEP 2 ─ Detalles empresa */}
        {step === 2 && (
          <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-4">
            <Input label="Industria / Sector" {...form2.register('industry')} error={form2.formState.errors.industry?.message} />
            <Input label="País" {...form2.register('country')} error={form2.formState.errors.country?.message} />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tamaño del Equipo</label>
              <select
                {...form2.register('size')}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Selecciona...</option>
                <option value="1-10">1-10 empleados</option>
                <option value="11-50">11-50 empleados</option>
                <option value="51-200">51-200 empleados</option>
                <option value="200+">200+ empleados</option>
              </select>
              {form2.formState.errors.size && (
                <p className="text-xs text-red-500">{form2.formState.errors.size.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => setStep(1)} className="w-1/3">
                <ChevronLeft className="mr-1 h-4 w-4 inline" /> Atrás
              </Button>
              <Button type="submit" className="w-2/3" isLoading={form2.formState.isSubmitting}>
                Crear Cuenta
              </Button>
            </div>
          </form>
        )}

        {/* STEP 3 ─ Éxito + Código invitación */}
        {step === 3 && inviteCode && (
          <div className="text-center space-y-6">
            <CheckCircle size={48} className="text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-slate-900">¡Cuenta creada!</h2>
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

        {step < 3 && (
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
