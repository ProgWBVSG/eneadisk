import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
