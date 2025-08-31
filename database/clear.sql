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