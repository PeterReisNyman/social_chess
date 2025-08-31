-- Social Chess Supabase schema

-- Destructive reset: drop existing objects for clean re-runs
drop table if exists public.project_stakeholders cascade;
drop table if exists public.tasks cascade;
drop table if exists public.relationships cascade;
drop table if exists public.capital_scores cascade;
drop table if exists public.investments cascade;
drop table if exists public.projects cascade;
drop table if exists public.contacts cascade;
drop table if exists public.companies cascade;
drop table if exists public.interactions cascade;
drop table if exists public.game_states cascade;

-- Drop enums so they can be recreated safely
drop type if exists public.company_type_enum cascade;
drop type if exists public.company_status_enum cascade;
drop type if exists public.contact_type_enum cascade;
drop type if exists public.relationship_strength_enum cascade;
drop type if exists public.project_status_enum cascade;
drop type if exists public.task_priority_enum cascade;
drop type if exists public.task_status_enum cascade;
drop type if exists public.task_type_enum cascade;
drop type if exists public.investment_stage_enum cascade;
drop type if exists public.investment_status_enum cascade;

-- Extensions
create extension if not exists "pgcrypto";

-- Enums
create type public.company_type_enum as enum (
  'Technology', 'Investor', 'Startup', 'Government', 'NGO', 'Foundation', 'Other'
);

create type public.company_status_enum as enum (
  'Prospect', 'Active', 'Inactive', 'On Hold'
);

create type public.contact_type_enum as enum (
  'Contact', 'Decision Maker', 'Influencer', 'Technical', 'Client', 'Other'
);

create type public.relationship_strength_enum as enum (
  'Weak', 'Medium', 'Strong'
);

create type public.project_status_enum as enum (
  'Planning', 'Active', 'On Hold', 'Completed'
);

create type public.task_priority_enum as enum (
  'Low', 'Medium', 'High'
);

create type public.task_status_enum as enum (
  'Not Started', 'In Progress', 'Completed'
);

create type public.task_type_enum as enum (
  'Task', 'Call', 'Meeting', 'Document', 'Form', 'Workshop'
);

create type public.investment_stage_enum as enum (
  'Pre-Seed', 'Seed', 'Series A', 'Series B', 'Series C'
);

create type public.investment_status_enum as enum (
  'Open', 'Negotiating', 'Closed'
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  type public.company_type_enum,
  -- Deprecated: prefer primary_contact_id
  primary_contact text,
  primary_contact_id uuid,
  status public.company_status_enum,
  projects text,
  total_pipeline numeric,
  total_revenue numeric,
  notes text
);

-- Ensure name is unique for lookup convenience
create unique index if not exists companies_name_key on public.companies (name);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  -- Deprecated: prefer organization_id
  organization text,
  organization_id uuid,
  role text,
  email text,
  phone text,
  type public.contact_type_enum,
  projects text,
  last_contact date,
  next_action text,
  relationship_strength public.relationship_strength_enum,
  notes text,
  tags text
);
create index if not exists contacts_organization_id_idx on public.contacts (organization_id);
create unique index if not exists contacts_name_key on public.contacts (name);

-- Now that both tables exist, add the cross references
alter table public.companies
  drop constraint if exists companies_primary_contact_id_fkey;
alter table public.companies
  add constraint companies_primary_contact_id_fkey
  foreign key (primary_contact_id) references public.contacts(id) on delete set null;

alter table public.contacts
  drop constraint if exists contacts_organization_id_fkey;
alter table public.contacts
  add constraint contacts_organization_id_fkey
  foreign key (organization_id) references public.companies(id) on delete set null;

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  -- Deprecated: prefer company_id
  company text,
  company_id uuid references public.companies(id) on delete set null,
  status public.project_status_enum,
  start_date date,
  revenue_model text,
  fee_structure text,
  pipeline_value numeric,
  actual_revenue numeric,
  stakeholders text,
  next_milestone text,
  notes text
);
create index if not exists projects_company_id_idx on public.projects (company_id);
create unique index if not exists projects_name_key on public.projects (name);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  task_name text not null,
  -- Deprecated: prefer *_id columns below
  company text,
  project text,
  stakeholder text,
  company_id uuid references public.companies(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  stakeholder_id uuid references public.contacts(id) on delete set null,
  due_date date,
  priority public.task_priority_enum,
  status public.task_status_enum,
  type public.task_type_enum,
  notes text
);
create index if not exists tasks_project_id_idx on public.tasks (project_id);
create index if not exists tasks_company_id_idx on public.tasks (company_id);
create index if not exists tasks_stakeholder_id_idx on public.tasks (stakeholder_id);

