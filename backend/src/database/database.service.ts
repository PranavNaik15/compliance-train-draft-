import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || 'webinar_platform',
      user: process.env.PGUSER || process.env.USER,
      password: process.env.PGPASSWORD || undefined,
    });

    this.pool.on('error', (err) => {
      this.logger.error('Unexpected error on idle PostgreSQL client', err);
    });
  }

  async onModuleInit() {
    try {
      const res = await this.query('SELECT current_database(), current_user, version()');
      this.logger.log(
        `🐘 Connected to PostgreSQL "${res.rows[0].current_database}" as user "${res.rows[0].current_user}"`,
      );
    } catch (err: any) {
      this.logger.error('❌ Failed to connect to PostgreSQL:', err.message);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends Record<string, any> = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  getPool(): Pool {
    return this.pool;
  }
}
