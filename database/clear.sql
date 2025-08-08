-- Social Chess: Clear Database Script
begin;
  truncate table
    public.capital_scores,
    public.relationships,
    public.investments,
    public.interactions,
    public.game_states,
    public.tasks,
    public.projects,
    public.contacts,
    public.companies
  restart identity cascade;
commit;

-- Drop and recreate the public schema

drop schema if exists public cascade;
create schema public;
create extension if not exists "pgcrypto";

