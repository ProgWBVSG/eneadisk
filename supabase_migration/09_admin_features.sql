-- ============================================================
-- ENEATEAMS — FEATURES DEL ADMINISTRADOR
-- Tabla: one_on_one_notes (notas de reuniones 1-on-1)
-- RPC: get_employees_overview (vista de empleados con bienestar)
-- ============================================================

-- ── NOTAS DE 1-ON-1 ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.one_on_one_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.one_on_one_notes ENABLE ROW LEVEL SECURITY;

-- Solo el admin de la empresa puede ver/crear/borrar notas de sus empleados
DROP POLICY IF EXISTS "one_on_one_admin" ON public.one_on_one_notes;
CREATE POLICY "one_on_one_admin" ON public.one_on_one_notes
  USING (
    company_id = public.get_user_company_id()
    AND public.get_user_role() = 'company_admin'
  )
  WITH CHECK (
    company_id = public.get_user_company_id()
    AND public.get_user_role() = 'company_admin'
    AND author_id = auth.uid()
  );

CREATE INDEX IF NOT EXISTS idx_1on1_employee ON public.one_on_one_notes(employee_id);

-- ── RPC: vista de empleados con bienestar (solo admin) ─────
-- Devuelve cada empleado de la empresa con su energía/estrés promedio
-- de los últimos 14 días y su último check-in. Usado para la página
-- "Personas", alertas de burnout y onboarding.
CREATE OR REPLACE FUNCTION public.get_employees_overview()
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  enneagram_type INTEGER,
  questionnaire_completed BOOLEAN,
  avg_energy NUMERIC,
  avg_stress NUMERIC,
  last_checkin TIMESTAMPTZ,
  checkin_count BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    p.id, p.full_name, p.email, p.enneagram_type, p.questionnaire_completed,
    COALESCE(ROUND(AVG(c.energy), 1), 0) AS avg_energy,
    COALESCE(ROUND(AVG(c.stress), 1), 0) AS avg_stress,
    MAX(c.date) AS last_checkin,
    COUNT(c.id) AS checkin_count
  FROM public.profiles p
  LEFT JOIN public.checkins c
    ON c.user_id = p.id AND c.date >= NOW() - INTERVAL '14 days'
  WHERE p.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND p.role = 'employee'
    AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'company_admin'
  GROUP BY p.id, p.full_name, p.email, p.enneagram_type, p.questionnaire_completed;
$$;
GRANT EXECUTE ON FUNCTION public.get_employees_overview() TO authenticated;

-- ── RPC: check-ins de un empleado (solo admin de su empresa) ──
CREATE OR REPLACE FUNCTION public.get_employee_checkins(p_employee UUID)
RETURNS TABLE (id UUID, date TIMESTAMPTZ, mood TEXT, energy INTEGER, stress INTEGER)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT c.id, c.date, c.mood, c.energy, c.stress
  FROM public.checkins c
  WHERE c.user_id = p_employee
    AND EXISTS (
      SELECT 1 FROM public.profiles admin_p, public.profiles emp_p
      WHERE admin_p.id = auth.uid()
        AND admin_p.role = 'company_admin'
        AND emp_p.id = p_employee
        AND emp_p.company_id = admin_p.company_id
    )
  ORDER BY c.date DESC
  LIMIT 30;
$$;
GRANT EXECUTE ON FUNCTION public.get_employee_checkins(UUID) TO authenticated;
