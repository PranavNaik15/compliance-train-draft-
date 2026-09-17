import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class HealthService {
  constructor(private readonly db: DatabaseService) {}

  async checkHealth() {
    try {
      const dbRes = await this.db.query('SELECT NOW()');
      return {
        status: 200,
        body: {
          status: 'healthy',
          database: 'connected',
          dbTime: dbRes.rows[0].now,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err: any) {
      return {
        status: 500,
        body: {
          status: 'degraded',
          database: 'disconnected',
          error: err.message,
          timestamp: new Date().toISOString(),
        },
      };
    }
  }
}
