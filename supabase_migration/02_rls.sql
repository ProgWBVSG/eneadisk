-- ============================================================
-- ENEATEAMS — ROW LEVEL SECURITY (RLS)
-- Ejecutar DESPUÉS de 01_schema.sql
-- ============================================================

-- ============================================================
-- Habilitar RLS en todas las tablas
-- ============================================================
ALTER TABLE public.companies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checkins    ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Función helper: obtiene el company_id del usuario actual
-- ============================================================
CREATE OR REPLACE FUNCTION public.my_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- Función helper: obtiene el role del usuario actual
-- ============================================================
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ============================================================
-- POLICIES: companies
-- ============================================================

-- Los admins ven su propia empresa
CREATE POLICY "companies_select_own"
  ON public.companies FOR SELECT
  USING (id = public.my_company_id());

-- Los empleados también pueden ver su empresa (para mostrar nombre etc.)
-- (ya cubierto por la policy anterior porque my_company_id() funciona para ambos roles)

-- Solo el owner puede actualizar
CREATE POLICY "companies_update_owner"
  ON public.companies FOR UPDATE
  USING (owner_id = auth.uid());

-- Cualquier usuario autenticado puede insertar (al registrarse como empresa)
CREATE POLICY "companies_insert_auth"
  ON public.companies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Solo el owner puede borrar
CREATE POLICY "companies_delete_owner"
  ON public.companies FOR DELETE
  USING (owner_id = auth.uid());

-- ============================================================
-- POLICIES: profiles
-- ============================================================

-- Cada usuario ve su propio perfil
CREATE POLICY "profiles_select_self"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

-- Los admins ven todos los perfiles de su empresa
CREATE POLICY "profiles_select_company_admin"
  ON public.profiles FOR SELECT
  USING (
    public.my_role() = 'company_admin'
    AND company_id = public.my_company_id()
  );

-- Cada usuario puede insertar/actualizar su propio perfil
CREATE POLICY "profiles_insert_self"
  ON public.profiles FOR INSERT
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_self"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- ============================================================
-- POLICIES: teams
-- ============================================================

-- Los admins ven todos los equipos de su empresa
CREATE POLICY "teams_select_admin"
  ON public.teams FOR SELECT
  USING (
    public.my_role() = 'company_admin'
    AND company_id = public.my_company_id()
  );

-- Los empleados ven los equipos donde son miembros
CREATE POLICY "teams_select_member"
  ON public.teams FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = teams.id AND user_id = auth.uid()
    )
  );

-- Solo admins pueden crear/modificar/eliminar equipos
CREATE POLICY "teams_insert_admin"
  ON public.teams FOR INSERT
  WITH CHECK (public.my_role() = 'company_admin');

CREATE POLICY "teams_update_admin"
  ON public.teams FOR UPDATE
  USING (
    public.my_role() = 'company_admin'
    AND company_id = public.my_company_id()
  );

CREATE POLICY "teams_delete_admin"
  ON public.teams FOR DELETE
  USING (
    public.my_role() = 'company_admin'
    AND company_id = public.my_company_id()
  );

-- ============================================================
-- POLICIES: team_members
-- ============================================================

-- Los admins ven todos los miembros de sus equipos
CREATE POLICY "team_members_select_admin"
  ON public.team_members FOR SELECT
  USING (
    public.my_role() = 'company_admin'
    AND EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = team_members.team_id
        AND company_id = public.my_company_id()
    )
  );

-- Los empleados ven a sus compañeros de equipo
CREATE POLICY "team_members_select_member"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm2
      WHERE tm2.team_id = team_members.team_id
        AND tm2.user_id = auth.uid()
    )
  );

-- Solo admins pueden agregar/quitar miembros
CREATE POLICY "team_members_insert_admin"
  ON public.team_members FOR INSERT
  WITH CHECK (public.my_role() = 'company_admin');

CREATE POLICY "team_members_delete_admin"
  ON public.team_members FOR DELETE
  USING (public.my_role() = 'company_admin');

-- ============================================================
-- POLICIES: tasks
-- ============================================================

-- Cada usuario ve sus propias tareas
CREATE POLICY "tasks_select_own"
  ON public.tasks FOR SELECT
  USING (user_id = auth.uid());

-- Los admins ven tareas de equipo de su empresa
CREATE POLICY "tasks_select_team_admin"
  ON public.tasks FOR SELECT
  USING (
    public.my_role() = 'company_admin'
    AND team_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = tasks.team_id
        AND company_id = public.my_company_id()
    )
  );

-- Los empleados ven tareas de equipo donde son miembros
CREATE POLICY "tasks_select_team_member"
  ON public.tasks FOR SELECT
  USING (
    team_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_id = tasks.team_id AND user_id = auth.uid()
    )
  );

-- Usuarios pueden crear sus propias tareas
CREATE POLICY "tasks_insert_own"
  ON public.tasks FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Admins pueden crear tareas de equipo
CREATE POLICY "tasks_insert_admin_team"
  ON public.tasks FOR INSERT
  WITH CHECK (
    public.my_role() = 'company_admin'
    AND team_id IS NOT NULL
  );

-- Usuarios actualizan sus propias tareas
CREATE POLICY "tasks_update_own"
  ON public.tasks FOR UPDATE
  USING (user_id = auth.uid());

-- Admins actualizan tareas de sus equipos
CREATE POLICY "tasks_update_admin"
  ON public.tasks FOR UPDATE
  USING (
    public.my_role() = 'company_admin'
    AND team_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = tasks.team_id
        AND company_id = public.my_company_id()
    )
  );

-- Usuarios borran sus propias tareas
CREATE POLICY "tasks_delete_own"
  ON public.tasks FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "tasks_delete_admin"
  ON public.tasks FOR DELETE
  USING (
    public.my_role() = 'company_admin'
    AND team_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.teams
      WHERE id = tasks.team_id
        AND company_id = public.my_company_id()
    )
  );

-- ============================================================
-- POLICIES: checkins
-- ============================================================

-- Cada usuario ve sus propios check-ins
CREATE POLICY "checkins_select_own"
  ON public.checkins FOR SELECT
  USING (user_id = auth.uid());

-- Los admins ven los check-ins de todos en su empresa
CREATE POLICY "checkins_select_admin"
  ON public.checkins FOR SELECT
  USING (
    public.my_role() = 'company_admin'
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = checkins.user_id
        AND company_id = public.my_company_id()
    )
  );

-- Cada usuario crea, actualiza y borra sus propios check-ins
CREATE POLICY "checkins_insert_own"
  ON public.checkins FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "checkins_update_own"
  ON public.checkins FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "checkins_delete_own"
  ON public.checkins FOR DELETE
  USING (user_id = auth.uid());
