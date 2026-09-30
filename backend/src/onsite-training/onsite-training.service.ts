import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CreateOnsiteTrainingDto } from './dto/create-onsite-training.dto';

export interface OnsiteTrainingRecord {
  id: string;
  name: string;
  organization: string;
  email: string;
  phone: string;
  industry?: string | null;
  preferredTime?: string | null;
  preferredDate?: string | null;
  specificNeeds?: string | null;
  trainingTopic?: string | null;
  requirements?: string | null;
  participants?: string | null;
  attendeeCount?: string | number | null;
  website: 'ORIGINAL' | 'BRIDGE' | string;
  date?: string;
  status: 'NEW' | 'IN_PROGRESS' | 'SCHEDULED' | 'RESOLVED' | 'COMPLETED' | 'CANCELLED' | string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOnsiteTrainingDto {
  status?: string;
  notes?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class OnsiteTrainingService {
  private readonly logger = new Logger(OnsiteTrainingService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly filePath = path.resolve(process.cwd(), 'data', 'onsite-training-requests.json');

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
        this.logger.log(`Created new onsite training storage file at ${this.filePath}`);
      }
    } catch (err: any) {
      this.logger.error(`Error ensuring onsite training file: ${err.message}`);
    }
  }

  public readOnsite(): OnsiteTrainingRecord[] {
    try {
      this.ensureDataFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content);
    } catch (err: any) {
      this.logger.error(`Failed to read onsite-training-requests.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to read onsite training storage.');
    }
  }

  public writeOnsite(records: OnsiteTrainingRecord[]): void {
    try {
      this.ensureDataFile();
      fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Failed to write onsite-training-requests.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to write onsite training storage.');
    }
  }

  async create(dto: CreateOnsiteTrainingDto & { website?: string; organization?: string; participants?: string; trainingTopic?: string }) {
    const { name, email, phone, industry, preferredTime, preferredDate, specificNeeds, organization, participants, trainingTopic, website } = dto || {};
    const errors: string[] = [];

    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Full name is required.');
    } else if (name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long.');
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      errors.push('Work email is required.');
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.push('Please provide a valid work email address.');
    }

    if (!phone || typeof phone !== 'string' || !phone.trim()) {
      errors.push('Phone number is required.');
    }

    if (!industry || typeof industry !== 'string' || !industry.trim()) {
      errors.push('Industry / organization domain is required.');
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
    const resolvedOrg = (organization && typeof organization === 'string' && organization.trim()) ? organization.trim() : `${trimmedIndustry} Organization`;
    const resolvedTopic = (trainingTopic && typeof trainingTopic === 'string' && trainingTopic.trim()) ? trainingTopic.trim() : (specificNeeds || `${trimmedIndustry} Compliance Workshop`);
    const resolvedNeeds = (specificNeeds && typeof specificNeeds === 'string' && specificNeeds.trim()) ? specificNeeds.trim() : resolvedTopic;
    const resolvedParticipants = (participants && typeof participants === 'string' && participants.trim()) ? participants.trim() : '15-30 Staff Members';

    const nextNum = Math.floor(400 + Math.random() * 9500);
    const id = `ONS-${nextNum}`;
    const now = new Date().toISOString();
    const dateStr = now.slice(0, 10);
    const originWeb = (website || 'ORIGINAL').toUpperCase() === 'BRIDGE' ? 'BRIDGE' : 'ORIGINAL';

    const newRecord: OnsiteTrainingRecord = {
      id,
      name: trimmedName,
      organization: resolvedOrg,
      email: trimmedEmail,
      phone: trimmedPhone,
      industry: trimmedIndustry,
      preferredTime: preferredTime || preferredDate || 'Flexible / Business Hours',
      preferredDate: preferredDate || preferredTime || 'TBD with Coordinator',
      specificNeeds: resolvedNeeds,
      requirements: resolvedNeeds,
      trainingTopic: resolvedTopic,
      participants: resolvedParticipants,
      attendeeCount: resolvedParticipants,
      website: originWeb,
      date: dateStr,
      status: 'NEW',
      createdAt: now,
      updatedAt: now,
    };

    const records = this.readOnsite();
    records.unshift(newRecord);
    this.writeOnsite(records);

    return {
      success: true,
      message: 'Thank you! Your on-site training consultation request has been received. An institutional training coordinator will contact you to finalize syllabus and dates.',
      data: newRecord,
      requestId: id,
    };
  }

  async findAll(query?: { search?: string; status?: string; website?: string }) {
    let list = this.readOnsite();

    if (query?.status && query.status !== 'all') {
      const s = query.status.toUpperCase();
      list = list.filter((r) => {
        const rStatus = (r.status || '').toUpperCase();
        if (s === 'NEW') return rStatus === 'NEW';
        if (s === 'IN_PROGRESS') return rStatus === 'IN_PROGRESS';
        if (s === 'RESOLVED' || s === 'SCHEDULED') return rStatus === 'RESOLVED' || rStatus === 'SCHEDULED';
        if (s === 'COMPLETED') return rStatus === 'COMPLETED';
        if (s === 'CANCELLED') return rStatus === 'CANCELLED';
        return rStatus === s;
      });
    }

    if (query?.website && query.website !== 'all') {
      const w = query.website.toUpperCase();
      list = list.filter((r) => {
        const rWeb = (r.website || '').toUpperCase();
        if (w === 'ORIGINAL') return rWeb === 'ORIGINAL' || rWeb === 'BOTH';
        if (w === 'BRIDGE') return rWeb === 'BRIDGE' || rWeb === 'BOTH';
        return rWeb === w;
      });
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          (r.organization && r.organization.toLowerCase().includes(q)) ||
          r.email.toLowerCase().includes(q) ||
          (r.phone && r.phone.toLowerCase().includes(q)) ||
          (r.trainingTopic && r.trainingTopic.toLowerCase().includes(q)) ||
          (r.specificNeeds && r.specificNeeds.toLowerCase().includes(q)) ||
          (r.industry && r.industry.toLowerCase().includes(q)),
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
    const list = this.readOnsite();
    const item = list.find((r) => r.id === id || r.id.toLowerCase() === id.toLowerCase());
    if (!item) {
      throw new NotFoundException(`On-site training request with ID "${id}" not found.`);
    }
    return {
      success: true,
      data: item,
    };
  }

  async update(id: string, dto: UpdateOnsiteTrainingDto) {
    const list = this.readOnsite();
    const index = list.findIndex((r) => r.id === id || r.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`On-site training request with ID "${id}" not found.`);
    }

    const existing = list[index];
    const now = new Date().toISOString();

    const updatedRecord: OnsiteTrainingRecord = {
      ...existing,
      status: dto.status ? dto.status.toUpperCase() : existing.status,
      notes: dto.notes !== undefined ? dto.notes : existing.notes,
      updatedAt: now,
    };

    list[index] = updatedRecord;
    this.writeOnsite(list);

    return {
      success: true,
      message: 'On-site training request updated successfully.',
      data: updatedRecord,
    };
  }

  async remove(id: string) {
    const list = this.readOnsite();
    const index = list.findIndex((r) => r.id === id || r.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`On-site training request with ID "${id}" not found.`);
    }
    const removed = list.splice(index, 1)[0];
    this.writeOnsite(list);
    return {
      success: true,
      message: `On-site training request "${id}" removed.`,
      data: removed,
    };
  }
}
