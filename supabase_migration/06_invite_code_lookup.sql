-- ============================================================
-- ENEATEAMS — VALIDACIÓN PÚBLICA DE CÓDIGO DE INVITACIÓN
-- ============================================================
-- Problema: las políticas RLS de 'companies' solo permiten leer
-- la empresa al dueño o a miembros existentes. Un usuario anónimo
-- (o uno que aún no pertenece) NO puede validar un código de
-- invitación, rompiendo el registro de empleados y el link /join.
--
-- Solución: función SECURITY DEFINER que devuelve SOLO id+name
-- si el código existe. Es segura porque:
--   • No expone datos sensibles (solo id y nombre)
--   • Requiere conocer el código exacto (no se puede enumerar)
--   • Bypasea RLS de forma controlada y acotada
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_company_by_invite_code(p_code TEXT)
RETURNS TABLE (id UUID, name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT c.id, c.name
  FROM public.companies c
  WHERE c.invite_code = upper(trim(p_code));
$$;

-- Permitir que usuarios anónimos Y autenticados ejecuten la función
GRANT EXECUTE ON FUNCTION public.get_company_by_invite_code(TEXT) TO anon, authenticated;
