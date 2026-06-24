import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Session, type User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, type Profile, type Company } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

export interface AppUser {
  id: string;
  role: 'company_admin' | 'supervisor' | 'employee';
  companyId: string;
  name: string;
  email: string;
  inviteCode?: string;
  enneagramType?: number;
  questionnaireCompleted?: boolean;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  signInWithGoogle: (
    role: 'company_admin' | 'employee',
    extraData?: { companyName?: string; inviteCode?: string; companyId?: string }
  ) => Promise<{ error: string | null }>;
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function buildAppUser(supabaseUser: SupabaseUser): Promise<AppUser | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .single();

  if (profileError || !profile) return null;

  const typedProfile = profile as Profile;

  let inviteCode: string | undefined;
  let companyId = typedProfile.company_id || '';

  if (typedProfile.role === 'company_admin' && companyId) {
    const { data: company } = await supabase
      .from('companies')
      .select('invite_code')
      .eq('id', companyId)
      .single();
    if (company) inviteCode = (company as Pick<Company, 'invite_code'>).invite_code;
  }

  return {
    id: supabaseUser.id,
    role: typedProfile.role,
    companyId,
    name: typedProfile.full_name || supabaseUser.email || 'Usuario',
    email: supabaseUser.email || '',
    inviteCode,
    enneagramType: typedProfile.enneagram_type ?? undefined,
    questionnaireCompleted: typedProfile.questionnaire_completed,
  };
}

// ============================================
// PROVIDER
// ============================================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    if (localStorage.getItem('eneateams_mock_session')) return; // No refresh needed for mock

    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      const appUser = await buildAppUser(currentSession.user);
      setUser(appUser);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    let mounted = true;

    // VERCEL MOCK DB INTERCEPT
    const mockSessionStr = localStorage.getItem('eneateams_mock_session');
    if (mockSessionStr) {
      try {
        const mockUser = JSON.parse(mockSessionStr);
        setUser(mockUser);
        setIsLoading(false);
        return; // Don't subscribe to Supabase
      } catch (e) {
        localStorage.removeItem('eneateams_mock_session');
      }
    }

    // Fallback: Evitar pantalla de carga infinita pase lo que pase
    const safetyTimeout = setTimeout(() => {
      if (mounted) setIsLoading(false);
    }, 5000);

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      if (!mounted) return;
      setSession(s);
      if (s?.user) {
        try {
          const appUser = await buildAppUser(s.user);
          if (mounted) setUser(appUser);
        } catch (e) {
          console.error("Error building app user", e);
        }
      }
      if (mounted) {
        setIsLoading(false);
        clearTimeout(safetyTimeout);
      }
    }).catch((err) => {
      console.error("Error fetching session:", err);
      if (mounted) {
        setIsLoading(false);
        clearTimeout(safetyTimeout);
      }
    });

    // Listen for auth changes.
    // IMPORTANTE: el callback de onAuthStateChange NO debe hacer llamadas async
    // a Supabase directamente — eso deadlockea el lock interno de tokens de
    // supabase-js (queda colgado "Verificando..." en el callback OAuth).
    // Por eso envolvemos buildAppUser en setTimeout(0): se ejecuta DESPUÉS de
    // que onAuthStateChange libera el lock.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, s) => {
      if (!mounted) return;
      setSession(s);

      if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && s?.user) {
        setTimeout(async () => {
          if (!mounted) return;
          try {
            const appUser = await buildAppUser(s.user);
            if (mounted) setUser(appUser);
          } catch (e) {
            console.error('Auth context error:', e);
          } finally {
            if (mounted) {
              setIsLoading(false);
              clearTimeout(safetyTimeout);
            }
          }
        }, 0);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setUser(null);
      }

      if (mounted) {
        setIsLoading(false);
        clearTimeout(safetyTimeout);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null; needsConfirmation?: boolean }> => {
    // Mini-DB Vercel Intercept
    if (password === 'vercel123') {
      let mockUser: AppUser | null = null;
      if (email === 'admin@eneateams.com') {
        mockUser = { id: 'mock-admin-1', role: 'company_admin', companyId: 'mock-company-1', name: 'Empresa Demo (Vercel)', email, inviteCode: 'ENEA-DEMO', questionnaireCompleted: true };
      } else if (email === 'empleado@eneateams.com') {
        mockUser = { id: 'mock-employee-1', role: 'employee', companyId: 'mock-company-1', name: 'Empleado Demo (Vercel)', email, enneagramType: 3, questionnaireCompleted: true };
      }
      if (mockUser) {
        localStorage.setItem('eneateams_mock_session', JSON.stringify(mockUser));
        setUser(mockUser);
        return { error: null };
      }
      return { error: 'Correo inválido para modo Demo Local' };
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('invalid login credentials')) {
        return { error: 'Email o contraseña incorrectos' };
      }
      // Cuenta creada pero email nunca confirmado → dead-end clásico.
      // Devolvemos un flag para que la pantalla ofrezca reenviar el código.
      if (msg.includes('email not confirmed') || msg.includes('not confirmed')) {
        return {
          error: 'Tu cuenta todavía no está confirmada. Te reenviamos un código a tu email.',
          needsConfirmation: true,
        };
      }
      return { error: error.message };
    }

    // Construir el usuario AQUÍ y esperar a que esté listo ANTES de devolver.
    // Si no, la pantalla de login navega al dashboard antes de que el user
    // exista, y el ProtectedRoute rebota al inicio ("/"). signInWithPassword
    // ya liberó el lock, así que esta query no se deadlockea.
    if (data.user) {
      try {
        const appUser = await buildAppUser(data.user);
        setUser(appUser);
        setSession(data.session);
      } catch (e) {
        console.error('Error building user on login:', e);
      }
    }
    return { error: null };
  };

  const signInWithGoogle = async (
    role: 'company_admin' | 'employee',
    extraData?: { companyName?: string; inviteCode?: string; companyId?: string }
  ): Promise<{ error: string | null }> => {
    localStorage.setItem('eneateams_oauth_intent', JSON.stringify({ role, ...extraData }));

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      localStorage.removeItem('eneateams_oauth_intent');
      return { error: error.message };
    }
    return { error: null };
  };

  const logout = async () => {
    if (localStorage.getItem('eneateams_mock_session')) {
      localStorage.removeItem('eneateams_mock_session');
      setUser(null);
      window.location.href = '/';
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.location.href = '/';
  };

  // No bloquear /auth/callback con el spinner — OAuthCallback maneja su propio estado
  const isCallbackPage = typeof window !== 'undefined' && window.location.pathname === '/auth/callback';

  if (isLoading && !isCallbackPage) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      refreshUser,
      signInWithGoogle,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
