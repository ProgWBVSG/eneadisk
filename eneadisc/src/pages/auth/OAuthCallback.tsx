import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Users, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'ENEA-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

const companySchema = z.object({
  companyName: z.string().min(2, 'Nombre de empresa requerido'),
  industry: z.string().min(2, 'Industria requerida'),
  size: z.string().min(1, 'Seleccioná un tamaño'),
  country: z.string().min(2, 'País requerido'),
});

const employeeSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  inviteCode: z.string().min(6, 'Ingresá el código de tu empresa'),
});

type CompanyData = z.infer<typeof companySchema>;
type EmployeeData = z.infer<typeof employeeSchema>;
type Phase = 'loading' | 'company-complete' | 'employee-complete' | 'error';

interface OAuthIntent {
  role: 'company_admin' | 'employee';
  companyName?: string;
  inviteCode?: string;
  companyId?: string;
}

export const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const [phase, setPhase] = useState<Phase>('loading');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const handledRef = useRef(false);

  const companyForm = useForm<CompanyData>({ resolver: zodResolver(companySchema) });
  const employeeForm = useForm<EmployeeData>({ resolver: zodResolver(employeeSchema) });

  useEffect(() => {
    let mounted = true;

    const handleUser = async (user: { id: string; email?: string; user_metadata?: Record<string, string> }) => {
      if (handledRef.current || !mounted) return;
      handledRef.current = true;

      const googleName: string =
        user.user_metadata?.full_name || user.user_metadata?.name || '';

      setUserId(user.id);
      setUserEmail(user.email ?? '');

      // Check if profile already exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && mounted) {
        await refreshUser();
        navigate(
          profile.role === 'company_admin' ? '/dashboard/company' : '/dashboard/employee',
          { replace: true }
        );
        return;
      }

      // New user — need to complete registration
      const intentStr = localStorage.getItem('eneateams_oauth_intent');
      if (!intentStr) {
        if (mounted) {
          setPhase('error');
          setErrorMsg(
            'No se pudo determinar el tipo de cuenta. Por favor registrate usando el formulario de email.'
          );
        }
        return;
      }

      const intent: OAuthIntent = JSON.parse(intentStr);

      if (intent.role === 'company_admin') {
        if (intent.companyName) companyForm.setValue('companyName', intent.companyName);
        if (mounted) setPhase('company-complete');
      } else {
        // employee with pre-validated invite code → create profile automatically
        if (intent.inviteCode && intent.companyId) {
          await supabase.from('profiles').upsert({
            id: user.id,
            role: 'employee',
            company_id: intent.companyId,
            full_name: googleName || user.email?.split('@')[0] || 'Usuario',
            email: user.email,
            questionnaire_completed: false,
          });
          localStorage.removeItem('eneateams_oauth_intent');
          await refreshUser();
          if (mounted) navigate('/questionnaire', { replace: true });
          return;
        }

        if (googleName) employeeForm.setValue('name', googleName);
        if (intent.inviteCode) employeeForm.setValue('inviteCode', intent.inviteCode);
        if (mounted) setPhase('employee-complete');
      }
    };

    // Try existing session first (handles page refresh after redirect)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && mounted) handleUser(session.user);
    });

    // Also listen for the auth state change fired when Supabase exchanges the code
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && session?.user) {
        handleUser(session.user);
      }
    });

    // Safety net — if nothing happens in 12 seconds
    const timeout = setTimeout(() => {
      if (mounted) {
        setPhase((p) => {
          if (p === 'loading') {
            setErrorMsg('La autenticación tardó demasiado. Por favor intentá de nuevo.');
            return 'error';
          }
          return p;
        });
      }
    }, 12000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  // ── Company completion ─────────────────────────────
  const onCompanyComplete = async (data: CompanyData) => {
    setServerError(null);
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

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      role: 'company_admin',
      company_id: company.id,
      full_name: data.companyName,
      email: userEmail,
      questionnaire_completed: false,
    });

    if (profileError) {
      setServerError('Error al guardar el perfil. Intentá de nuevo.');
      return;
    }

    localStorage.removeItem('eneateams_oauth_intent');
    await refreshUser();
    navigate('/dashboard/company', { replace: true });
  };

  // ── Employee completion ────────────────────────────
  const onEmployeeComplete = async (data: EmployeeData) => {
    setServerError(null);

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id')
      .eq('invite_code', data.inviteCode.trim().toUpperCase())
      .maybeSingle();

    if (companyError || !company) {
      employeeForm.setError('inviteCode', {
        message: 'Código inválido. Pedíselo al administrador de tu empresa.',
      });
      return;
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      role: 'employee',
      company_id: company.id,
      full_name: data.name,
      email: userEmail,
      questionnaire_completed: false,
    });

    if (profileError) {
      setServerError('Error al guardar el perfil. Intentá de nuevo.');
      return;
    }

    localStorage.removeItem('eneateams_oauth_intent');
    await refreshUser();
    navigate('/questionnaire', { replace: true });
  };

  // ── Render ─────────────────────────────────────────

  if (phase === 'loading') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-slate-500 text-sm">Verificando tu cuenta de Google...</p>
        </div>
      </div>
    );
  }

  if (phase === 'error') {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Error de autenticación</h2>
          <p className="text-slate-500 text-sm mb-6">{errorMsg}</p>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'company-complete') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-700">
              <Building2 size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Completar Registro</h1>
            <p className="text-slate-500 text-sm mt-1">
              Cuenta de Google verificada. Completá los datos de tu empresa.
            </p>
          </div>
          <form onSubmit={companyForm.handleSubmit(onCompanyComplete)} className="space-y-4">
            <Input
              label="Nombre de la Empresa"
              {...companyForm.register('companyName')}
              error={companyForm.formState.errors.companyName?.message}
            />
            <Input
              label="Industria / Sector"
              {...companyForm.register('industry')}
              error={companyForm.formState.errors.industry?.message}
            />
            <Input
              label="País"
              {...companyForm.register('country')}
              error={companyForm.formState.errors.country?.message}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Tamaño del Equipo</label>
              <select
                {...companyForm.register('size')}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="">Seleccioná...</option>
                <option value="1-10">1-10 empleados</option>
                <option value="11-50">11-50 empleados</option>
                <option value="51-200">51-200 empleados</option>
                <option value="200+">200+ empleados</option>
              </select>
              {companyForm.formState.errors.size && (
                <p className="text-xs text-red-500">{companyForm.formState.errors.size.message}</p>
              )}
            </div>
            {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={companyForm.formState.isSubmitting}
            >
              Crear Empresa y Continuar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  if (phase === 'employee-complete') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Users size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Completar Registro</h1>
            <p className="text-slate-500 text-sm mt-1">
              Cuenta de Google verificada. Ingresá el código de tu empresa para unirte.
            </p>
          </div>
          <form onSubmit={employeeForm.handleSubmit(onEmployeeComplete)} className="space-y-4">
            <Input
              label="Tu Nombre Completo"
              {...employeeForm.register('name')}
              error={employeeForm.formState.errors.name?.message}
            />
            <Input
              label="Código de Empresa"
              {...employeeForm.register('inviteCode')}
              placeholder="ENEA-XXXXXX"
              className="uppercase tracking-widest font-mono"
              error={employeeForm.formState.errors.inviteCode?.message}
            />
            {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
            <Button
              type="submit"
              className="w-full bg-amber-500 hover:bg-amber-600 border-none text-white"
              size="lg"
              isLoading={employeeForm.formState.isSubmitting}
            >
              Unirme al Equipo
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};
