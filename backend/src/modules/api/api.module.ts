import { Module } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { TasksController } from './controllers/tasks.controller';
import { ProjectsController } from './controllers/projects.controller';
import { ContactsController } from './controllers/contacts.controller';
import { CompaniesController } from './controllers/companies.controller';
import { DataController } from './controllers/data.controller';

@Module({
  controllers: [
    TasksController,
    ProjectsController,
    ContactsController,
    CompaniesController,
    DataController,
  ],
  providers: [SupabaseService],
})
export class ApiModule {}

