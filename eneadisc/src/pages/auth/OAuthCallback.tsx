import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Users, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Combobox } from '../../components/ui/Combobox';
import { COUNTRIES, INDUSTRIES, TEAM_SIZES } from '../../data/formOptions';

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

  // ── Procesamiento del usuario autenticado ──────────────────────────────
  const processUser = async (
    user: { id: string; email?: string; user_metadata?: Record<string, string> },
    mounted: { current: boolean }
  ) => {
    if (handledRef.current || !mounted.current) return;
    handledRef.current = true;

    const googleName = user.user_metadata?.full_name || user.user_metadata?.name || '';
    setUserId(user.id);
    setUserEmail(user.email ?? '');

    // ── PASO 1: ¿El usuario YA tiene un perfil completo? ───────────────────
    // Verificamos esto PRIMERO. Si ya tiene company_id, es un usuario
    // existente haciendo LOGIN → va directo al dashboard, sin importar el
    // intent. Esto evita:
    //   • Pedirle datos de empresa de nuevo a usuarios ya registrados
    //   • Crear empresas duplicadas
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('role, company_id')
      .eq('id', user.id)
      .maybeSingle();

    if (!mounted.current) return;

    if (existingProfile?.company_id) {
      // Usuario existente con empresa → LOGIN directo
      localStorage.removeItem('eneateams_oauth_intent'); // limpiar intent obsoleto
      await refreshUser();
      navigate(
        existingProfile.role === 'company_admin' ? '/dashboard/company' : '/dashboard/employee',
        { replace: true }
      );
      return;
    }

    // ── PASO 2: Usuario sin perfil completo = REGISTRO nuevo ───────────────
    const intentStr = localStorage.getItem('eneateams_oauth_intent');

    if (intentStr) {
      let intent: OAuthIntent;
      try {
        intent = JSON.parse(intentStr);
      } catch {
        setPhase('error');
        setErrorMsg('Error al leer datos del registro. Intentá de nuevo.');
        return;
      }

      if (intent.role === 'company_admin') {
        // Mostrar formulario para completar datos de empresa
        if (intent.companyName) companyForm.setValue('companyName', intent.companyName);
        if (mounted.current) setPhase('company-complete');
        return;
      }

      if (intent.role === 'employee') {
        // Empleado con código ya validado → crear perfil y redirigir directo
        if (intent.inviteCode && intent.companyId) {
          const { error: profErr } = await supabase.from('profiles').upsert(
            {
              id: user.id,
              role: 'employee',
              company_id: intent.companyId,
              full_name: googleName || user.email?.split('@')[0] || 'Usuario',
              email: user.email,
              questionnaire_completed: false,
            },
            { onConflict: 'id' }
          );
          if (profErr) {
            setPhase('error');
            setErrorMsg('Error al crear tu perfil. Intentá de nuevo.');
            return;
          }
          localStorage.removeItem('eneateams_oauth_intent');
          await refreshUser();
          if (mounted.current) navigate('/questionnaire', { replace: true });
          return;
        }

        // Empleado sin código validado → mostrar formulario para ingresarlo
        if (googleName) employeeForm.setValue('name', googleName);
        if (intent.inviteCode) employeeForm.setValue('inviteCode', intent.inviteCode);
        if (mounted.current) setPhase('employee-complete');
        return;
      }
    }

    // ── PASO 3: Sin intent y sin perfil completo ───────────────────────────
    // Caso típico: el usuario hizo "Continuar con Google" desde el LOGIN
    // pero nunca completó su registro. Si tiene rol pero sin empresa,
    // lo mandamos a completar según su rol.
    if (existingProfile?.role === 'company_admin') {
      if (mounted.current) setPhase('company-complete');
      return;
    }

    // Por defecto (sin empresa) → pedir código de empresa como empleado
    if (googleName) employeeForm.setValue('name', googleName);
    if (mounted.current) setPhase('employee-complete');
  };

  useEffect(() => {
    const mounted = { current: true };
    let cleanup: (() => void) | undefined;

    const run = async () => {
      // ── PASO 1: Intercambio PKCE explícito ──────────────────────────────
      // En producción, el código viene como ?code=... en la URL.
      // Lo intercambiamos explícitamente para evitar race conditions
      // con el AuthProvider.
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
          if (!error && session?.user && mounted.current) {
            await processUser(session.user, mounted);
            return;
          }
          if (error) {
            console.error('[OAuthCallback] PKCE exchange error:', error.message);
          }
        } catch (e) {
          console.error('[OAuthCallback] PKCE exchange exception:', e);
        }
      }

      // ── PASO 2: Sesión ya establecida (el cliente la procesó antes) ──────
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted.current) {
        await processUser(session.user, mounted);
        return;
      }

      // ── PASO 3: Escuchar cambio de auth (último recurso) ─────────────────
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
        if (!mounted.current) return;
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION') && s?.user) {
          await processUser(s.user, mounted);
        }
      });

      cleanup = () => subscription.unsubscribe();

      // ── Timeout de seguridad: 15 s ────────────────────────────────────────
      const timeout = setTimeout(() => {
        if (mounted.current) {
          setPhase(p => {
            if (p === 'loading') {
              setErrorMsg(
                'La autenticación tardó demasiado. Cerrá esta pestaña y volvé a intentarlo.'
              );
              return 'error';
            }
            return p;
          });
        }
      }, 15000);

      const prevCleanup = cleanup;
      cleanup = () => {
        clearTimeout(timeout);
        prevCleanup?.();
      };
    };

    run();

    return () => {
      mounted.current = false;
      cleanup?.();
    };
  }, []);

  // ── Company completion form ────────────────────────────────────────────
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

    // Upsert: el trigger ya creó el perfil con role='employee'.
    // Aquí lo actualizamos con los datos correctos de empresa.
    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        role: 'company_admin',
        company_id: company.id,
        full_name: data.companyName,
        email: userEmail,
        questionnaire_completed: true, // admins no hacen cuestionario
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      setServerError('Error al guardar el perfil. Intentá de nuevo.');
      return;
    }

    localStorage.removeItem('eneateams_oauth_intent');
    await refreshUser();
    navigate('/dashboard/company', { replace: true });
  };

  // ── Employee completion form ───────────────────────────────────────────
  const onEmployeeComplete = async (data: EmployeeData) => {
    setServerError(null);

    const { data: companyRows, error: companyError } = await supabase
      .rpc('get_company_by_invite_code', { p_code: data.inviteCode.trim().toUpperCase() });
    const company = Array.isArray(companyRows) ? companyRows[0] : null;

    if (companyError || !company) {
      employeeForm.setError('inviteCode', {
        message: 'Código inválido. Pedíselo al administrador de tu empresa.',
      });
      return;
    }

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        id: userId,
        role: 'employee',
        company_id: company.id,
        full_name: data.name,
        email: userEmail,
        questionnaire_completed: false,
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      setServerError('Error al guardar el perfil. Intentá de nuevo.');
      return;
    }

    localStorage.removeItem('eneateams_oauth_intent');
    await refreshUser();
    navigate('/questionnaire', { replace: true });
  };

  // ── Render ─────────────────────────────────────────────────────────────

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
          <div className="space-y-3">
            <button
              onClick={() => navigate('/auth/company/signup')}
              className="block w-full py-2 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Volver al registro de empresa
            </button>
            <button
              onClick={() => navigate('/')}
              className="block w-full py-2 px-4 text-slate-500 text-sm hover:text-slate-700"
            >
              Ir al inicio
            </button>
          </div>
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
            <h1 className="text-2xl font-bold text-slate-900">¡Google verificado! ✅</h1>
            <p className="text-slate-500 text-sm mt-1">
              Completá los datos de tu empresa para continuar.
            </p>
          </div>
          <form onSubmit={companyForm.handleSubmit(onCompanyComplete)} className="space-y-4">
            <Input
              label="Nombre de la Empresa"
              {...companyForm.register('companyName')}
              error={companyForm.formState.errors.companyName?.message}
            />
            <Controller
              name="industry"
              control={companyForm.control}
              render={({ field }) => (
                <Combobox
                  label="Industria / Sector"
                  options={INDUSTRIES}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Buscá o escribí tu industria..."
                  allowCustom
                  error={companyForm.formState.errors.industry?.message}
                />
              )}
            />
            <Controller
              name="country"
              control={companyForm.control}
              render={({ field }) => (
                <Combobox
                  label="País"
                  options={COUNTRIES}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Buscá tu país..."
                  error={companyForm.formState.errors.country?.message}
                />
              )}
            />
            <Controller
              name="size"
              control={companyForm.control}
              render={({ field }) => (
                <Combobox
                  label="Tamaño del Equipo"
                  options={TEAM_SIZES}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Seleccioná el tamaño..."
                  error={companyForm.formState.errors.size?.message}
                />
              )}
            />
            {serverError && <p className="text-sm text-red-500 text-center">{serverError}</p>}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={companyForm.formState.isSubmitting}
            >
              Crear Empresa y Continuar →
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
            <h1 className="text-2xl font-bold text-slate-900">¡Google verificado! ✅</h1>
            <p className="text-slate-500 text-sm mt-1">
              Ingresá el código de tu empresa para unirte al equipo.
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
              Unirme al Equipo →
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return null;
};
