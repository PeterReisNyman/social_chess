import { Body, Controller, Get, Post } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

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

@Controller('api/companies')
export class CompaniesController {
  constructor(private readonly sb: SupabaseService) {}

  private async findContactIdByName(name?: string): Promise<string | undefined> {
    if (!name) return undefined;
    const { data, error } = await this.sb
      .getClient()
      .from('contacts')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    if (error) return undefined;
    return data?.id;
  }

  private mapRow(row: CompanyRow) {
    return {
      name: row.name || '',
      type: row.type || '',
      primaryContact: row.primary_contact || '',
      status: row.status || '',
      projects: row.projects || '',
      totalPipeline: row.total_pipeline || 0,
      totalRevenue: row.total_revenue || 0,
      notes: row.notes || '',
    };
  }

  @Get()
  async list() {
    const rows = await this.sb.select<CompanyRow>('companies');
    return rows.map((r) => this.mapRow(r));
  }

  @Post()
  async create(@Body() payload: any) {
    const row: CompanyRow & { primary_contact_id?: string } = {
      name: payload.name,
      type: payload.type,
      primary_contact: payload.primaryContact,
      status: payload.status,
      projects: payload.projects,
      total_pipeline: payload.totalPipeline ? Number(payload.totalPipeline) : undefined,
      total_revenue: payload.totalRevenue ? Number(payload.totalRevenue) : undefined,
      notes: payload.notes,
    };
    row.primary_contact_id = await this.findContactIdByName(payload.primaryContact);
    const [inserted] = await this.sb.insert<CompanyRow>('companies', row);
    return this.mapRow(inserted);
  }
}
