-- ============================================================
-- ENEATEAMS — FIX RLS DEFINITIVO
-- Borra TODAS las políticas existentes y las recrea limpias
-- ============================================================

-- ── Borrar TODAS las políticas de todas las tablas ──────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles','companies','teams','team_members','tasks','checkins')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ── Borrar funciones helper si existen ──────────────────────
DROP FUNCTION IF EXISTS public.my_company_id();
DROP FUNCTION IF EXISTS public.my_role();

-- ── Asegurarse que RLS está activado ────────────────────────
ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "profiles_self"
  ON public.profiles
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_admin_read"
  ON public.profiles FOR SELECT
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'company_admin'
  );

-- ============================================================
-- COMPANIES
-- ============================================================
CREATE POLICY "companies_insert"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "companies_owner_select"
  ON public.companies FOR SELECT
  USING (owner_id = auth.uid());

CREATE POLICY "companies_member_select"
  ON public.companies FOR SELECT
  USING (
    id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "companies_owner_update"
  ON public.companies FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "companies_owner_delete"
  ON public.companies FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================
-- TEAMS
-- ============================================================
CREATE POLICY "teams_all"
  ON public.teams
  USING (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
  );

-- ============================================================
-- TEAM MEMBERS
-- ============================================================
CREATE POLICY "team_members_select"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.profiles p ON p.company_id = t.company_id
      WHERE t.id = team_members.team_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "team_members_insert"
  ON public.team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.profiles p ON p.company_id = t.company_id
      WHERE t.id = team_id AND p.id = auth.uid()
    )
  );

CREATE POLICY "team_members_delete"
  ON public.team_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.profiles p ON p.company_id = t.company_id AND p.role = 'company_admin'
      WHERE t.id = team_members.team_id AND p.id = auth.uid()
    )
  );

-- ============================================================
-- TASKS
-- ============================================================
CREATE POLICY "tasks_select"
  ON public.tasks FOR SELECT
  USING (
    user_id = auth.uid()
    OR (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.team_members WHERE team_id = tasks.team_id AND user_id = auth.uid()
    ))
    OR (team_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.teams t
      JOIN public.profiles p ON p.company_id = t.company_id AND p.role = 'company_admin'
      WHERE t.id = tasks.team_id AND p.id = auth.uid()
    ))
  );

CREATE POLICY "tasks_insert"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "tasks_modify"
  ON public.tasks FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "tasks_delete"
  ON public.tasks FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================
-- CHECKINS
-- ============================================================
CREATE POLICY "checkins_self"
  ON public.checkins
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "checkins_admin_read"
  ON public.checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p_admin
      JOIN public.profiles p_emp ON p_emp.company_id = p_admin.company_id
      WHERE p_admin.id = auth.uid()
        AND p_admin.role = 'company_admin'
        AND p_emp.id = checkins.user_id
    )
  );
