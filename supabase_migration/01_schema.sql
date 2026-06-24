-- ============================================================
-- ENEATEAMS — MIGRACIÓN COMPLETA DE BASE DE DATOS
-- Ejecutar en el SQL Editor del NUEVO proyecto Supabase
-- Orden: primero este archivo, luego 02_rls.sql, luego 03_triggers.sql
-- ============================================================

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: companies
-- ============================================================
CREATE TABLE IF NOT EXISTS public.companies (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  industry    TEXT,
  size        TEXT,
  country     TEXT,
  invite_code TEXT NOT NULL UNIQUE,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role                   TEXT NOT NULL CHECK (role IN ('company_admin', 'employee')),
  company_id             UUID REFERENCES public.companies(id) ON DELETE SET NULL,
  full_name              TEXT,
  email                  TEXT,
  phone                  TEXT,
  enneagram_type         INTEGER CHECK (enneagram_type BETWEEN 1 AND 9),
  questionnaire_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: teams
-- ============================================================
CREATE TABLE IF NOT EXISTS public.teams (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  owner_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: team_members
-- ============================================================
CREATE TABLE IF NOT EXISTS public.team_members (
  team_id    UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- ============================================================
-- TABLA: tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id      UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  description  TEXT,
  status       TEXT NOT NULL DEFAULT 'pending'
               CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority     TEXT NOT NULL DEFAULT 'medium'
               CHECK (priority IN ('low', 'medium', 'high')),
  category     TEXT NOT NULL DEFAULT 'personal'
               CHECK (category IN ('personal', 'team', 'development')),
  assigned_by  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  due_date     TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABLA: checkins
-- ============================================================
CREATE TABLE IF NOT EXISTS public.checkins (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mood       TEXT NOT NULL
             CHECK (mood IN ('excellent', 'good', 'neutral', 'bad', 'terrible')),
  energy     INTEGER NOT NULL CHECK (energy BETWEEN 1 AND 5),
  stress     INTEGER NOT NULL CHECK (stress BETWEEN 1 AND 5),
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- ÍNDICES (performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_profiles_company_id    ON public.profiles(company_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role          ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_teams_company_id       ON public.teams(company_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id   ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id          ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_team_id          ON public.tasks(team_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status           ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_checkins_user_id       ON public.checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_date          ON public.checkins(date);
CREATE INDEX IF NOT EXISTS idx_companies_invite_code  ON public.companies(invite_code);
