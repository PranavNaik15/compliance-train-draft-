import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CreateSupportDto } from './dto/create-support.dto';

export interface SupportRecord {
  id: string;
  user: string;
  name?: string;
  email?: string;
  subject: string;
  message: string;
  category?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;
  website: 'ORIGINAL' | 'BRIDGE' | string;
  date?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSupportDto {
  status?: string;
  priority?: string;
  notes?: string;
}

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly filePath = path.resolve(process.cwd(), 'data', 'support-requests.json');

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
        this.logger.log(`Created new support storage file at ${this.filePath}`);
      }
    } catch (err: any) {
      this.logger.error(`Error ensuring support file: ${err.message}`);
    }
  }

  public readSupport(): SupportRecord[] {
    try {
      this.ensureDataFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content);
    } catch (err: any) {
      this.logger.error(`Failed to read support-requests.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to read support storage.');
    }
  }

  public writeSupport(records: SupportRecord[]): void {
    try {
      this.ensureDataFile();
      fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Failed to write support-requests.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to write support storage.');
    }
  }

  async create(dto: CreateSupportDto & { website?: string; priority?: string }) {
    const { name, email, subject, message, category, priority, website } = dto || {};

    if (!message || typeof message !== 'string' || !message.trim()) {
      throw new BadRequestException({
        success: false,
        message: 'Message is required.',
      });
    }

    const trimmedMsg = message.trim();
    const resolvedName = (name && typeof name === 'string' && name.trim()) ? name.trim() : 'Guest User';
    const resolvedEmail = (email && typeof email === 'string' && email.trim()) ? email.trim() : 'support-user@compliancetrain.org';
    const resolvedSubject = (subject && typeof subject === 'string' && subject.trim()) ? subject.trim() : (category || 'Live Support Chat');
    const resolvedCategory = (category && typeof category === 'string' && category.trim()) ? category.trim() : 'General Support';
    const resolvedPriority = (priority ? priority.toUpperCase() : 'MEDIUM') as string;

    const nextNum = Math.floor(800 + Math.random() * 9100);
    const id = `SUP-${nextNum}`;
    const now = new Date().toISOString();
    const dateFormatted = now.replace('T', ' ').slice(0, 16);
    const originWeb = (website || 'ORIGINAL').toUpperCase() === 'BRIDGE' ? 'BRIDGE' : 'ORIGINAL';

    const newTicket: SupportRecord = {
      id,
      user: resolvedName,
      name: resolvedName,
      email: resolvedEmail,
      subject: resolvedSubject,
      message: trimmedMsg,
      category: resolvedCategory,
      priority: resolvedPriority,
      website: originWeb,
      date: dateFormatted,
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    };

    const tickets = this.readSupport();
    tickets.unshift(newTicket);
    this.writeSupport(tickets);

    return {
      success: true,
      message: 'Thank you for reaching out! A HIPAA & SAMHSA compliance advisor has received your ticket and will assist you shortly.',
      data: newTicket,
      ticketId: id,
    };
  }

  async findAll(query?: {
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    website?: string;
  }) {
    let list = this.readSupport();

    if (query?.status && query.status !== 'all') {
      const s = query.status.toUpperCase();
      list = list.filter((t) => {
        const tStatus = (t.status || '').toUpperCase();
        if (s === 'OPEN') return tStatus === 'OPEN';
        if (s === 'IN_PROGRESS') return tStatus === 'IN_PROGRESS';
        if (s === 'RESOLVED') return tStatus === 'RESOLVED';
        if (s === 'CLOSED') return tStatus === 'CLOSED';
        return tStatus === s;
      });
    }

    if (query?.priority && query.priority !== 'all') {
      const p = query.priority.toUpperCase();
      list = list.filter((t) => (t.priority || '').toUpperCase() === p);
    }

    if (query?.category && query.category !== 'all') {
      const c = query.category.toLowerCase();
      list = list.filter((t) => (t.category || '').toLowerCase().includes(c));
    }

    if (query?.website && query.website !== 'all') {
      const w = query.website.toUpperCase();
      list = list.filter((t) => {
        const tWeb = (t.website || '').toUpperCase();
        if (w === 'ORIGINAL') return tWeb === 'ORIGINAL' || tWeb === 'BOTH';
        if (w === 'BRIDGE') return tWeb === 'BRIDGE' || tWeb === 'BOTH';
        return tWeb === w;
      });
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.id.toLowerCase().includes(q) ||
          (t.user && t.user.toLowerCase().includes(q)) ||
          (t.name && t.name.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q)) ||
          (t.subject && t.subject.toLowerCase().includes(q)) ||
          (t.message && t.message.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)),
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
    const list = this.readSupport();
    const item = list.find((t) => t.id === id || t.id.toLowerCase() === id.toLowerCase());
    if (!item) {
      throw new NotFoundException(`Support ticket with ID "${id}" not found.`);
    }
    return {
      success: true,
      data: item,
    };
  }

  async update(id: string, dto: UpdateSupportDto) {
    const list = this.readSupport();
    const index = list.findIndex((t) => t.id === id || t.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Support ticket with ID "${id}" not found.`);
    }

    const existing = list[index];
    const now = new Date().toISOString();

    const updatedRecord: SupportRecord = {
      ...existing,
      status: dto.status ? dto.status.toUpperCase() : existing.status,
      priority: dto.priority ? dto.priority.toUpperCase() : existing.priority,
      notes: dto.notes !== undefined ? dto.notes : existing.notes,
      updatedAt: now,
    };

    list[index] = updatedRecord;
    this.writeSupport(list);

    return {
      success: true,
      message: 'Support ticket updated successfully.',
      data: updatedRecord,
    };
  }

  async remove(id: string) {
    const list = this.readSupport();
    const index = list.findIndex((t) => t.id === id || t.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Support ticket with ID "${id}" not found.`);
    }
    const removed = list.splice(index, 1)[0];
    this.writeSupport(list);
    return {
      success: true,
      message: `Support ticket "${id}" removed.`,
      data: removed,
    };
  }
}
