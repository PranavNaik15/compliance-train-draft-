import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateOnsiteTrainingDto } from './dto/create-onsite-training.dto';
import { OnsiteTrainingRequest } from './entities/onsite-training.entity';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class OnsiteTrainingService implements OnModuleInit {
  private readonly logger = new Logger(OnsiteTrainingService.name);
  private inMemoryRequests: Map<string, OnsiteTrainingRequest> = new Map();

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    await this.initOnsiteTrainingTable();
  }

  private async initOnsiteTrainingTable() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS onsite_training_requests (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50) NOT NULL,
          industry VARCHAR(150) NOT NULL,
          preferred_time VARCHAR(100),
          specific_needs TEXT,
          organization VARCHAR(255),
          participants_count INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      this.logger.log('🐘 onsite_training_requests table initialized in PostgreSQL.');
    } catch (err: any) {
      this.logger.warn(`PostgreSQL onsite_training_requests table init skipped: ${err.message}. Using in-memory fallback.`);
    }
  }

  /**
   * Submit a new onsite training request.
   */
  async create(dto: CreateOnsiteTrainingDto) {
    const {
      name,
      email,
      phone,
      industry,
      preferredTime,
      specificNeeds,
      organization,
      participantsCount,
      trainingRequirements,
    } = dto || {};

    const errors: string[] = [];

    // 1. Name validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Full name is required.');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long.');
    } else if (name.trim().length > 150) {
      errors.push('Name must not exceed 150 characters.');
    }

    // 2. Email validation
    if (!email || typeof email !== 'string' || !email.trim()) {
      errors.push('Email address is required.');
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.push('Please provide a valid email address.');
    }

    // 3. Phone validation
    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      errors.push('Phone number is required.');
    } else if (phone.trim().length < 5) {
      errors.push('Phone number must be at least 5 characters.');
    } else if (phone.trim().length > 50) {
      errors.push('Phone number must not exceed 50 characters.');
    }

    // 4. Industry validation
    if (!industry || typeof industry !== 'string' || !industry.trim()) {
      errors.push('Your Industry is required.');
    } else if (industry.trim().length > 150) {
      errors.push('Industry must not exceed 150 characters.');
    }

    // 5. Participants Count validation (if provided)
    if (participantsCount !== undefined && participantsCount !== null && participantsCount !== ('' as any)) {
      const parsedCount = Number(participantsCount);
      if (isNaN(parsedCount) || !Number.isInteger(parsedCount) || parsedCount < 1) {
        errors.push('Number of participants must be a positive integer greater than or equal to 1.');
      }
    }

    // 6. Text length validation
    const resolvedNeeds = specificNeeds || trainingRequirements;
    if (resolvedNeeds && typeof resolvedNeeds === 'string' && resolvedNeeds.trim().length > 3000) {
      errors.push('Specific training needs must not exceed 3000 characters.');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPhone = phone.trim();
    const trimmedIndustry = industry.trim();
    const trimmedTime = preferredTime && typeof preferredTime === 'string' ? preferredTime.trim() : undefined;
    const trimmedNeeds = resolvedNeeds && typeof resolvedNeeds === 'string' ? resolvedNeeds.trim() : undefined;
    const trimmedOrg = organization && typeof organization === 'string' ? organization.trim() : undefined;
    const numParticipants = participantsCount ? Number(participantsCount) : undefined;

    const requestId = `onsite-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const record: OnsiteTrainingRequest = {
      id: requestId,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      industry: trimmedIndustry,
      preferredTime: trimmedTime,
      specificNeeds: trimmedNeeds,
      organization: trimmedOrg,
      participantsCount: numParticipants,
      createdAt: now,
    };

    // Save to PostgreSQL or in-memory
    try {
      await this.db.query(
        `INSERT INTO onsite_training_requests (
          id, name, email, phone, industry, preferred_time, specific_needs, organization, participants_count, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP);`,
        [
          record.id,
          record.name,
          record.email,
          record.phone,
          record.industry,
          record.preferredTime || null,
          record.specificNeeds || null,
          record.organization || null,
          record.participantsCount || null,
        ],
      );
    } catch (err: any) {
      this.inMemoryRequests.set(record.id, record);
    }

    this.inMemoryRequests.set(record.id, record);

    return {
      success: true,
      message: `Thank you, ${record.name}. A ComplianceTrain coordinator will contact you promptly at ${record.phone} to customize your onsite program.`,
      data: record,
    };
  }

  /**
   * Retrieve all onsite training requests.
   */
  async findAll(): Promise<{ success: boolean; count: number; data: OnsiteTrainingRequest[] }> {
    let requests: OnsiteTrainingRequest[] = [];

    try {
      const { rows } = await this.db.query(
        'SELECT * FROM onsite_training_requests ORDER BY created_at DESC',
      );
      if (rows && rows.length > 0) {
        requests = rows.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone,
          industry: r.industry,
          preferredTime: r.preferred_time || undefined,
          specificNeeds: r.specific_needs || undefined,
          organization: r.organization || undefined,
          participantsCount: r.participants_count ? Number(r.participants_count) : undefined,
          createdAt: r.created_at,
        }));
      }
    } catch (err: any) {
      requests = Array.from(this.inMemoryRequests.values());
    }

    if (requests.length === 0 && this.inMemoryRequests.size > 0) {
      requests = Array.from(this.inMemoryRequests.values());
    }

    return {
      success: true,
      count: requests.length,
      data: requests,
    };
  }

  /**
   * Retrieve a single onsite training request by ID.
   */
  async findOne(id: string): Promise<{ success: boolean; data: OnsiteTrainingRequest }> {
    const trimmedId = (id || '').trim();

    try {
      const { rows } = await this.db.query(
        'SELECT * FROM onsite_training_requests WHERE id = $1',
        [trimmedId],
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          success: true,
          data: {
            id: r.id,
            name: r.name,
            email: r.email,
            phone: r.phone,
            industry: r.industry,
            preferredTime: r.preferred_time || undefined,
            specificNeeds: r.specific_needs || undefined,
            organization: r.organization || undefined,
            participantsCount: r.participants_count ? Number(r.participants_count) : undefined,
            createdAt: r.created_at,
          },
        };
      }
    } catch (err: any) {}

    const found = this.inMemoryRequests.get(trimmedId);
    if (found) {
      return {
        success: true,
        data: found,
      };
    }

    throw new NotFoundException({
      success: false,
      message: `Onsite training request with ID "${id}" not found.`,
    });
  }
}
