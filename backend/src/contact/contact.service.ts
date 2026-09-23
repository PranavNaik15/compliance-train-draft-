import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateContactDto } from './dto/create-contact.dto';
import { ContactSubmission } from './entities/contact.entity';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class ContactService implements OnModuleInit {
  private readonly logger = new Logger(ContactService.name);
  private inMemoryContacts: Map<string, ContactSubmission> = new Map();

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    await this.initContactTable();
  }

  private async initContactTable() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS contact_submissions (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(255) NOT NULL,
          phone VARCHAR(50),
          query_type VARCHAR(150),
          subject VARCHAR(255),
          message TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      this.logger.log('🐘 contact_submissions table initialized in PostgreSQL.');
    } catch (err: any) {
      this.logger.warn(`PostgreSQL contact_submissions table init skipped: ${err.message}. Using in-memory fallback.`);
    }
  }

  /**
   * Submit a new contact inquiry.
   */
  async create(dto: CreateContactDto) {
    const { name, email, phone, queryType, subject, message } = dto || {};
    const errors: string[] = [];

    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Full name is required.');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long.');
    } else if (name.trim().length > 150) {
      errors.push('Name must not exceed 150 characters.');
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      errors.push('Email address is required.');
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.push('Please provide a valid email address.');
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      errors.push('Message is required.');
    } else if (message.trim().length < 5) {
      errors.push('Message must be at least 5 characters long.');
    } else if (message.trim().length > 3000) {
      errors.push('Message must not exceed 3000 characters.');
    }

    if (phone && (typeof phone !== 'string' || phone.trim().length > 50)) {
      errors.push('Phone number must not exceed 50 characters.');
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
    const trimmedPhone = phone && typeof phone === 'string' ? phone.trim() : null;
    const resolvedQueryType = (queryType && typeof queryType === 'string' ? queryType.trim() : null) ||
                              (subject && typeof subject === 'string' ? subject.trim() : null) || null;
    const resolvedSubject = (subject && typeof subject === 'string' ? subject.trim() : null) || resolvedQueryType;
    const trimmedMessage = message.trim();

    const submissionId = `contact-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const record: ContactSubmission = {
      id: submissionId,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone || undefined,
      queryType: resolvedQueryType || undefined,
      subject: resolvedSubject || undefined,
      message: trimmedMessage,
      createdAt: now,
    };

    // Save to PostgreSQL if available, otherwise in-memory map
    try {
      await this.db.query(
        `INSERT INTO contact_submissions (
          id, name, email, phone, query_type, subject, message, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP);`,
        [
          record.id,
          record.name,
          record.email,
          record.phone || null,
          record.queryType || null,
          record.subject || null,
          record.message,
        ],
      );
    } catch (err: any) {
      this.inMemoryContacts.set(record.id, record);
    }

    this.inMemoryContacts.set(record.id, record);

    return {
      success: true,
      message: 'Thank you for reaching out! Your inquiry has been received. Our compliance team will respond promptly.',
      data: record,
    };
  }

  /**
   * Retrieve all contact submissions.
   */
  async findAll(): Promise<{ success: boolean; count: number; data: ContactSubmission[] }> {
    let submissions: ContactSubmission[] = [];

    try {
      const { rows } = await this.db.query(
        'SELECT * FROM contact_submissions ORDER BY created_at DESC',
      );
      if (rows && rows.length > 0) {
        submissions = rows.map((r) => ({
          id: r.id,
          name: r.name,
          email: r.email,
          phone: r.phone || undefined,
          queryType: r.query_type || undefined,
          subject: r.subject || undefined,
          message: r.message,
          createdAt: r.created_at,
        }));
      }
    } catch (err: any) {
      submissions = Array.from(this.inMemoryContacts.values());
    }

    if (submissions.length === 0 && this.inMemoryContacts.size > 0) {
      submissions = Array.from(this.inMemoryContacts.values());
    }

    return {
      success: true,
      count: submissions.length,
      data: submissions,
    };
  }

  /**
   * Retrieve a single contact submission by ID.
   */
  async findOne(id: string): Promise<{ success: boolean; data: ContactSubmission }> {
    const trimmedId = (id || '').trim();

    try {
      const { rows } = await this.db.query(
        'SELECT * FROM contact_submissions WHERE id = $1',
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
            phone: r.phone || undefined,
            queryType: r.query_type || undefined,
            subject: r.subject || undefined,
            message: r.message,
            createdAt: r.created_at,
          },
        };
      }
    } catch (err: any) {}

    const found = this.inMemoryContacts.get(trimmedId);
    if (found) {
      return {
        success: true,
        data: found,
      };
    }

    throw new NotFoundException({
      success: false,
      message: `Contact submission with ID "${id}" not found.`,
    });
  }
}
