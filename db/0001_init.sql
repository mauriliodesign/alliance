-- =============================================================================
-- Alliance JJ — Multi-tenant SaaS schema (PostgreSQL / Supabase)
-- =============================================================================
-- Turns the single-academy CRM (currently localStorage) into a multi-tenant
-- SaaS where each academy (organization) has isolated data.
--
-- Tenancy model: shared database + shared schema + `org_id` on every table,
-- enforced by Row-Level Security (RLS). A user can belong to several academies
-- via `memberships`.
--
-- Target: Supabase (uses auth.users + auth.uid()). For plain Postgres, replace
-- the auth.* references and the JWT-based RLS with your own session mechanism.
-- Apply with: supabase migration up   (or paste into the Supabase SQL editor)
-- =============================================================================

create extension if not exists "pgcrypto";   -- gen_random_uuid()

-- -----------------------------------------------------------------------------
-- 1. Enums
-- -----------------------------------------------------------------------------
create type plan_t       as enum ('free', 'pro', 'enterprise');
create type role_t       as enum ('owner', 'admin', 'staff');
create type lead_stage_t as enum ('new', 'contacted', 'scheduled', 'attended', 'won', 'lost');
create type lead_source_t as enum ('form', 'manual', 'import');
create type activity_t   as enum ('created', 'stage', 'task', 'note');

-- -----------------------------------------------------------------------------
-- 2. Core tenancy tables
-- -----------------------------------------------------------------------------

-- An academy (tenant).
create table organizations (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,                 -- public form routing, e.g. /?org=alliance-lisboa
  name          text not null,
  plan          plan_t not null default 'free',
  -- business info (was settings.business)
  address       text,
  phone         text,
  whatsapp      text,                                 -- digits only, for wa.me
  email         text,
  instagram     text,
  -- pipeline config (was settings.pipeline)
  followup_days int  not null default 3,
  tags          text[] not null default '{adultos,kids,no-gi,competidor,reabertura}',
  stage_labels  jsonb  not null default '{}'::jsonb,  -- optional per-stage label overrides
  -- integrations (was settings.integrations); the Gemini API key stays a
  -- platform-level server secret, NOT stored per-row.
  gtm_id        text,
  ai_enabled    boolean not null default true,
  gemini_model  text    not null default 'gemini-2.5-flash',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Mirror of auth.users with app profile data (Supabase pattern).
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  email      text,
  created_at timestamptz not null default now()
);

