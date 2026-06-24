-- ============================================================
-- ENEATEAMS — FEATURES DEL EMPLEADO
-- Tablas: kudos (reconocimiento), goals (metas), journal (diario)
-- + RPC get_team_mood (termómetro de equipo)
-- ============================================================

-- ── KUDOS (reconocimiento entre pares) ─────────────────────
CREATE TABLE IF NOT EXISTS public.kudos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  from_user   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category    TEXT NOT NULL DEFAULT 'general'
              CHECK (category IN ('general','colaboracion','creatividad','liderazgo','apoyo','esfuerzo')),
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.kudos ENABLE ROW LEVEL SECURITY;

-- Ver los kudos de mi empresa
DROP POLICY IF EXISTS "kudos_select_company" ON public.kudos;
CREATE POLICY "kudos_select_company" ON public.kudos FOR SELECT
  USING (company_id = public.get_user_company_id());

-- Crear kudos donde yo soy el emisor y es de mi empresa
DROP POLICY IF EXISTS "kudos_insert_own" ON public.kudos;
CREATE POLICY "kudos_insert_own" ON public.kudos FOR INSERT
  WITH CHECK (from_user = auth.uid() AND company_id = public.get_user_company_id());

CREATE INDEX IF NOT EXISTS idx_kudos_company ON public.kudos(company_id);
CREATE INDEX IF NOT EXISTS idx_kudos_to ON public.kudos(to_user);

-- ── GOALS (metas de desarrollo personal) ───────────────────
CREATE TABLE IF NOT EXISTS public.goals (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  area         TEXT,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','done')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "goals_own" ON public.goals;
CREATE POLICY "goals_own" ON public.goals
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_goals_user ON public.goals(user_id);

-- ── JOURNAL (diario de crecimiento) ────────────────────────
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prompt     TEXT,
  content    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "journal_own" ON public.journal_entries;
CREATE POLICY "journal_own" ON public.journal_entries
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_journal_user ON public.journal_entries(user_id);

-- ── RPC: termómetro de equipo (promedios anónimos de la empresa) ──
CREATE OR REPLACE FUNCTION public.get_team_mood()
RETURNS TABLE (avg_energy NUMERIC, avg_stress NUMERIC, checkin_count BIGINT, member_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH company AS (
    SELECT company_id FROM public.profiles WHERE id = auth.uid()
  ),
  members AS (
    SELECT id FROM public.profiles
    WHERE company_id = (SELECT company_id FROM company)
  )
  SELECT
    COALESCE(ROUND(AVG(c.energy), 1), 0) AS avg_energy,
    COALESCE(ROUND(AVG(c.stress), 1), 0) AS avg_stress,
    COUNT(c.id) AS checkin_count,
    (SELECT COUNT(*) FROM members) AS member_count
  FROM public.checkins c
  WHERE c.user_id IN (SELECT id FROM members)
    AND c.date >= NOW() - INTERVAL '7 days';
$$;
GRANT EXECUTE ON FUNCTION public.get_team_mood() TO authenticated;
