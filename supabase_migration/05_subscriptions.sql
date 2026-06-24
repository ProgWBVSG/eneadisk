-- ============================================================
-- ENEATEAMS — TABLA DE SUSCRIPCIONES
-- Ejecutar en el SQL Editor del proyecto Supabase
-- ============================================================

CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id            UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE UNIQUE,
  plan                  TEXT NOT NULL DEFAULT 'free'
                        CHECK (plan IN ('free', 'starter', 'growth', 'enterprise')),
  status                TEXT NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'trialing', 'canceled', 'past_due', 'unpaid')),
  stripe_customer_id    TEXT,
  stripe_subscription_id TEXT,
  current_period_end    TIMESTAMPTZ,
  employee_limit        INTEGER NOT NULL DEFAULT 3,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger updated_at
CREATE OR REPLACE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Solo el admin de la empresa puede ver/modificar su suscripción
DROP POLICY IF EXISTS "subscriptions_company_admin" ON public.subscriptions;
CREATE POLICY "subscriptions_company_admin"
  ON public.subscriptions
  USING (company_id = public.get_user_company_id())
  WITH CHECK (company_id = public.get_user_company_id());

-- Index
CREATE INDEX IF NOT EXISTS idx_subscriptions_company_id ON public.subscriptions(company_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);

-- Insertar plan FREE para todas las empresas existentes que no tengan suscripción
INSERT INTO public.subscriptions (company_id, plan, status, employee_limit)
SELECT id, 'free', 'active', 3
FROM public.companies
WHERE id NOT IN (SELECT company_id FROM public.subscriptions)
ON CONFLICT DO NOTHING;
