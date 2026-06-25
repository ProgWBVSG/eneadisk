-- ============================================================
-- ENEATEAMS — CHAT EN VIVO (mensajería + tareas + correcciones)
-- ============================================================
-- Mensajería directa (1 a 1) entre miembros de una misma empresa,
-- con dos tipos especiales de mensaje:
--   • 'task'         → adjunta una tarea real (tabla tasks)
--   • 'task_review'  → corrección/feedback de una tarea
--
-- Seguridad: RLS estricta. Un usuario solo ve conversaciones de las
-- que participa, y solo puede chatear con gente de SU empresa. Toda
-- la creación de conversaciones / tareas / correcciones pasa por
-- funciones SECURITY DEFINER que validan empresa y autorización.
-- ============================================================

-- ── 1. Tablas ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  type        TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group')),
  dm_key      TEXT UNIQUE,          -- clave determinística "idA:idB" para evitar DMs duplicados
  title       TEXT,
  created_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_conv_company ON public.conversations(company_id);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at    TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_cp_user ON public.conversation_participants(user_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body            TEXT,
  kind            TEXT NOT NULL DEFAULT 'text' CHECK (kind IN ('text', 'task', 'task_review')),
  task_id         UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  meta            JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_msg_conv ON public.messages(conversation_id, created_at);

-- ── 2. Helpers SECURITY DEFINER (evitan recursión en RLS) ───
-- ¿auth.uid() participa de esta conversación?
CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conv UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = p_conv AND cp.user_id = auth.uid()
  );
$$;

-- ¿el otro usuario es de mi misma empresa (y tengo empresa)?
CREATE OR REPLACE FUNCTION public.chat_same_company(p_other UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT (SELECT company_id FROM public.profiles WHERE id = auth.uid()) IS NOT NULL
     AND (SELECT company_id FROM public.profiles WHERE id = auth.uid())
       = (SELECT company_id FROM public.profiles WHERE id = p_other);
$$;

-- ── 3. RLS ──────────────────────────────────────────────────
ALTER TABLE public.conversations              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages                   ENABLE ROW LEVEL SECURITY;

-- Conversaciones: solo las que participo
DROP POLICY IF EXISTS conv_select ON public.conversations;
CREATE POLICY conv_select ON public.conversations FOR SELECT
  USING (public.is_conversation_participant(id));

-- Participantes: solo de mis conversaciones
DROP POLICY IF EXISTS cp_select ON public.conversation_participants;
CREATE POLICY cp_select ON public.conversation_participants FOR SELECT
  USING (public.is_conversation_participant(conversation_id));

-- Permitir al usuario marcar su propia fila como leída
DROP POLICY IF EXISTS cp_update_self ON public.conversation_participants;
CREATE POLICY cp_update_self ON public.conversation_participants FOR UPDATE
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Mensajes: ver los de mis conversaciones
DROP POLICY IF EXISTS msg_select ON public.messages;
CREATE POLICY msg_select ON public.messages FOR SELECT
  USING (public.is_conversation_participant(conversation_id));

-- Mensajes: insertar SOLO texto, como uno mismo, en mis conversaciones.
-- (Las tareas y correcciones se insertan vía RPC SECURITY DEFINER.)
DROP POLICY IF EXISTS msg_insert ON public.messages;
CREATE POLICY msg_insert ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND kind = 'text'
    AND public.is_conversation_participant(conversation_id)
  );

-- ── 4. Trigger: subir updated_at de la conversación con cada mensaje ──
CREATE OR REPLACE FUNCTION public.bump_conversation()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.conversations SET updated_at = NOW() WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_bump_conversation ON public.messages;
CREATE TRIGGER trg_bump_conversation AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.bump_conversation();

-- ── 5. RPC: directorio de la empresa (con quién puedo chatear) ──
CREATE OR REPLACE FUNCTION public.get_company_directory()
RETURNS TABLE (id UUID, full_name TEXT, role TEXT, enneagram_type INTEGER)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.role, p.enneagram_type
  FROM public.profiles p
  WHERE p.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND p.id <> auth.uid()
  ORDER BY p.full_name;
$$;
GRANT EXECUTE ON FUNCTION public.get_company_directory() TO authenticated;

-- ── 6. RPC: abrir (o crear) un DM con otra persona ──────────
CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(p_other UUID)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_me      UUID := auth.uid();
  v_company UUID;
  v_key     TEXT;
  v_conv    UUID;
BEGIN
  IF p_other = v_me THEN RAISE EXCEPTION 'No podés chatear con vos mismo'; END IF;
  IF NOT public.chat_same_company(p_other) THEN RAISE EXCEPTION 'No autorizado'; END IF;

  SELECT company_id INTO v_company FROM public.profiles WHERE id = v_me;
  v_key := LEAST(v_me::text, p_other::text) || ':' || GREATEST(v_me::text, p_other::text);

  SELECT id INTO v_conv FROM public.conversations WHERE dm_key = v_key;
  IF v_conv IS NULL THEN
    INSERT INTO public.conversations (company_id, type, dm_key, created_by)
      VALUES (v_company, 'direct', v_key, v_me)
      RETURNING id INTO v_conv;
    INSERT INTO public.conversation_participants (conversation_id, user_id)
      VALUES (v_conv, v_me), (v_conv, p_other);
  END IF;
  RETURN v_conv;
END;
$$;
GRANT EXECUTE ON FUNCTION public.get_or_create_direct_conversation(UUID) TO authenticated;

