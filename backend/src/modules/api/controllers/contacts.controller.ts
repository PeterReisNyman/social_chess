import { Body, Controller, Get, Post } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';

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

@Controller('api/contacts')
export class ContactsController {
  constructor(private readonly sb: SupabaseService) {}

  private mapRow(row: ContactRow) {
    return {
      name: row.name || '',
      organization: row.organization || '',
      role: row.role || '',
      email: row.email || '',
      phone: row.phone || '',
      type: row.type || '',
      projects: row.projects || '',
      lastContact: row.last_contact || '',
      nextAction: row.next_action || '',
      relationshipStrength: row.relationship_strength || '',
      notes: row.notes || '',
      tags: row.tags || '',
    };
  }

  @Get()
  async list() {
    const rows = await this.sb.select<ContactRow>('contacts');
    return rows.map((r) => this.mapRow(r));
  }

  @Post()
  async create(@Body() payload: any) {
    const row: ContactRow = {
      name: payload.name,
      organization: payload.organization,
      role: payload.role,
      email: payload.email,
      phone: payload.phone,
      type: payload.type,
      projects: payload.projects,
      last_contact: payload.lastContact,
      next_action: payload.nextAction,
      relationship_strength: payload.relationshipStrength,
      notes: payload.notes,
      tags: payload.tags,
    };
    const [inserted] = await this.sb.insert<ContactRow>('contacts', row);
    return this.mapRow(inserted);
  }
}