-- Which users belong to which academies, and their role.
create table memberships (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  user_id    uuid not null references profiles(id)      on delete cascade,
  role       role_t not null default 'staff',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

-- -----------------------------------------------------------------------------
-- 3. CRM data (all tenant-scoped via org_id)
-- -----------------------------------------------------------------------------

create table leads (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  name        text not null,
  email       text,
  phone       text,
  instagram   text,
  source      lead_source_t not null default 'form',
  stage       lead_stage_t  not null default 'new',
  tags        text[] not null default '{}',
  assigned_to uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Follow-up notes (free text the staff writes about a lead).
create table followups (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  lead_id    uuid not null references leads(id)          on delete cascade,
  author_id  uuid references profiles(id) on delete set null,
  body       text not null,
  created_at timestamptz not null default now()
);

-- Scheduled follow-up tasks / appointments (feeds the calendar).
-- The app's "next follow-up" is simply the earliest open task for a lead.
create table tasks (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  lead_id     uuid not null references leads(id)          on delete cascade,
  title       text not null,
  due_date    date,
  done        boolean not null default false,
  done_at     timestamptz,
  assigned_to uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- Immutable activity timeline (created / stage change / task set / note).
create table lead_activity (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organizations(id) on delete cascade,
  lead_id    uuid not null references leads(id)          on delete cascade,
  type       activity_t not null,
  from_stage lead_stage_t,
  to_stage   lead_stage_t,
  detail     text,
  actor_id   uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Cached AI insight per lead (latest). Pipeline-level insights stay ephemeral.
create table lead_insights (
  id                uuid primary key default gen_random_uuid(),
  org_id            uuid not null references organizations(id) on delete cascade,
  lead_id           uuid not null references leads(id)         on delete cascade,
  close_probability int,
  payload           jsonb not null,           -- { signals, nextAction, suggestedMessage, risks }
  model             text,
  lang              text,
  generated_by      uuid references profiles(id) on delete set null,
  generated_at      timestamptz not null default now(),
  unique (lead_id)
);

-- -----------------------------------------------------------------------------
-- 4. Indexes (tenant-first, for common queries)
-- -----------------------------------------------------------------------------
create index idx_memberships_user      on memberships(user_id);
create index idx_leads_org_stage       on leads(org_id, stage);
create index idx_leads_org_created      on leads(org_id, created_at desc);
create index idx_followups_lead        on followups(lead_id, created_at desc);
create index idx_tasks_org_due         on tasks(org_id, due_date) where done = false;
create index idx_tasks_lead            on tasks(lead_id);
create index idx_activity_lead         on lead_activity(lead_id, created_at desc);

-- -----------------------------------------------------------------------------
-- 5. updated_at trigger
-- -----------------------------------------------------------------------------
create or replace function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

create trigger trg_org_updated  before update on organizations
  for each row execute function set_updated_at();
create trigger trg_leads_updated before update on leads
  for each row execute function set_updated_at();

-- Auto-create a profile when a new auth user signs up (Supabase).
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do nothing;
  return new;
end; $$;

create trigger trg_on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- -----------------------------------------------------------------------------
-- 6. Membership helpers (SECURITY DEFINER => bypass RLS, avoid recursion)
-- -----------------------------------------------------------------------------
create or replace function is_org_member(p_org uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from memberships
    where org_id = p_org and user_id = auth.uid()
  );
$$;

create or replace function has_org_role(p_org uuid, p_roles role_t[]) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from memberships
    where org_id = p_org and user_id = auth.uid() and role = any(p_roles)
  );
$$;

-- -----------------------------------------------------------------------------
-- 7. Row-Level Security
-- -----------------------------------------------------------------------------
alter table organizations  enable row level security;
alter table profiles       enable row level security;
alter table memberships    enable row level security;
alter table leads          enable row level security;
alter table followups      enable row level security;
alter table tasks          enable row level security;
alter table lead_activity  enable row level security;
alter table lead_insights  enable row level security;

-- profiles: a user sees/edits only their own profile.
create policy profiles_self on profiles
  for all using (id = auth.uid()) with check (id = auth.uid());

-- memberships: a user sees their own memberships; owners/admins manage them.
create policy memberships_select on memberships
  for select using (user_id = auth.uid() or has_org_role(org_id, array['owner','admin']::role_t[]));
create policy memberships_write on memberships
  for all using (has_org_role(org_id, array['owner','admin']::role_t[]))
  with check (has_org_role(org_id, array['owner','admin']::role_t[]));

-- organizations: members read; owners/admins update.
create policy org_select on organizations
  for select using (is_org_member(id));
create policy org_update on organizations
  for update using (has_org_role(id, array['owner','admin']::role_t[]))
  with check (has_org_role(id, array['owner','admin']::role_t[]));

-- Generic tenant tables: any member of the org can read/write its rows.
-- (Tighten per-role later if needed, e.g. only owner can delete leads.)
create policy leads_member on leads
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy followups_member on followups
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy tasks_member on tasks
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy activity_member on lead_activity
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));
create policy insights_member on lead_insights
  for all using (is_org_member(org_id)) with check (is_org_member(org_id));

-- -----------------------------------------------------------------------------
-- 8. Public lead capture (website form) — anonymous, no auth, by org slug.
--    SECURITY DEFINER bypasses RLS; only this controlled path can insert.
-- -----------------------------------------------------------------------------
create or replace function submit_lead(
  p_slug      text,
  p_name      text,
  p_email     text default null,
  p_phone     text default null,
  p_instagram text default null,
  p_tags      text[] default '{}'
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_org_id uuid;
  v_lead_id uuid;
begin
  select id into v_org_id from organizations where slug = p_slug;
  if v_org_id is null then
    raise exception 'unknown organization %', p_slug using errcode = 'no_data_found';
  end if;

  insert into leads (org_id, name, email, phone, instagram, tags, source, stage)
  values (v_org_id, coalesce(nullif(trim(p_name), ''), 'Lead'), p_email, p_phone, p_instagram,
          coalesce(p_tags, '{}'), 'form', 'new')
  returning id into v_lead_id;

  insert into lead_activity (org_id, lead_id, type) values (v_org_id, v_lead_id, 'created');
  return v_lead_id;
end; $$;

-- Allow the public site (anon) and logged-in users to submit leads.
grant execute on function submit_lead(text, text, text, text, text, text[]) to anon, authenticated;

-- Public, read-only academy info for the marketing site (no auth, by slug).
-- Returns only safe public fields — never internal config or the lead data.
create or replace function get_org_public(p_slug text)
returns table (
  name text, address text, phone text, whatsapp text, email text, instagram text
)
language sql security definer stable set search_path = public as $$
  select name, address, phone, whatsapp, email, instagram
  from organizations
  where slug = p_slug;
$$;

grant execute on function get_org_public(text) to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 9. Onboarding helper: create an academy and make the caller its owner.
-- -----------------------------------------------------------------------------
create or replace function create_organization(p_name text, p_slug text)
returns uuid
language plpgsql security definer set search_path = public as $$
declare v_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'must be authenticated';
  end if;
  insert into organizations (name, slug) values (p_name, p_slug) returning id into v_org_id;
  insert into memberships (org_id, user_id, role) values (v_org_id, auth.uid(), 'owner');
  return v_org_id;
end; $$;

grant execute on function create_organization(text, text) to authenticated;

-- -----------------------------------------------------------------------------
-- 10. (Optional) Demo seed — uncomment to create one academy with sample data.
-- -----------------------------------------------------------------------------
-- insert into organizations (slug, name, address, phone, whatsapp, email, instagram)
-- values ('alliance-lisboa', 'Alliance Jiu Jitsu Lisboa',
--         'Rua Almirante Gago Coutinho 19B, Moscavide', '+351 924 851 474',
--         '351924851474', 'geral@alliancejjlisboa.com', 'alliancejjpdn_lisboa');
