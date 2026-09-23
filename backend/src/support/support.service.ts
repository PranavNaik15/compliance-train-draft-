import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateSupportDto } from './dto/create-support.dto';
import { SupportRequest } from './entities/support.entity';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class SupportService implements OnModuleInit {
  private readonly logger = new Logger(SupportService.name);
  private inMemorySupport: Map<string, SupportRequest> = new Map();

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    await this.initSupportTable();
  }

  private async initSupportTable() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS support_requests (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(150),
          email VARCHAR(255),
          phone VARCHAR(50),
          category VARCHAR(150),
          subject VARCHAR(255),
          message TEXT NOT NULL,
          status VARCHAR(50) DEFAULT 'open',
          response TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      this.logger.log('🐘 support_requests table initialized in PostgreSQL.');
    } catch (err: any) {
      this.logger.warn(`PostgreSQL support_requests table init skipped: ${err.message}. Using in-memory fallback.`);
    }
  }

  /**
   * Submit a new live support / customer support ticket or message.
   */
  async create(dto: CreateSupportDto) {
    const { message, name, email, phone, category, subject } = dto || {};
    const errors: string[] = [];

    if (!message || typeof message !== 'string' || !message.trim()) {
      errors.push('Message is required.');
    } else if (message.trim().length > 3000) {
      errors.push('Message must not exceed 3000 characters.');
    }

    if (email && typeof email === 'string' && email.trim()) {
      if (!EMAIL_REGEX.test(email.trim())) {
        errors.push('Please provide a valid email address.');
      }
    }

    if (name && typeof name === 'string' && name.trim().length > 150) {
      errors.push('Name must not exceed 150 characters.');
    }

    if (phone && typeof phone === 'string' && phone.trim().length > 50) {
      errors.push('Phone number must not exceed 50 characters.');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const trimmedMsg = message.trim();
    const trimmedName = name && typeof name === 'string' && name.trim() ? name.trim() : undefined;
    const trimmedEmail = email && typeof email === 'string' && email.trim() ? email.trim().toLowerCase() : undefined;
    const trimmedPhone = phone && typeof phone === 'string' && phone.trim() ? phone.trim() : undefined;
    const trimmedCategory = (category && typeof category === 'string' && category.trim() ? category.trim() : undefined) ||
                           (subject && typeof subject === 'string' && subject.trim() ? subject.trim() : undefined) || 'General Support';
    const trimmedSubject = (subject && typeof subject === 'string' && subject.trim() ? subject.trim() : undefined) || trimmedCategory;

    const supportId = `support-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();
    const autoResponse = 'Thank you for contacting ComplianceTrain Live Support! A HIPAA & SAMHSA compliance advisor has received your message and will assist you.';

    const record: SupportRequest = {
      id: supportId,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      category: trimmedCategory,
      subject: trimmedSubject,
      message: trimmedMsg,
      status: 'open',
      response: autoResponse,
      createdAt: now,
    };

    try {
      await this.db.query(
        `INSERT INTO support_requests (
          id, name, email, phone, category, subject, message, status, response, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP);`,
        [
          record.id,
          record.name || null,
          record.email || null,
          record.phone || null,
          record.category || null,
          record.subject || null,
          record.message,
          record.status,
          record.response || null,
        ],
      );
    } catch (err: any) {
      this.inMemorySupport.set(record.id, record);
    }

    this.inMemorySupport.set(record.id, record);

    return {
      success: true,
      message: autoResponse,
      data: record,
    };
  }

  /**
   * Retrieve all support tickets.
   */
  async findAll(): Promise<{ success: boolean; count: number; data: SupportRequest[] }> {
    let requests: SupportRequest[] = [];

    try {
      const { rows } = await this.db.query(
        'SELECT * FROM support_requests ORDER BY created_at DESC',
      );
      if (rows && rows.length > 0) {
        requests = rows.map((r) => ({
          id: r.id,
          name: r.name || undefined,
          email: r.email || undefined,
          phone: r.phone || undefined,
          category: r.category || undefined,
          subject: r.subject || undefined,
          message: r.message,
          status: r.status || 'open',
          response: r.response || undefined,
          createdAt: r.created_at,
        }));
      }
    } catch (err: any) {
      requests = Array.from(this.inMemorySupport.values());
    }

    if (requests.length === 0 && this.inMemorySupport.size > 0) {
      requests = Array.from(this.inMemorySupport.values());
    }

    return {
      success: true,
      count: requests.length,
      data: requests,
    };
  }

  /**
   * Retrieve a single support ticket by ID.
   */
  async findOne(id: string): Promise<{ success: boolean; data: SupportRequest }> {
    const trimmedId = (id || '').trim();

    try {
      const { rows } = await this.db.query(
        'SELECT * FROM support_requests WHERE id = $1',
        [trimmedId],
      );
      if (rows && rows.length > 0) {
        const r = rows[0];
        return {
          success: true,
          data: {
            id: r.id,
            name: r.name || undefined,
            email: r.email || undefined,
            phone: r.phone || undefined,
            category: r.category || undefined,
            subject: r.subject || undefined,
            message: r.message,
            status: r.status || 'open',
            response: r.response || undefined,
            createdAt: r.created_at,
          },
        };
      }
    } catch (err: any) {}

    const found = this.inMemorySupport.get(trimmedId);
    if (found) {
      return {
        success: true,
        data: found,
      };
    }

    throw new NotFoundException({
      success: false,
      message: `Support request with ID "${id}" not found.`,
    });
  }
}
