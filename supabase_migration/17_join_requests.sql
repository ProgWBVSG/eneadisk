-- ============================================================
-- ENEATEAMS — SOLICITUDES DE INGRESO (admisión con aprobación)
-- ============================================================
-- El operario se registra con el código de invitación pero NO entra
-- directo: queda como solicitud pendiente. El admin la aprueba y recién
-- ahí el operario se vincula a la empresa. Evita ingresos desconocidos.
-- Todo el acceso pasa por funciones SECURITY DEFINER (RLS sin políticas
-- = acceso directo denegado; solo las funciones validadas operan).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.join_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  decided_at  TIMESTAMPTZ,
  UNIQUE (user_id, company_id)
);
CREATE INDEX IF NOT EXISTS idx_jr_company_status ON public.join_requests(company_id, status);
ALTER TABLE public.join_requests ENABLE ROW LEVEL SECURITY;

-- ── Pedir unirse (el operario, con el código) ───────────────
CREATE OR REPLACE FUNCTION public.request_to_join(p_code TEXT)
RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_company UUID; v_name TEXT; v_email TEXT; v_existing UUID;
BEGIN
  SELECT id INTO v_company FROM public.companies WHERE UPPER(invite_code) = UPPER(TRIM(p_code));
  IF v_company IS NULL THEN RAISE EXCEPTION 'Código inválido'; END IF;

  SELECT full_name, email, company_id INTO v_name, v_email, v_existing
  FROM public.profiles WHERE id = auth.uid();

  IF v_existing = v_company THEN RETURN 'approved'; END IF; -- ya es miembro

  INSERT INTO public.join_requests (company_id, user_id, full_name, email, status)
    VALUES (v_company, auth.uid(), v_name, v_email, 'pending')
    ON CONFLICT (user_id, company_id)
    DO UPDATE SET status = 'pending', created_at = NOW(), decided_at = NULL;
  RETURN 'pending';
END;
$$;
GRANT EXECUTE ON FUNCTION public.request_to_join(TEXT) TO authenticated;

-- ── Mi estado de solicitud (para la pantalla de espera) ─────
CREATE OR REPLACE FUNCTION public.my_join_status()
RETURNS TABLE (status TEXT, company_name TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT jr.status, c.name
  FROM public.join_requests jr
  JOIN public.companies c ON c.id = jr.company_id
  WHERE jr.user_id = auth.uid()
  ORDER BY jr.created_at DESC LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.my_join_status() TO authenticated;

-- ── Listar pendientes (el admin de la empresa) ──────────────
CREATE OR REPLACE FUNCTION public.get_pending_join_requests()
RETURNS TABLE (id UUID, user_id UUID, full_name TEXT, email TEXT, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT jr.id, jr.user_id, jr.full_name, jr.email, jr.created_at
  FROM public.join_requests jr
  WHERE jr.status = 'pending'
    AND jr.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid() AND role = 'company_admin')
  ORDER BY jr.created_at ASC;
$$;
GRANT EXECUTE ON FUNCTION public.get_pending_join_requests() TO authenticated;

-- ── Aprobar (admin) → vincula al operario a la empresa ──────
CREATE OR REPLACE FUNCTION public.approve_join_request(p_req UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_company UUID; v_user UUID;
BEGIN
  SELECT company_id, user_id INTO v_company, v_user FROM public.join_requests WHERE id = p_req;
  IF v_company IS NULL THEN RAISE EXCEPTION 'Solicitud inexistente'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'company_admin' AND company_id = v_company
  ) THEN RAISE EXCEPTION 'No autorizado'; END IF;

  UPDATE public.profiles SET company_id = v_company, role = 'employee' WHERE id = v_user;
  UPDATE public.join_requests SET status = 'approved', decided_at = NOW() WHERE id = p_req;
END;
$$;
GRANT EXECUTE ON FUNCTION public.approve_join_request(UUID) TO authenticated;

-- ── Rechazar (admin) ────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.reject_join_request(p_req UUID)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_company UUID;
BEGIN
  SELECT company_id INTO v_company FROM public.join_requests WHERE id = p_req;
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'company_admin' AND company_id = v_company
  ) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  UPDATE public.join_requests SET status = 'rejected', decided_at = NOW() WHERE id = p_req;
END;
$$;
GRANT EXECUTE ON FUNCTION public.reject_join_request(UUID) TO authenticated;
