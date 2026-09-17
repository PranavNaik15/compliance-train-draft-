import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateRegistrationDto } from './dto/create-registration.dto';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegistrationFormatted {
  id: string;
  webinarId: string;
  webinarTitle: string;
  webinarDate: string;
  webinarTime: string;
  fullName: string;
  companyName: string;
  workEmail: string;
  jobRole: string;
  registeredAt: string;
}

@Injectable()
export class RegistrationsService {
  private readonly logger = new Logger(RegistrationsService.name);

  constructor(private readonly db: DatabaseService) {}

  formatRegistration(row: any): RegistrationFormatted | null {
    if (!row) return null;
    return {
      id: row.id,
      webinarId: row.webinar_id,
      webinarTitle: row.webinar_title,
      webinarDate: row.webinar_date,
      webinarTime: row.webinar_time,
      fullName: row.full_name,
      companyName: row.company_name,
      workEmail: row.work_email,
      jobRole: row.job_role,
      registeredAt: row.registered_at,
    };
  }

  async create(dto: CreateRegistrationDto) {
    const { webinarId, fullName, companyName, workEmail, jobRole } = dto || {};
    const errors: string[] = [];

    if (!webinarId || typeof webinarId !== 'string' || !webinarId.trim()) {
      errors.push('Webinar ID is required.');
    }
    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      errors.push('Full name is required.');
    }
    if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
      errors.push('Company name is required.');
    }
    if (!workEmail || typeof workEmail !== 'string' || !workEmail.trim()) {
      errors.push('Work email is required.');
    } else if (!EMAIL_REGEX.test(workEmail.trim())) {
      errors.push('Please provide a valid work email address.');
    }
    if (!jobRole || typeof jobRole !== 'string' || !jobRole.trim()) {
      errors.push('Job role is required.');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const trimmedWebinarId = webinarId.trim();
    const trimmedEmail = workEmail.trim();
    const normalizedEmail = trimmedEmail.toLowerCase();

    try {
      // 1. Verify webinar exists
      const webinarResult = await this.db.query(
        'SELECT id, title, date, time FROM webinars WHERE id = $1',
        [trimmedWebinarId],
      );
      if (webinarResult.rows.length === 0) {
        throw new NotFoundException({
          success: false,
          message: 'Webinar not found.',
          errors: ['Webinar not found.'],
        });
      }

      const webinar = webinarResult.rows[0];

      // 2. Check duplicate
      const existingRegistration = await this.db.query(
        'SELECT id FROM registrations WHERE webinar_id = $1 AND LOWER(work_email) = $2',
        [trimmedWebinarId, normalizedEmail],
      );

      if (existingRegistration.rows.length > 0) {
        throw new BadRequestException({
          success: false,
          message: `Already registered with email "${trimmedEmail}".`,
          errors: [`Already registered with email "${trimmedEmail}".`],
        });
      }

      // 3. Insert
      const registrationId = `reg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const insertResult = await this.db.query(
        `INSERT INTO registrations (
          id, webinar_id, webinar_title, webinar_date, webinar_time,
          full_name, company_name, work_email, job_role, registered_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        RETURNING *;`,
        [
          registrationId,
          webinar.id,
          webinar.title,
          webinar.date,
          webinar.time,
          fullName.trim(),
          companyName.trim(),
          trimmedEmail,
          jobRole.trim(),
        ],
      );

      return {
        success: true,
        message: 'Registration successful!',
        data: this.formatRegistration(insertResult.rows[0]),
      };
    } catch (error: any) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      if (error.code === '23505') {
        throw new BadRequestException({
          success: false,
          message: 'Already registered.',
          errors: ['Already registered.'],
        });
      }
      this.logger.error('Error during registration:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Internal server error.',
        error: error.message,
      });
    }
  }

  async findAll() {
    try {
      const { rows } = await this.db.query(
        'SELECT * FROM registrations ORDER BY registered_at DESC',
      );
      return {
        success: true,
        total: rows.length,
        data: rows.map((r) => this.formatRegistration(r)),
      };
    } catch (error: any) {
      this.logger.error('Error fetching registrations:', error);
      throw new InternalServerErrorException({
        success: false,
        message: 'Failed to retrieve registrations',
        error: error.message,
      });
    }
  }
}
