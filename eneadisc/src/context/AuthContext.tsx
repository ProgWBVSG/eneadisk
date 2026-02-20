
import React, { createContext, useContext, useState, useEffect } from 'react';
import { clearDemoData } from '../utils/demoData';

interface User {
  id: string;
  role: 'company_admin' | 'employee';
  companyId: string;
  name?: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage on mount
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  const logout = () => {
    // Clear demo data if it was a demo session
    if (user && user.id.startsWith('demo-')) {
      clearDemoData();
    }
    setUser(null);
    localStorage.removeItem('currentUser');
    window.location.href = '/'; // Force refresh/redirect
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50">Cargando...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
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
