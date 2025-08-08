-- Social Chess Supabase schema

-- Extensions
create extension if not exists "pgcrypto";

-- Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  type text,
  primary_contact text,
  status text,
  projects text,
  total_pipeline numeric,
  total_revenue numeric,
  notes text
);

-- Contacts
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  organization text,
  role text,
  email text,
  phone text,
  type text,
  projects text,
  last_contact date,
  next_action text,
  relationship_strength text,
  notes text,
  tags text
);

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  company text,
  status text,
  start_date date,
  revenue_model text,
  fee_structure text,
  pipeline_value numeric,
  actual_revenue numeric,
  stakeholders text,
  next_milestone text,
  notes text
);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  task_name text not null,
  company text,
  project text,
  stakeholder text,
  due_date date,
  priority text,
  status text,
  type text,
  notes text
);

-- Capital Scores (reduced 4-dim)
create table if not exists public.capital_scores (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  contact_name text not null,
  economic int,
  social int,
  political int,
  career int
);

-- Relationships (contact-contact)
create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  source text not null,
  target text not null,
  strength text
);

-- Interactions
create table if not exists public.interactions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  date date,
  contact text,
  type text,
  notes text
);

-- Game States
create table if not exists public.game_states (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  project text,
  state text
);

-- Investments (Investor -> Startup)
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  investor text not null,
  startup text not null,
  stage text,
  amount numeric,
  status text
);

-- Row Level Security (RLS)
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.capital_scores enable row level security;
alter table public.relationships enable row level security;
alter table public.interactions enable row level security;
alter table public.game_states enable row level security;
alter table public.investments enable row level security;

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

-- Optional: add similar select/insert policies for other tables as needed

