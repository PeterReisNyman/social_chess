-- Social Chess: Clear Database Script
-- Use in Supabase SQL editor to wipe all data (keep tables and policies), or optionally
-- drop and recreate the entire public schema (then rerun database/schema.sql).

-- OPTION A (default): Truncate all application tables and reset identities
-- Safe: keeps tables, columns, indexes, RLS policies, and grants intact.
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

-- OPTION B (nuclear): Drop and recreate the public schema
-- WARNING: This removes all tables, policies, functions, etc. You must rerun database/schema.sql afterwards.
-- Uncomment to use.
-- drop schema if exists public cascade;
-- create schema public;
-- create extension if not exists "pgcrypto";

