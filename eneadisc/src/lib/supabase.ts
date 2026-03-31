import { createClient } from '@supabase/supabase-js';

// Valores por defecto para prevenir una pantalla blanca ("White Screen of Death") en Vercel
// si las variables de entorno aún no fueron configuradas en el dashboard.
// Nota: ANON_KEY es pública y segura para estar en el frontend (RLS protege los datos de la DB).
const FALLBACK_URL = 'https://bmhpxjnuugufecmizzve.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaHB4am51dWd1ZmVjbWl6enZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Nzc4MTIsImV4cCI6MjA4OTU1MzgxMn0.cDVf0ZlVIWDOl5wcZG2cYd-caqCiTUjWbGv3ro7aP3M';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || FALLBACK_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || FALLBACK_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan variables de entorno de Supabase y Fallbacks no están configurados.');
}

export const supabase = createClient(supabaseUrl || FALLBACK_URL, supabaseAnonKey || FALLBACK_KEY);

// ============================================
// DATABASE TYPES
// ============================================

export interface Company {
  id: string;
  name: string;
  industry?: string;
  size?: string;
  country?: string;
  invite_code: string;
  owner_id: string;
  created_at: string;
}

export interface Profile {
  id: string;
  role: 'company_admin' | 'employee';
  company_id?: string;
  full_name?: string;
  phone?: string;
  enneagram_type?: number;
  questionnaire_completed: boolean;
  created_at: string;
  updated_at: string;
}
