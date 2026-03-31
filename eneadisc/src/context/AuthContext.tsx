import React, { createContext, useContext, useState, useEffect } from 'react';
import { type Session, type User as SupabaseUser } from '@supabase/supabase-js';
import { supabase, type Profile, type Company } from '../lib/supabase';

// ============================================
// TYPES
// ============================================

export interface AppUser {
  id: string;
  role: 'company_admin' | 'employee';
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
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
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
    if (localStorage.getItem('eneadisk_mock_session')) return; // No refresh needed for mock

    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
      const appUser = await buildAppUser(currentSession.user);
      setUser(appUser);
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    // VERCEL MOCK DB INTERCEPT
    const mockSessionStr = localStorage.getItem('eneadisk_mock_session');
    if (mockSessionStr) {
      try {
        const mockUser = JSON.parse(mockSessionStr);
        setUser(mockUser);
        setIsLoading(false);
        return; // Don't subscribe to Supabase
      } catch (e) {
        localStorage.removeItem('eneadisk_mock_session');
      }
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session: s } }) => {
      setSession(s);
      if (s?.user) {
        try {
          const appUser = await buildAppUser(s.user);
          setUser(appUser);
        } catch (e) {
          console.error("Error building app user", e);
        }
      }
      setIsLoading(false);
    }).catch((err) => {
      console.error("Error fetching session, Supabase might be paused:", err);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, s) => {
      setSession(s);
      if (event === 'SIGNED_IN' && s?.user) {
        const appUser = await buildAppUser(s.user);
        setUser(appUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED' && s?.user) {
        // Silently refresh user data
        const appUser = await buildAppUser(s.user);
        setUser(appUser);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    // Mini-DB Vercel Intercept
    if (password === 'vercel123') {
      let mockUser: AppUser | null = null;
      if (email === 'admin@eneadisk.com') {
        mockUser = { id: 'mock-admin-1', role: 'company_admin', companyId: 'mock-company-1', name: 'Empresa Demo (Vercel)', email, inviteCode: 'ENEA-DEMO', questionnaireCompleted: true };
      } else if (email === 'empleado@eneadisk.com') {
        mockUser = { id: 'mock-employee-1', role: 'employee', companyId: 'mock-company-1', name: 'Empleado Demo (Vercel)', email, enneagramType: 3, questionnaireCompleted: true };
      }
      if (mockUser) {
        localStorage.setItem('eneadisk_mock_session', JSON.stringify(mockUser));
        setUser(mockUser);
        return { error: null };
      }
      return { error: 'Correo inválido para modo Demo Local' };
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { error: 'Email o contraseña incorrectos' };
      }
      return { error: error.message };
    }
    return { error: null };
  };

  const logout = async () => {
    if (localStorage.getItem('eneadisk_mock_session')) {
      localStorage.removeItem('eneadisk_mock_session');
      setUser(null);
      window.location.href = '/';
      return;
    }

    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    window.location.href = '/';
  };

  if (isLoading) {
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
