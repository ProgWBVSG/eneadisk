-- ============================================================
-- ENEATEAMS — FEED .ICS (suscripción a Google/Outlook/Apple Calendar)
-- ============================================================
-- Cada usuario tiene un token secreto; con él, la función serverless
-- /api/calendar arma un calendario .ics con sus tareas y eventos.
-- ============================================================

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS ics_token UUID;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_profiles_ics_token ON public.profiles(ics_token);

-- Devuelve (creando si hace falta) el token .ics del usuario actual
CREATE OR REPLACE FUNCTION public.get_or_create_ics_token()
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v UUID;
BEGIN
  SELECT ics_token INTO v FROM public.profiles WHERE id = auth.uid();
  IF v IS NULL THEN
    v := gen_random_uuid();
    UPDATE public.profiles SET ics_token = v WHERE id = auth.uid();
  END IF;
  RETURN v;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_or_create_ics_token() TO authenticated;
