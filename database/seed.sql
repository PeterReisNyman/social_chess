-- Social Chess seed data for Supabase

-- Companies (Investors, Startups, and a Client)
insert into public.companies (name, type, primary_contact, status, projects, total_pipeline, total_revenue, notes) values
  ('Acme Corp', 'Technology', 'Jane Smith', 'Active', 'Project Alpha', 10000, 5000, 'Important client'),
  ('Global Capital', 'Investor', null, 'Active', null, null, null, 'Brazil-focused VC'),
  ('Rio Angels', 'Investor', null, 'Active', null, null, null, 'Local angel group'),
  ('Startup A', 'Startup', null, 'Active', null, null, null, 'HealthTech'),
  ('Startup B', 'Startup', null, 'Active', null, null, null, 'FinTech');

-- Contacts (Acme Corp project stakeholders)
insert into public.contacts (name, organization, role, email, phone, type, projects, last_contact, next_action, relationship_strength, notes, tags) values
  ('Jane Smith', 'Acme Corp', 'CTO', 'jane@acme.com', '+1234567890', 'Client', 'Project Alpha', '2025-07-20', 'Follow up call', 'Strong', 'Key decision maker', 'tech,enterprise'),
  ('John Doe', 'Acme Corp', 'Head of Product', 'john@acme.com', '+55 21 99999-0001', 'Client', 'Project Alpha', '2025-07-22', 'Share prototype notes', 'Medium', 'Product lead and strong ally', 'product,ally'),
  ('Maria Silva', 'Acme Corp', 'Program Manager', 'maria@acme.com', '+55 11 98888-0002', 'Influencer', 'Project Alpha', '2025-07-23', 'Schedule status meeting', 'Medium', 'Coordinates timelines across teams', 'pm,coordination'),
  ('Carlos Pereira', 'Acme Corp', 'Legal Counsel', 'carlos@acme.com', '+55 31 97777-0003', 'Technical', 'Project Alpha', '2025-07-24', 'Send draft MSA', 'Weak', 'Reviews contracts and compliance', 'legal,compliance'),
  ('Ana Costa', 'Acme Corp', 'CFO', 'ana@acme.com', '+55 21 96666-0010', 'Decision Maker', 'Project Alpha', '2025-07-26', 'Budget alignment', 'Medium', 'Controls budget approvals', 'finance,decision'),
  ('Pedro Santos', 'Acme Corp', 'Engineering Manager', 'pedro@acme.com', '+55 11 95555-0020', 'Technical', 'Project Alpha', '2025-07-27', 'Review technical docs', 'Medium', 'Leads engineering team integration', 'engineering,backend'),
  ('Luiza Rocha', 'Acme Corp', 'Procurement Lead', 'luiza@acme.com', '+55 31 94444-0030', 'Influencer', 'Project Alpha', '2025-07-28', 'Vendor onboarding', 'Medium', 'Owns vendor onboarding and PO process', 'procurement,vendor'),
  ('Rafael Lima', 'Acme Corp', 'Security Officer', 'rafael@acme.com', '+55 61 93333-0040', 'Technical', 'Project Alpha', '2025-07-29', 'Security review', 'Medium', 'Handles security assessment and compliance', 'security,compliance'),
  ('Beatriz Alves', 'Acme Corp', 'UX Lead', 'beatriz@acme.com', '+55 21 92222-0050', 'Influencer', 'Project Alpha', '2025-07-30', 'User testing plan', 'Medium', 'Owns user testing and design signoff', 'ux,design');

-- Projects
insert into public.projects (name, company, status, start_date, revenue_model, fee_structure, pipeline_value, actual_revenue, stakeholders, next_milestone, notes) values
  ('Project Alpha', 'Acme Corp', 'Active', '2025-07-01', 'Subscription', 'Monthly', 10000, 5000, 'John Doe;Jane Smith;Maria Silva;Carlos Pereira;Ana Costa;Pedro Santos;Luiza Rocha;Rafael Lima;Beatriz Alves', 'Prototype delivery', 'Important strategic project'),
  ('Go-to-Market Brazil', 'Startup A', 'Planning', '2025-08-01', 'One-time', 'Fixed', 50000, 0, 'Jane Smith;John Doe', 'Market validation', 'Exploring partnerships'),
  ('Series A Prep', 'Startup B', 'On Hold', '2025-05-10', 'N/A', 'N/A', 0, 0, 'Ana Costa;Pedro Santos', 'Data room', 'Pending board approval');

-- Tasks
insert into public.tasks (task_name, company, project, stakeholder, due_date, priority, status, type, notes) values
  ('Sample Task', 'Acme Corp', 'Project Alpha', 'John Doe', '2025-08-04', 'High', 'Not Started', 'Call', 'Initial task'),
  ('Align Budget with CFO', 'Acme Corp', 'Project Alpha', 'Ana Costa', '2025-08-06', 'High', 'In Progress', 'Meeting', 'Confirm monthly fee and PO process'),
  ('Security Questionnaire', 'Acme Corp', 'Project Alpha', 'Rafael Lima', '2025-08-07', 'Medium', 'Not Started', 'Document', 'Provide responses to security checklist'),
  ('Procurement Vendor Form', 'Acme Corp', 'Project Alpha', 'Luiza Rocha', '2025-08-08', 'Medium', 'Not Started', 'Form', 'Submit vendor onboarding forms'),
  ('UX Review Session', 'Acme Corp', 'Project Alpha', 'Beatriz Alves', '2025-08-09', 'Low', 'Not Started', 'Workshop', 'Review prototype usability');

-- Capital Scores (4-dim)
insert into public.capital_scores (contact_name, economic, social, political, career) values
  ('Jane Smith', 50, 80, 40, 60),
  ('John Doe', 40, 70, 35, 65),
  ('Maria Silva', 30, 60, 30, 55),
  ('Carlos Pereira', 20, 40, 50, 70),
  ('Ana Costa', 70, 55, 45, 80),
  ('Pedro Santos', 35, 50, 25, 70),
  ('Luiza Rocha', 25, 55, 30, 60),
  ('Rafael Lima', 30, 45, 55, 75),
  ('Beatriz Alves', 25, 65, 20, 60);

-- Relationships (contact-contact)
insert into public.relationships (source, target, strength) values
  ('Jane Smith', 'John Doe', 'Strong'),
  ('John Doe', 'Maria Silva', 'Medium'),
  ('Maria Silva', 'Carlos Pereira', 'Weak'),
  ('Jane Smith', 'Carlos Pereira', 'Medium'),
  ('Ana Costa', 'Jane Smith', 'Medium'),
  ('Pedro Santos', 'John Doe', 'Medium'),
  ('Luiza Rocha', 'Maria Silva', 'Medium'),
  ('Rafael Lima', 'Pedro Santos', 'Medium'),
  ('Beatriz Alves', 'John Doe', 'Medium');

-- Investments (Investor -> Startup)
insert into public.investments (investor, startup, stage, amount, status) values
  ('Global Capital', 'Startup A', 'Seed', 250000, 'Closed'),
  ('Rio Angels', 'Startup A', 'Pre-Seed', 50000, 'Closed'),
  ('Global Capital', 'Startup B', 'Series A', 2000000, 'Negotiating');

-- Interactions and Game States removed from schema; no seed entries.

-- Backfill FK IDs from legacy name columns so that *_id columns are populated
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