create table if not exists public.capital_scores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- Deprecated: prefer contact_id
  contact_name text not null,
  contact_id uuid references public.contacts(id) on delete cascade,
  economic int,
  social int,
  political int,
  career int
);
create index if not exists capital_scores_contact_id_idx on public.capital_scores (contact_id);

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- Deprecated: prefer *_contact_id
  source text not null,
  target text not null,
  source_contact_id uuid references public.contacts(id) on delete cascade,
  target_contact_id uuid references public.contacts(id) on delete cascade,
  strength public.relationship_strength_enum
);
create index if not exists relationships_source_contact_id_idx on public.relationships (source_contact_id);
create index if not exists relationships_target_contact_id_idx on public.relationships (target_contact_id);

-- Removed: interactions table is not used by the application currently

-- Removed: game_states table is not used by the application currently

create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  -- Deprecated: prefer *_company_id
  investor text not null,
  startup text not null,
  investor_company_id uuid references public.companies(id) on delete cascade,
  startup_company_id uuid references public.companies(id) on delete cascade,
  stage public.investment_stage_enum,
  amount numeric,
  status public.investment_status_enum
);
create index if not exists investments_investor_company_id_idx on public.investments (investor_company_id);
create index if not exists investments_startup_company_id_idx on public.investments (startup_company_id);

-- Project Stakeholders (normalized many-to-many between projects and contacts)
create table if not exists public.project_stakeholders (
  project_id uuid references public.projects(id) on delete cascade,
  contact_id uuid references public.contacts(id) on delete cascade,
  role text,
  primary key (project_id, contact_id)
);
create index if not exists project_stakeholders_contact_id_idx on public.project_stakeholders (contact_id);

-- Row Level Security (RLS)
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.capital_scores enable row level security;
alter table public.relationships enable row level security;
alter table public.investments enable row level security;
alter table public.project_stakeholders enable row level security;

-- Development policies (permissive). Adjust/remove for production.
-- Allow anon to insert/select/update on core tables
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'contacts' and policyname = 'anon_insert_contacts') then
    create policy "anon_insert_contacts" on public.contacts for insert to anon with check (true);
    create policy "anon_select_contacts" on public.contacts for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'companies' and policyname = 'anon_insert_companies') then
    create policy "anon_insert_companies" on public.companies for insert to anon with check (true);
    create policy "anon_select_companies" on public.companies for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'projects' and policyname = 'anon_insert_projects') then
    create policy "anon_insert_projects" on public.projects for insert to anon with check (true);
    create policy "anon_select_projects" on public.projects for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'tasks' and policyname = 'anon_insert_tasks') then
    create policy "anon_insert_tasks" on public.tasks for insert to anon with check (true);
    create policy "anon_select_tasks" on public.tasks for select to anon using (true);
  end if;
end $$;

-- Cleanup of deprecated tables handled in the destructive reset above

-- Backfill ID relationships from legacy text columns
do $$
begin
  -- projects.company_id from projects.company
  update public.projects p set company_id = c.id
  from public.companies c
  where p.company_id is null and p.company = c.name;

  -- contacts.organization_id from contacts.organization
  update public.contacts ct set organization_id = c.id
  from public.companies c
  where ct.organization_id is null and ct.organization = c.name;

  -- companies.primary_contact_id from companies.primary_contact
  update public.companies co set primary_contact_id = ct.id
  from public.contacts ct
  where co.primary_contact_id is null and co.primary_contact = ct.name;

  -- tasks.*_id from tasks.* text
  update public.tasks t set company_id = c.id
  from public.companies c
  where t.company_id is null and t.company = c.name;

  update public.tasks t set project_id = p.id
  from public.projects p
  where t.project_id is null and t.project = p.name;

  update public.tasks t set stakeholder_id = ct.id
  from public.contacts ct
  where t.stakeholder_id is null and t.stakeholder = ct.name;

  -- capital_scores.contact_id from capital_scores.contact_name
  update public.capital_scores cs set contact_id = ct.id
  from public.contacts ct
  where cs.contact_id is null and cs.contact_name = ct.name;

  -- relationships source/target ids
  update public.relationships r set source_contact_id = ct.id
  from public.contacts ct
  where r.source_contact_id is null and r.source = ct.name;

  update public.relationships r set target_contact_id = ct.id
  from public.contacts ct
  where r.target_contact_id is null and r.target = ct.name;

  -- investments investor/startup company ids
  update public.investments i set investor_company_id = c.id
  from public.companies c
  where i.investor_company_id is null and i.investor = c.name;

  update public.investments i set startup_company_id = c.id
  from public.companies c
  where i.startup_company_id is null and i.startup = c.name;

  -- project_stakeholders from projects.stakeholders text list (semicolon separated)
  insert into public.project_stakeholders (project_id, contact_id, role)
  select p.id as project_id, ct.id as contact_id, null as role
  from public.projects p
  join lateral unnest(string_to_array(coalesce(p.stakeholders, ''), ';')) as s(name) on true
  join public.contacts ct on trim(s.name) = ct.name
  where not exists (
    select 1 from public.project_stakeholders ps
    where ps.project_id = p.id and ps.contact_id = ct.id
  );
end $$;
