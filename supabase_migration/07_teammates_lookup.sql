-- ============================================================
-- ENEATEAMS — VER COMPAÑEROS DE EQUIPO (para empleados)
-- ============================================================
-- Las policies RLS solo dejan a un empleado ver su PROPIO perfil.
-- Para la página "Mi Equipo" necesita ver a sus compañeros, pero
-- sin exponer toda la tabla profiles.
--
-- Esta función SECURITY DEFINER devuelve solo id + nombre + eneatipo
-- de los compañeros de la MISMA empresa. Segura y acotada.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_my_teammates()
RETURNS TABLE (id UUID, full_name TEXT, enneagram_type INTEGER, questionnaire_completed BOOLEAN)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.enneagram_type, p.questionnaire_completed
  FROM public.profiles p
  WHERE p.company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
    AND p.id <> auth.uid()
    AND p.role = 'employee';
$$;

GRANT EXECUTE ON FUNCTION public.get_my_teammates() TO authenticated;
