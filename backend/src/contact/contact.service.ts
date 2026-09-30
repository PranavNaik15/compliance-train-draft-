import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CreateContactDto } from './dto/create-contact.dto';

export interface ContactRecord {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  queryType?: string | null;
  message: string;
  website: 'ORIGINAL' | 'BRIDGE' | string;
  date?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateContactDto {
  status?: string;
  notes?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class ContactService {
  private readonly logger = new Logger(ContactService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly filePath = path.resolve(process.cwd(), 'data', 'contact-requests.json');

  constructor() {
    this.ensureDataFile();
  }

  private ensureDataFile(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
        this.logger.log(`Created new contact storage file at ${this.filePath}`);
      }
    } catch (err: any) {
      this.logger.error(`Error ensuring contact file: ${err.message}`);
    }
  }

  public readContacts(): ContactRecord[] {
    try {
      this.ensureDataFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content);
    } catch (err: any) {
      this.logger.error(`Failed to read contact-requests.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to read contact storage.');
    }
  }

  public writeContacts(records: ContactRecord[]): void {
    try {
      this.ensureDataFile();
      fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Failed to write contact-requests.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to write contact storage.');
    }
  }

  async create(dto: CreateContactDto & { website?: string }) {
    const { name, email, phone, queryType, subject, message, website } = dto || {};
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
    const resolvedSubject = (subject && typeof subject === 'string' ? subject.trim() : null) ||
                            (queryType && typeof queryType === 'string' ? queryType.trim() : 'General Inquiry');
    const trimmedMessage = message.trim();

    const nextNum = Math.floor(600 + Math.random() * 9300);
    const submissionId = `CNT-${nextNum}`;
    const now = new Date().toISOString();
    const dateStr = now.slice(0, 10);
    const originWeb = (website || 'ORIGINAL').toUpperCase() === 'BRIDGE' ? 'BRIDGE' : 'ORIGINAL';

    const newRecord: ContactRecord = {
      id: submissionId,
      name: trimmedName,
      email: trimmedEmail,
      phone: trimmedPhone,
      subject: resolvedSubject,
      queryType: queryType || resolvedSubject,
      message: trimmedMessage,
      website: originWeb,
      date: dateStr,
      status: 'NEW',
      createdAt: now,
      updatedAt: now,
    };

    const contacts = this.readContacts();
    contacts.unshift(newRecord);
    this.writeContacts(contacts);

    return {
      success: true,
      message: 'Thank you! Your inquiry has been submitted successfully. A compliance specialist will review and respond shortly.',
      data: newRecord,
      submissionId,
    };
  }

  async findAll(query?: { search?: string; status?: string; website?: string }) {
    let list = this.readContacts();

    if (query?.status && query.status !== 'all') {
      const s = query.status.toUpperCase();
      list = list.filter((c) => {
        const cStatus = (c.status || '').toUpperCase();
        if (s === 'NEW') return cStatus === 'NEW';
        if (s === 'IN_PROGRESS') return cStatus === 'IN_PROGRESS';
        if (s === 'RESOLVED') return cStatus === 'RESOLVED';
        if (s === 'CLOSED') return cStatus === 'CLOSED';
        return cStatus === s;
      });
    }

    if (query?.website && query.website !== 'all') {
      const w = query.website.toUpperCase();
      list = list.filter((c) => {
        const cWeb = (c.website || '').toUpperCase();
        if (w === 'ORIGINAL') return cWeb === 'ORIGINAL' || cWeb === 'BOTH';
        if (w === 'BRIDGE') return cWeb === 'BRIDGE' || cWeb === 'BOTH';
        return cWeb === w;
      });
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          (c.phone && c.phone.toLowerCase().includes(q)) ||
          (c.subject && c.subject.toLowerCase().includes(q)) ||
          (c.message && c.message.toLowerCase().includes(q)),
      );
    }

    // Sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime());

    return {
      success: true,
      total: list.length,
      data: list,
    };
  }

  async findOne(id: string) {
    const list = this.readContacts();
    const item = list.find((c) => c.id === id || c.id.toLowerCase() === id.toLowerCase());
    if (!item) {
      throw new NotFoundException(`Contact inquiry with ID "${id}" not found.`);
    }
    return {
      success: true,
      data: item,
    };
  }

  async update(id: string, dto: UpdateContactDto) {
    const list = this.readContacts();
    const index = list.findIndex((c) => c.id === id || c.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Contact inquiry with ID "${id}" not found.`);
    }

    const existing = list[index];
    const now = new Date().toISOString();

    const updatedRecord: ContactRecord = {
      ...existing,
      status: dto.status ? dto.status.toUpperCase() : existing.status,
      notes: dto.notes !== undefined ? dto.notes : existing.notes,
      updatedAt: now,
    };

    list[index] = updatedRecord;
    this.writeContacts(list);

    return {
      success: true,
      message: 'Contact inquiry updated successfully.',
      data: updatedRecord,
    };
  }

  async remove(id: string) {
    const list = this.readContacts();
    const index = list.findIndex((c) => c.id === id || c.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Contact inquiry with ID "${id}" not found.`);
    }
    const removed = list.splice(index, 1)[0];
    this.writeContacts(list);
    return {
      success: true,
      message: `Contact request "${id}" removed.`,
      data: removed,
    };
  }
}
