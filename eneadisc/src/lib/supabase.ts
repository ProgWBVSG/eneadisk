import { createClient } from '@supabase/supabase-js';

// ── Configuración del proyecto Supabase ──────────────────────────────
// Para cambiar de proyecto:
//   1. Reemplazá FALLBACK_URL y FALLBACK_KEY con los valores del nuevo proyecto.
//   2. O (recomendado) creá eneadisc/.env.local con:
//        VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
//        VITE_SUPABASE_ANON_KEY=TU_ANON_KEY
//   3. En Vercel → Settings → Environment Variables, agregá las mismas variables.
//
// PROYECTO ACTUAL: vgdexspqcrkvssawblze (cuenta nueva)
// ── Para migrar: cambiá solo estas dos líneas ────────────────────────
const FALLBACK_URL = 'https://vgdexspqcrkvssawblze.supabase.co';
const FALLBACK_KEY = 'sb_publishable_LwAFata94z048xPDfB1kUQ_lp_d4DF-';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || FALLBACK_URL;
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || FALLBACK_KEY;

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
  role: 'company_admin' | 'supervisor' | 'employee';
  company_id?: string;
  full_name?: string;
  phone?: string;
  enneagram_type?: number;
  questionnaire_completed: boolean;
  created_at: string;
  updated_at: string;
}
