-- ============================================================
-- ENEATEAMS — JERARQUÍAS ORGANIZACIONALES (SUPERVISORES)
-- ============================================================
-- Agrega un rol intermedio "supervisor": lidera uno o más equipos
-- y gestiona solo a los miembros de esos equipos.
-- ============================================================

-- ── 1. Agregar rol 'supervisor' ────────────────────────────
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('company_admin', 'supervisor', 'employee'));

-- ── 2. Líder del equipo (supervisor a cargo) ───────────────
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_teams_lead ON public.teams(lead_id);

-- ── 3. Revisión de tareas (por el supervisor) ──────────────
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS review_status TEXT
  CHECK (review_status IN ('confirmed', 'needs_fix'));
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS review_note TEXT;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- ── 4. Helper: ¿el caller supervisa a este empleado? ───────
-- True si auth.uid() es lead de algún equipo que contiene a p_employee.
CREATE OR REPLACE FUNCTION public.is_supervisor_of(p_employee UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams t
    JOIN public.team_members tm ON tm.team_id = t.id
    WHERE t.lead_id = auth.uid() AND tm.user_id = p_employee
  );
$$;

-- ── 5. RLS: el supervisor ve a su gente ────────────────────
DROP POLICY IF EXISTS "profiles_supervisor_read" ON public.profiles;
CREATE POLICY "profiles_supervisor_read" ON public.profiles FOR SELECT
  USING (public.is_supervisor_of(id));

-- El supervisor ve y revisa las tareas de su gente
DROP POLICY IF EXISTS "tasks_supervisor_select" ON public.tasks;
CREATE POLICY "tasks_supervisor_select" ON public.tasks FOR SELECT
  USING (public.is_supervisor_of(user_id));
DROP POLICY IF EXISTS "tasks_supervisor_update" ON public.tasks;
CREATE POLICY "tasks_supervisor_update" ON public.tasks FOR UPDATE
  USING (public.is_supervisor_of(user_id));
-- El supervisor puede asignar tareas a su gente
DROP POLICY IF EXISTS "tasks_supervisor_insert" ON public.tasks;
CREATE POLICY "tasks_supervisor_insert" ON public.tasks FOR INSERT
  WITH CHECK (public.is_supervisor_of(user_id) OR user_id = auth.uid());

-- El supervisor puede dar kudos a su gente (ya cubierto por kudos_insert_own
-- que exige from_user = auth.uid() y misma empresa). Las notas 1-on-1 las
-- dejamos solo para admin; el supervisor usa la revisión de tareas.

-- ── 6. RPC: gente que superviso (con bienestar agregado) ───
CREATE OR REPLACE FUNCTION public.get_supervised_people()
RETURNS TABLE (
  id UUID, full_name TEXT, enneagram_type INTEGER, questionnaire_completed BOOLEAN,
  avg_energy NUMERIC, avg_stress NUMERIC, checkin_count BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT DISTINCT
    p.id, p.full_name, p.enneagram_type, p.questionnaire_completed,
    COALESCE(ROUND(AVG(c.energy) OVER (PARTITION BY p.id), 1), 0),
    COALESCE(ROUND(AVG(c.stress) OVER (PARTITION BY p.id), 1), 0),
    COUNT(c.id) OVER (PARTITION BY p.id)
  FROM public.profiles p
  JOIN public.team_members tm ON tm.user_id = p.id
  JOIN public.teams t ON t.id = tm.team_id
  LEFT JOIN public.checkins c ON c.user_id = p.id AND c.date >= NOW() - INTERVAL '14 days'
  WHERE t.lead_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.get_supervised_people() TO authenticated;

-- ── 7. RPC: pulso agregado de mi gente (anónimo) ───────────
CREATE OR REPLACE FUNCTION public.get_supervised_mood()
RETURNS TABLE (avg_energy NUMERIC, avg_stress NUMERIC, checkin_count BIGINT, people_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH my_people AS (
    SELECT DISTINCT tm.user_id
    FROM public.teams t JOIN public.team_members tm ON tm.team_id = t.id
    WHERE t.lead_id = auth.uid()
  )
  SELECT
    COALESCE(ROUND(AVG(c.energy), 1), 0),
    COALESCE(ROUND(AVG(c.stress), 1), 0),
    COUNT(c.id),
    (SELECT COUNT(*) FROM my_people)
  FROM public.checkins c
  WHERE c.user_id IN (SELECT user_id FROM my_people)
    AND c.date >= NOW() - INTERVAL '7 days';
$$;
GRANT EXECUTE ON FUNCTION public.get_supervised_mood() TO authenticated;

-- ── 8. RPC admin: cambiar rol de un empleado (promover/degradar) ──
CREATE OR REPLACE FUNCTION public.admin_set_role(p_employee UUID, p_role TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF p_role NOT IN ('supervisor', 'employee') THEN
    RAISE EXCEPTION 'Rol inválido';
  END IF;
  -- Solo un admin de la misma empresa puede cambiar el rol
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles admin_p, public.profiles emp_p
    WHERE admin_p.id = auth.uid() AND admin_p.role = 'company_admin'
      AND emp_p.id = p_employee AND emp_p.company_id = admin_p.company_id
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE public.profiles SET role = p_role WHERE id = p_employee;
  -- Si se degrada a empleado, lo quitamos como líder de cualquier equipo
  IF p_role = 'employee' THEN
    UPDATE public.teams SET lead_id = NULL WHERE lead_id = p_employee;
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_role(UUID, TEXT) TO authenticated;

-- ── 9. RPC admin: asignar/quitar líder de un equipo ────────
CREATE OR REPLACE FUNCTION public.admin_set_team_lead(p_team UUID, p_lead UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles admin_p, public.teams t
    WHERE admin_p.id = auth.uid() AND admin_p.role = 'company_admin'
      AND t.id = p_team AND t.company_id = admin_p.company_id
  ) THEN
    RAISE EXCEPTION 'No autorizado';
  END IF;
  UPDATE public.teams SET lead_id = p_lead WHERE id = p_team;
END;
$$;
GRANT EXECUTE ON FUNCTION public.admin_set_team_lead(UUID, UUID) TO authenticated;

-- ── 10. Actualizar get_employees_overview: incluir supervisores + rol ──
DROP FUNCTION IF EXISTS public.get_employees_overview();
CREATE OR REPLACE FUNCTION public.get_employees_overview()
RETURNS TABLE (
  id UUID, full_name TEXT, email TEXT, role TEXT, enneagram_type INTEGER,
  questionnaire_completed BOOLEAN, avg_energy NUMERIC, avg_stress NUMERIC,
  last_checkin TIMESTAMPTZ, checkin_count BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    p.id, p.full_name, p.email, p.role, p.enneagram_type, p.questionnaire_completed,
    COALESCE(ROUND(AVG(c.energy), 1), 0) AS avg_energy,
    COALESCE(ROUND(AVG(c.stress), 1), 0) AS avg_stress,
    MAX(c.date) AS last_checkin,
    COUNT(c.id) AS checkin_count
  FROM public.profiles p
  LEFT JOIN public.checkins c
    ON c.user_id = p.id AND c.date >= NOW() - INTERVAL '14 days'
  WHERE p.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND p.role IN ('employee', 'supervisor')
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'company_admin'
  GROUP BY p.id, p.full_name, p.email, p.role, p.enneagram_type, p.questionnaire_completed;
$$;
GRANT EXECUTE ON FUNCTION public.get_employees_overview() TO authenticated;