-- ── 7. RPC: mis conversaciones (con preview + no leídos) ────
CREATE OR REPLACE FUNCTION public.get_my_conversations()
RETURNS TABLE (
  conversation_id UUID, other_id UUID, other_name TEXT, other_role TEXT,
  other_enneagram INTEGER, last_body TEXT, last_kind TEXT, last_at TIMESTAMPTZ, unread BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT
    c.id, o.id, o.full_name, o.role, o.enneagram_type,
    lm.body, lm.kind, c.updated_at,
    (SELECT COUNT(*) FROM public.messages m
       WHERE m.conversation_id = c.id
         AND m.sender_id <> auth.uid()
         AND m.created_at > COALESCE(myp.last_read_at, 'epoch'::timestamptz))
  FROM public.conversations c
  JOIN public.conversation_participants myp
    ON myp.conversation_id = c.id AND myp.user_id = auth.uid()
  JOIN public.conversation_participants op
    ON op.conversation_id = c.id AND op.user_id <> auth.uid()
  JOIN public.profiles o ON o.id = op.user_id
  LEFT JOIN LATERAL (
    SELECT body, kind FROM public.messages m
    WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1
  ) lm ON TRUE
  ORDER BY c.updated_at DESC;
$$;
GRANT EXECUTE ON FUNCTION public.get_my_conversations() TO authenticated;

-- ── 8. RPC: marcar conversación como leída ─────────────────
CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conv UUID)
RETURNS VOID
LANGUAGE sql SECURITY DEFINER SET search_path = public
AS $$
  UPDATE public.conversation_participants SET last_read_at = NOW()
  WHERE conversation_id = p_conv AND user_id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(UUID) TO authenticated;

-- ── 9. RPC: enviar una TAREA dentro del chat ───────────────
CREATE OR REPLACE FUNCTION public.send_chat_task(
  p_conv UUID, p_recipient UUID, p_title TEXT, p_desc TEXT,
  p_priority TEXT DEFAULT 'medium', p_due DATE DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_task UUID; v_msg UUID;
BEGIN
  IF NOT public.is_conversation_participant(p_conv) THEN RAISE EXCEPTION 'No autorizado'; END IF;
  IF NOT public.chat_same_company(p_recipient) THEN RAISE EXCEPTION 'Destinatario inválido'; END IF;
  IF COALESCE(TRIM(p_title), '') = '' THEN RAISE EXCEPTION 'La tarea necesita un título'; END IF;

  INSERT INTO public.tasks (user_id, title, description, status, priority, category, assigned_by, due_date)
    VALUES (p_recipient, p_title, NULLIF(TRIM(p_desc), ''), 'pending',
            COALESCE(p_priority, 'medium'), 'team', auth.uid(), p_due)
    RETURNING id INTO v_task;

  INSERT INTO public.messages (conversation_id, sender_id, body, kind, task_id, meta)
    VALUES (p_conv, auth.uid(), p_title, 'task', v_task,
            jsonb_build_object('title', p_title, 'description', NULLIF(TRIM(p_desc), ''),
                               'priority', COALESCE(p_priority, 'medium'), 'due', p_due))
    RETURNING id INTO v_msg;
  RETURN v_msg;
END;
$$;
GRANT EXECUTE ON FUNCTION public.send_chat_task(UUID, UUID, TEXT, TEXT, TEXT, DATE) TO authenticated;

-- ── 10. RPC: corregir / revisar una tarea desde el chat ────
CREATE OR REPLACE FUNCTION public.review_chat_task(
  p_conv UUID, p_task UUID, p_status TEXT, p_note TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE v_msg UUID; v_title TEXT; v_assigner UUID; v_owner UUID;
BEGIN
  IF p_status NOT IN ('confirmed', 'needs_fix') THEN RAISE EXCEPTION 'Estado inválido'; END IF;
  IF NOT public.is_conversation_participant(p_conv) THEN RAISE EXCEPTION 'No autorizado'; END IF;

  SELECT title, assigned_by, user_id INTO v_title, v_assigner, v_owner
  FROM public.tasks WHERE id = p_task;
  IF v_title IS NULL THEN RAISE EXCEPTION 'Tarea inexistente'; END IF;

  -- Puede corregir: quien asignó la tarea, un supervisor de esa persona, o un admin de su empresa.
  IF v_assigner IS DISTINCT FROM auth.uid()
     AND NOT public.is_supervisor_of(v_owner)
     AND NOT EXISTS (
       SELECT 1 FROM public.profiles admin_p
       WHERE admin_p.id = auth.uid() AND admin_p.role = 'company_admin'
         AND admin_p.company_id = (SELECT company_id FROM public.profiles WHERE id = v_owner)
     )
  THEN RAISE EXCEPTION 'No autorizado para corregir esta tarea'; END IF;

  UPDATE public.tasks
    SET review_status = p_status, review_note = NULLIF(TRIM(p_note), ''),
        reviewed_by = auth.uid(), reviewed_at = NOW()
    WHERE id = p_task;

  INSERT INTO public.messages (conversation_id, sender_id, body, kind, task_id, meta)
    VALUES (p_conv, auth.uid(), NULLIF(TRIM(p_note), ''), 'task_review', p_task,
            jsonb_build_object('title', v_title, 'status', p_status))
    RETURNING id INTO v_msg;
  RETURN v_msg;
END;
$$;
GRANT EXECUTE ON FUNCTION public.review_chat_task(UUID, UUID, TEXT, TEXT) TO authenticated;

-- ── 11. Realtime: publicar la tabla messages (idempotente) ──
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;
