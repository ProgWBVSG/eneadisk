-- ============================================================
-- ENEATEAMS — CHAT POR EQUIPO / PROYECTO (canales grupales)
-- ============================================================
-- Reutiliza conversations/messages. Un canal grupal se vincula a un
-- equipo (team_id) y sus participantes son los miembros + el líder.
-- ============================================================

ALTER TABLE public.conversations ADD COLUMN IF NOT EXISTS team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE;
CREATE UNIQUE INDEX IF NOT EXISTS uniq_team_conversation ON public.conversations(team_id) WHERE type = 'group';

-- Equipos a los que pertenezco o que lidero (para el selector del chat)
CREATE OR REPLACE FUNCTION public.get_my_chat_teams()
RETURNS TABLE (team_id UUID, name TEXT, member_count BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT t.id, t.name, (SELECT COUNT(*) FROM public.team_members tm2 WHERE tm2.team_id = t.id)
  FROM public.teams t
  WHERE t.lead_id = auth.uid()
     OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = t.id AND tm.user_id = auth.uid())
  ORDER BY t.name;
$$;
GRANT EXECUTE ON FUNCTION public.get_my_chat_teams() TO authenticated;

-- Abrir (o crear) el canal de un equipo y sincronizar participantes
CREATE OR REPLACE FUNCTION public.get_or_create_team_conversation(p_team UUID)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_conv UUID; v_company UUID; v_member BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.teams t WHERE t.id = p_team AND (
      t.lead_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.team_members tm WHERE tm.team_id = p_team AND tm.user_id = auth.uid())
    )
  ) INTO v_member;
  IF NOT v_member THEN RAISE EXCEPTION 'No autorizado'; END IF;

  SELECT company_id INTO v_company FROM public.teams WHERE id = p_team;
  SELECT id INTO v_conv FROM public.conversations WHERE team_id = p_team AND type = 'group';
  IF v_conv IS NULL THEN
    INSERT INTO public.conversations (company_id, type, team_id, title, created_by)
      SELECT v_company, 'group', p_team, t.name, auth.uid() FROM public.teams t WHERE t.id = p_team
      RETURNING id INTO v_conv;
  END IF;

  -- sincronizar participantes (miembros + líder)
  INSERT INTO public.conversation_participants (conversation_id, user_id)
    SELECT v_conv, tm.user_id FROM public.team_members tm WHERE tm.team_id = p_team
    ON CONFLICT DO NOTHING;
  INSERT INTO public.conversation_participants (conversation_id, user_id)
    SELECT v_conv, t.lead_id FROM public.teams t WHERE t.id = p_team AND t.lead_id IS NOT NULL
    ON CONFLICT DO NOTHING;
  RETURN v_conv;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_or_create_team_conversation(UUID) TO authenticated;

-- Lista de conversaciones AHORA group-aware (directas + canales de equipo)
CREATE OR REPLACE FUNCTION public.get_my_conversations()
RETURNS TABLE (
  conversation_id UUID, other_id UUID, other_name TEXT, other_role TEXT,
  other_enneagram INTEGER, last_body TEXT, last_kind TEXT, last_at TIMESTAMPTZ,
  unread BIGINT, is_group BOOLEAN
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    c.id,
    CASE WHEN c.type = 'group' THEN NULL ELSE o.id END,
    CASE WHEN c.type = 'group' THEN c.title ELSE o.full_name END,
    CASE WHEN c.type = 'group' THEN 'group' ELSE o.role END,
    CASE WHEN c.type = 'group' THEN NULL ELSE o.enneagram_type END,
    lm.body, lm.kind, c.updated_at,
    (SELECT COUNT(*) FROM public.messages m
       WHERE m.conversation_id = c.id AND m.sender_id <> auth.uid()
         AND m.created_at > COALESCE(myp.last_read_at, 'epoch'::timestamptz)),
    (c.type = 'group')
  FROM public.conversations c
  JOIN public.conversation_participants myp
    ON myp.conversation_id = c.id AND myp.user_id = auth.uid()
  LEFT JOIN LATERAL (
    SELECT p.id, p.full_name, p.role, p.enneagram_type
    FROM public.conversation_participants op
    JOIN public.profiles p ON p.id = op.user_id
    WHERE op.conversation_id = c.id AND op.user_id <> auth.uid()
    LIMIT 1
  ) o ON c.type <> 'group'
  LEFT JOIN LATERAL (
    SELECT body, kind FROM public.messages m
    WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1
  ) lm ON TRUE
  ORDER BY c.updated_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.get_my_conversations() TO authenticated;
