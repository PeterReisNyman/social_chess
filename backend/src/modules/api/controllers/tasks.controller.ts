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
    const row: TaskRow = {
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
    const [inserted] = await this.sb.insert<TaskRow>('tasks', row);
    return this.mapRow(inserted);
  }
}

