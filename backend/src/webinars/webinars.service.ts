import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface WebinarFormatted {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  speaker: any;
  date: string;
  time: string;
  duration: string;
  category: string;
  level: string;
  agenda: any;
  prerequisites: string | null;
}

@Injectable()
export class WebinarsService {
  private readonly logger = new Logger(WebinarsService.name);

  constructor(private readonly db: DatabaseService) {}

  formatWebinar(row: any): WebinarFormatted | null {
    if (!row) return null;
    return {
      id: row.id,
      title: row.title,
      shortDescription: row.short_description,
      fullDescription: row.full_description,
      speaker: typeof row.speaker === 'string' ? JSON.parse(row.speaker) : row.speaker,
      date: row.date,
      time: row.time,
      duration: row.duration,
      category: row.category,
      level: row.level,
      agenda: typeof row.agenda === 'string' ? JSON.parse(row.agenda) : row.agenda,
      prerequisites: row.prerequisites,
    };
  }

  async findAll() {
    try {
      const { rows } = await this.db.query('SELECT * FROM webinars ORDER BY id ASC');
      return {
        success: true,
        count: rows.length,
        data: rows.map((r) => this.formatWebinar(r)),
      };
    } catch (error: any) {
      this.logger.error('Error fetching webinars from PostgreSQL:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to retrieve webinars from database',
        error: error.message,
      });
    }
  }

  async findOne(id: string) {
    try {
      const { rows } = await this.db.query('SELECT * FROM webinars WHERE id = $1', [id]);

      if (rows.length === 0) {
        throw new NotFoundException({
          success: false,
          message: `Webinar with ID "${id}" not found.`,
        });
      }

      return {
        success: true,
        data: this.formatWebinar(rows[0]),
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      this.logger.error('Error fetching webinar details from PostgreSQL:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to retrieve webinar details',
        error: error.message,
      });
    }
  }
}
