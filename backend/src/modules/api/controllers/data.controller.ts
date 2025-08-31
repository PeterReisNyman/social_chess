import { Controller, Get } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

type ProjectRow = {
  name?: string;
  company?: string;
  status?: string;
  start_date?: string;
  revenue_model?: string;
  fee_structure?: string;
  pipeline_value?: number;
  actual_revenue?: number;
  stakeholders?: string;
  next_milestone?: string;
  notes?: string;
};

type ContactRow = {
  name?: string;
  organization?: string;
  role?: string;
  email?: string;
  phone?: string;
  type?: string;
  projects?: string;
  last_contact?: string;
  next_action?: string;
  relationship_strength?: string;
  notes?: string;
  tags?: string;
};

type TaskRow = {
  task_name?: string;
  company?: string;
  project?: string;
  stakeholder?: string;
  due_date?: string;
  priority?: string;
  status?: string;
  type?: string;
  notes?: string;
  created_at?: string;
};

type CompanyRow = {
  name?: string;
  type?: string;
  primary_contact?: string;
  status?: string;
  projects?: string;
  total_pipeline?: number;
  total_revenue?: number;
  notes?: string;
};

type RelationshipRow = {
  source?: string;
  target?: string;
  strength?: string;
};

type CapitalScoreRow = {
  contact_name?: string;
  economic?: number;
  social?: number;
  political?: number;
  career?: number;
};

type InvestmentRow = {
  investor?: string;
  startup?: string;
  stage?: string;
  amount?: number;
  status?: string;
};

@Controller('api')
export class DataController {
  constructor(private readonly sb: SupabaseService) {}

  @Get('all')
  async getAll() {
    const [projects, contacts, tasks, companies, relationships, capitalScores, investments] = await Promise.all([
      this.sb.select<ProjectRow>('projects'),
      this.sb.select<ContactRow>('contacts'),
      this.sb.select<TaskRow>('tasks'),
      this.sb.select<CompanyRow>('companies'),
      this.sb.select<RelationshipRow>('relationships').catch(() => []),
      this.sb.select<CapitalScoreRow>('capital_scores').catch(() => []),
      this.sb.select<InvestmentRow>('investments').catch(() => []),
    ]);

    return {
      projects: projects.map((r) => ({
        name: r.name || '',
        company: r.company || '',
        status: r.status || '',
        stakeholders: r.stakeholders || '',
      })),
      contacts: contacts.map((r) => ({
        name: r.name || '',
        role: r.role || '',
        organization: r.organization || '',
        contactType: r.type || '',
        relationshipStrength: r.relationship_strength || '',
        notes: r.notes || '',
        email: r.email || '',
        phone: r.phone || '',
      })),
      tasks: tasks.map((r) => ({
        task_name: r.task_name || '',
        company: r.company || '',
        project: r.project || '',
        stakeholder: r.stakeholder || '',
        due_date: r.due_date || '',
        priority: r.priority || '',
        status: r.status || '',
        type: r.type || '',
        notes: r.notes || '',
        created_at: r.created_at || '',
      })),
      companies: companies.map((r) => ({
        name: r.name || '',
        type: r.type || '',
        primary_contact: r.primary_contact || '',
        status: r.status || '',
      })),
      relationships: relationships.map((r) => ({
        source: r.source || '',
        target: r.target || '',
        strength: r.strength || '',
      })),
      capitalScores: capitalScores.map((r) => ({
        contactName: r.contact_name || '',
        economic: r.economic || 0,
        social: r.social || 0,
        political: r.political || 0,
        career: r.career || 0,
      })),
      investments: investments.map((r) => ({
        investor: r.investor || '',
        startup: r.startup || '',
        stage: r.stage || '',
        amount: r.amount || 0,
        status: r.status || '',
      })),
    };
  }
}

