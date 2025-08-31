import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private client: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    const url = this.config.get<string>('SUPABASE_URL');
    const key = this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') || this.config.get<string>('SUPABASE_ANON_KEY');
    if (!url || !key) {
      this.logger.warn('Supabase URL or Key missing in environment. API endpoints will fail.');
    } else {
      this.client = createClient(url, key);
    }
  }

  getClient(): SupabaseClient {
    if (!this.client) {
      throw new Error('Supabase client not initialized. Check environment variables.');
    }
    return this.client;
  }

  async select<T = any>(table: string, columns = '*'): Promise<T[]> {
    const { data, error } = await this.getClient().from(table).select(columns);
    if (error) throw error;
    return data as T[];
  }

  async insert<T = any>(table: string, payload: any | any[]): Promise<T[]> {
    const { data, error } = await this.getClient().from(table).insert(payload).select();
    if (error) throw error;
    return data as T[];
  }
}

