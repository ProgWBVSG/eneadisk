-- ============================================================
-- ENEATEAMS — WEBHOOK Slack/Discord (notificaciones al canal)
-- ============================================================
-- El admin pega la "Incoming Webhook URL" de su Slack/Discord.
-- La URL se guarda en la empresa y NO se expone al frontend; el envío
-- lo hace la función /api/notify (server-side) tras verificar al admin.
-- ============================================================

ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS notify_webhook_url TEXT;

-- Guardar/actualizar el webhook (solo admin de la empresa)
CREATE OR REPLACE FUNCTION public.set_company_webhook(p_url TEXT)
RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_company UUID;
BEGIN
  SELECT company_id INTO v_company FROM public.profiles
    WHERE id = auth.uid() AND role = 'company_admin';
  IF v_company IS NULL THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF p_url IS NOT NULL AND p_url <> '' AND p_url NOT LIKE 'https://%' THEN
    RAISE EXCEPTION 'La URL debe empezar con https://';
  END IF;
  UPDATE public.companies SET notify_webhook_url = NULLIF(p_url, '') WHERE id = v_company;
END;
$$;
GRANT EXECUTE ON FUNCTION public.set_company_webhook(TEXT) TO authenticated;

-- ¿Está configurado? (sin exponer la URL)
CREATE OR REPLACE FUNCTION public.company_webhook_configured()
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT notify_webhook_url IS NOT NULL
  FROM public.companies
  WHERE id = (SELECT company_id FROM public.profiles WHERE id = auth.uid());
$$;
GRANT EXECUTE ON FUNCTION public.company_webhook_configured() TO authenticated;
