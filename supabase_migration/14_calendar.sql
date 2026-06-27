-- ============================================================
-- ENEATEAMS — CALENDARIO (eventos / reuniones)
-- ============================================================
-- Las tareas con due_date ya existen; esto suma "events" para
-- reuniones y recordatorios. RLS: visible para la empresa, edita
-- quien lo creó.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  team_id     UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_by  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT,
  location    TEXT,
  start_at    TIMESTAMPTZ NOT NULL,
  end_at      TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_events_company ON public.events(company_id, start_at);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS events_select ON public.events;
CREATE POLICY events_select ON public.events FOR SELECT
  USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS events_insert ON public.events;
CREATE POLICY events_insert ON public.events FOR INSERT
  WITH CHECK (created_by = auth.uid()
    AND company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS events_update ON public.events;
CREATE POLICY events_update ON public.events FOR UPDATE USING (created_by = auth.uid());

DROP POLICY IF EXISTS events_delete ON public.events;
CREATE POLICY events_delete ON public.events FOR DELETE USING (created_by = auth.uid());
