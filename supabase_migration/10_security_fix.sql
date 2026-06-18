-- ============================================================
-- ENEATEAMS — FIX DE SEGURIDAD CRÍTICO
-- ============================================================
-- Problema: la policy profiles_self permite a un usuario actualizar
-- su PROPIO perfil completo, incluyendo `role` y `company_id`. Esto
-- permite escalada de privilegios:
--   • Un empleado puede ponerse role='company_admin' y ver datos de
--     toda la empresa (bienestar, check-ins, etc.)
--   • Un empleado puede cambiar su company_id y saltar a otra empresa.
--
-- Solución: un trigger BEFORE UPDATE que, cuando un usuario normal
-- (auth.uid() = su propio id) modifica un perfil YA vinculado a una
-- empresa, revierte cualquier cambio de `role` o `company_id`.
--
-- Permite el registro (cuando company_id todavía es NULL se pueden
-- setear) y permite que el service_role administre (auth.uid() es NULL).
-- ============================================================

CREATE OR REPLACE FUNCTION public.protect_profile_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  -- Solo aplica cuando el cambio lo hace el propio usuario desde el cliente
  -- (auth.uid() = NEW.id) y su perfil YA está vinculado a una empresa.
  -- El service_role (auth.uid() IS NULL) puede administrar libremente.
  IF auth.uid() = NEW.id AND OLD.company_id IS NOT NULL THEN
    NEW.role := OLD.role;
    NEW.company_id := OLD.company_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile ON public.profiles;
CREATE TRIGGER trg_protect_profile
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_fields();

-- ============================================================
-- DEFENSA EN PROFUNDIDAD (endurecer otros INSERTs)
-- ============================================================

-- COMPANIES: al crear una empresa, el owner debe ser uno mismo
-- (antes: cualquier autenticado podía crear una empresa con owner ajeno).
DROP POLICY IF EXISTS "companies_insert_auth" ON public.companies;
DROP POLICY IF EXISTS "companies_insert" ON public.companies;
CREATE POLICY "companies_insert" ON public.companies FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- TASKS: al crear una tarea, el user_id debe ser uno mismo
-- (antes: cualquier autenticado podía crear tareas para otros).
DROP POLICY IF EXISTS "tasks_insert" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_own" ON public.tasks;
DROP POLICY IF EXISTS "tasks_insert_admin_team" ON public.tasks;
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT
  WITH CHECK (user_id = auth.uid());
