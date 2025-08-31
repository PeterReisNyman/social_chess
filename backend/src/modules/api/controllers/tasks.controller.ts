import { Body, Controller, Get, Post } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

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

@Controller('api/tasks')
export class TasksController {
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

  private async findProjectIdByName(name?: string): Promise<string | undefined> {
    if (!name) return undefined;
    const { data, error } = await this.sb
      .getClient()
      .from('projects')
      .select('id')
      .eq('name', name)
      .maybeSingle();
    if (error) return undefined;
    return data?.id;
  }

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

  private mapRow(row: TaskRow) {
    return {
      name: row.task_name || '',
      company: row.company || '',
      project: row.project || '',
      stakeholder: row.stakeholder || '',
      dueDate: row.due_date || '',
      priority: row.priority || '',
      status: row.status || '',
      type: row.type || '',
      notes: row.notes || '',
      createdAt: row.created_at || '',
    };
  }

  @Get()
  async list() {
    const rows = await this.sb.select<TaskRow>('tasks');
    return rows.map((r) => this.mapRow(r));
  }

  @Post()
  async create(@Body() payload: any) {
    // Expect camelCase from frontend, map to supabase columns
    const row: TaskRow & { company_id?: string; project_id?: string; stakeholder_id?: string } = {
      task_name: payload.taskName || payload.name,
      company: payload.company,
      project: payload.project,
      stakeholder: payload.stakeholder,
      due_date: payload.dueDate,
      priority: payload.priority,
      status: payload.status || 'Not Started',
      type: payload.type || 'Task',
      notes: payload.notes,
    };
    // Best-effort foreign keys
    row.company_id = await this.findCompanyIdByName(payload.company);
    row.project_id = await this.findProjectIdByName(payload.project);
    row.stakeholder_id = await this.findContactIdByName(payload.stakeholder);
    const [inserted] = await this.sb.insert<TaskRow>('tasks', row);
    return this.mapRow(inserted);
  }
}
