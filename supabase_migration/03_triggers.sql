-- ============================================================
-- ENEATEAMS — TRIGGERS Y FUNCIONES
-- Ejecutar DESPUÉS de 02_rls.sql
-- ============================================================

-- ============================================================
-- Trigger: updated_at automático en profiles y teams
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER trg_teams_updated_at
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- Trigger: crear perfil automáticamente al registrarse
-- (Funciona para email/password Y para OAuth con Google)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role      TEXT;
  v_name      TEXT;
  v_company   UUID;
BEGIN
  -- Leer metadata del usuario (viene del signUp options.data o de Google OAuth)
  v_role    := COALESCE(NEW.raw_user_meta_data->>'role', 'employee');
  v_name    := COALESCE(
                 NEW.raw_user_meta_data->>'full_name',
                 NEW.raw_user_meta_data->>'name',   -- Google OAuth
                 NEW.email
               );
  v_company := (NEW.raw_user_meta_data->>'company_id')::UUID;

  -- Insertar perfil solo si no existe (para evitar duplicados por OAuth)
  INSERT INTO public.profiles (id, role, company_id, full_name, email, questionnaire_completed)
  VALUES (
    NEW.id,
    v_role,
    v_company,
    v_name,
    NEW.email,
    FALSE
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Eliminar trigger anterior si existe, y recrear
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Función de utilidad: obtener empleados de una empresa
-- (usada por la app para listar miembros disponibles)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_company_employees(p_company_id UUID)
RETURNS TABLE (
  id             UUID,
  full_name      TEXT,
  email          TEXT,
  enneagram_type INTEGER,
  company_id     UUID
)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT
    p.id,
    p.full_name,
    p.email,
    p.enneagram_type,
    p.company_id
  FROM public.profiles p
  WHERE p.company_id = p_company_id
    AND p.role = 'employee';
$$;
