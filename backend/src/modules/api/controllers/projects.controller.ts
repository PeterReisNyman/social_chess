import { Body, Controller, Get, Post } from '@nestjs/common';
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

@Controller('api/projects')
export class ProjectsController {
  constructor(private readonly sb: SupabaseService) {}

  private async findCompanyIdByName(name?: string): Promise<string | undefined> {
    if (!name) return undefined;
    const { data, error } = await this.sb
      .getClient()
      .from('companies')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    if (error) return undefined;
    return data?.id;
  }

  private mapRow(row: ProjectRow) {
    return {
      name: row.name || '',
      company: row.company || '',
      status: row.status || '',
      startDate: row.start_date || '',
      revenueModel: row.revenue_model || '',
      feeStructure: row.fee_structure || '',
      pipelineValue: row.pipeline_value || 0,
      actualRevenue: row.actual_revenue || 0,
      stakeholders: row.stakeholders || '',
      nextMilestone: row.next_milestone || '',
      notes: row.notes || '',
    };
  }

  @Get()
  async list() {
    const rows = await this.sb.select<ProjectRow>('projects');
    return rows.map((r) => this.mapRow(r));
  }

  @Post()
  async create(@Body() payload: any) {
    const row: ProjectRow & { company_id?: string } = {
      name: payload.name,
      company: payload.company,
      status: payload.status,
      start_date: payload.startDate,
      revenue_model: payload.revenueModel,
      fee_structure: payload.feeStructure,
      pipeline_value: payload.pipelineValue ? Number(payload.pipelineValue) : undefined,
      actual_revenue: payload.actualRevenue ? Number(payload.actualRevenue) : undefined,
      stakeholders: payload.stakeholders,
      next_milestone: payload.nextMilestone,
      notes: payload.notes,
    };
    row.company_id = await this.findCompanyIdByName(payload.company);
    const [inserted] = await this.sb.insert<ProjectRow>('projects', row);
    return this.mapRow(inserted);
  }
}
