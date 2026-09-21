import { Injectable, NotFoundException, InternalServerErrorException, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { webinars as mockWebinars } from '../data/webinars';

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
  badgeLabel?: string;
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
      shortDescription: row.short_description || row.shortDescription,
      fullDescription: row.full_description || row.fullDescription,
      speaker: typeof row.speaker === 'string' ? JSON.parse(row.speaker) : row.speaker,
      date: row.date,
      time: row.time,
      duration: row.duration,
      category: row.category,
      level: row.level,
      badgeLabel: row.badge_label || row.badgeLabel,
      agenda: typeof row.agenda === 'string' ? JSON.parse(row.agenda) : row.agenda,
      prerequisites: row.prerequisites,
    };
  }

  async findAll() {
    try {
      const { rows } = await this.db.query('SELECT * FROM webinars ORDER BY id ASC');
      if (rows && rows.length > 0) {
        return {
          success: true,
          count: rows.length,
          data: rows.map((r) => this.formatWebinar(r)),
        };
      }
    } catch (error: any) {
      this.logger.warn('PostgreSQL not accessible, using built-in webinars data');
    }

    return {
      success: true,
      count: mockWebinars.length,
      data: mockWebinars,
    };
  }

  async findOne(id: string) {
    try {
      const { rows } = await this.db.query('SELECT * FROM webinars WHERE id = $1', [id]);

      if (rows && rows.length > 0) {
        return {
          success: true,
          data: this.formatWebinar(rows[0]),
        };
      }
    } catch (error: any) {
      this.logger.warn(`PostgreSQL not accessible, looking up ID "${id}" in built-in webinars data`);
    }

    const item = mockWebinars.find((w) => w.id === id) || 
      (Number.isInteger(Number(id)) && Number(id) >= 1 && Number(id) <= mockWebinars.length ? mockWebinars[Number(id) - 1] : null);

    if (item) {
      return {
        success: true,
        data: item,
      };
    }

    throw new NotFoundException({
      success: false,
      message: `Webinar with ID "${id}" not found.`,
    });
  }
}
