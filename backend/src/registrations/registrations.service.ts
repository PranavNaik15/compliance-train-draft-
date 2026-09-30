import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { CreateRegistrationDto } from './dto/create-registration.dto';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface RegistrationRecord {
  id: string;
  userId?: string;
  name: string;
  fullName: string;
  email: string;
  workEmail: string;
  companyName: string;
  jobRole: string;
  webinarId: string;
  webinar: string;
  webinarTitle: string;
  webinarDate: string;
  webinarTime: string;
  tier?: string;
  date: string;
  registeredAt: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  website: 'ORIGINAL' | 'BRIDGE' | string;
}

@Injectable()
export class RegistrationsService {
  private readonly logger = new Logger(RegistrationsService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly regsFilePath = path.resolve(process.cwd(), 'data', 'registrations.json');
  private readonly usersFilePath = path.resolve(process.cwd(), 'data', 'users.json');
  private readonly webinarsFilePath = path.resolve(process.cwd(), 'data', 'webinars.json');

  constructor() {
    this.ensureDataFile();
  }

  private ensureDataFile(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (!fs.existsSync(this.regsFilePath)) {
        fs.writeFileSync(this.regsFilePath, '[]', 'utf-8');
      }

      if (!fs.existsSync(this.usersFilePath)) {
        fs.writeFileSync(this.usersFilePath, '[]', 'utf-8');
      }
    } catch (err: any) {
      this.logger.error(`Failed to initialize data files: ${err.message}`);
    }
  }

  private readRegistrations(): RegistrationRecord[] {
    this.ensureDataFile();
    try {
      const content = fs.readFileSync(this.regsFilePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content) as RegistrationRecord[];
    } catch (err: any) {
      this.logger.error(`Error reading ${this.regsFilePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to read registrations file.');
    }
  }

  private writeRegistrations(records: RegistrationRecord[]): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.regsFilePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Error writing ${this.regsFilePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to write registrations file.');
    }
  }

  private readUsers(): any[] {
    try {
      if (!fs.existsSync(this.usersFilePath)) return [];
      const content = fs.readFileSync(this.usersFilePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private writeUsers(users: any[]): void {
    try {
      fs.writeFileSync(this.usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.warn(`Failed to sync user: ${err.message}`);
    }
  }

  private readWebinars(): any[] {
    try {
      if (!fs.existsSync(this.webinarsFilePath)) return [];
      const content = fs.readFileSync(this.webinarsFilePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private syncUserOnRegistration(fullName: string, email: string, companyName?: string, jobRole?: string): string {
    const users = this.readUsers();
    const normalizedEmail = email.trim().toLowerCase();
    const existingIndex = users.findIndex((u) => u.email && u.email.trim().toLowerCase() === normalizedEmail);

    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    if (existingIndex >= 0) {
      const existing = users[existingIndex];
      users[existingIndex] = {
        ...existing,
        name: fullName.trim() || existing.name,
        organization: companyName?.trim() || existing.organization || 'Independent Healthcare Professional',
        jobRole: jobRole?.trim() || existing.jobRole || '',
        updatedAt: now,
      };
      this.writeUsers(users);
      return existing.id;
    } else {
      const newUserId = `USR-${Math.floor(1000 + Math.random() * 9000)}`;
      const newUser = {
        id: newUserId,
        name: fullName.trim(),
        email: email.trim(),
        organization: companyName?.trim() || 'Independent Healthcare Professional',
        jobRole: jobRole?.trim() || '',
        membership: 'None (Pay-per-webinar)',
        status: 'active',
        registeredDate: today,
        createdAt: now,
        updatedAt: now,
      };
      users.unshift(newUser);
      this.writeUsers(users);
      return newUserId;
    }
  }

  async create(dto: CreateRegistrationDto & { website?: string; tier?: string }) {
    const { webinarId, fullName, companyName, workEmail, jobRole, website, tier } = dto || {};
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

    // 1. Verify webinar exists in webinars.json
    const webinars = this.readWebinars();
    const webinar = webinars.find((w) => w.id === trimmedWebinarId);
    if (!webinar) {
      throw new NotFoundException({
        success: false,
        message: `Webinar with ID "${trimmedWebinarId}" not found.`,
        errors: ['Webinar not found.'],
      });
    }

    // 2. Check duplicate registration
    const allRegistrations = this.readRegistrations();
    const isDuplicate = allRegistrations.some(
      (r) =>
        r.webinarId === trimmedWebinarId &&
        (r.email?.trim().toLowerCase() === normalizedEmail || r.workEmail?.trim().toLowerCase() === normalizedEmail),
    );

    if (isDuplicate) {
      throw new BadRequestException({
        success: false,
        message: `Already registered with email "${trimmedEmail}".`,
        errors: [`Already registered with email "${trimmedEmail}".`],
      });
    }

    // 3. Determine website origin
    let originWebsite: 'ORIGINAL' | 'BRIDGE' = 'ORIGINAL';
    if (website) {
      const wUpper = website.toUpperCase();
      if (wUpper.includes('BRIDGE') || wUpper.includes('5174')) {
        originWebsite = 'BRIDGE';
      }
    }

    // 4. Sync User record in users.json
    const userId = this.syncUserOnRegistration(fullName, trimmedEmail, companyName, jobRole);

    // 5. Build Registration record
    const now = new Date();
    const regId = `REG-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: RegistrationRecord = {
      id: regId,
      userId,
      name: fullName.trim(),
      fullName: fullName.trim(),
      email: trimmedEmail,
      workEmail: trimmedEmail,
      companyName: companyName.trim(),
      jobRole: jobRole.trim(),
      webinarId: webinar.id,
      webinar: webinar.title,
      webinarTitle: webinar.title,
      webinarDate: webinar.date || 'TBD',
      webinarTime: webinar.time || '10:00 AM PDT',
      tier: tier || `Single Attendee ($${webinar.price || 179})`,
      date: now.toISOString().slice(0, 10),
      registeredAt: now.toISOString(),
      status: 'confirmed',
      website: originWebsite,
    };

    allRegistrations.unshift(newRecord);
    this.writeRegistrations(allRegistrations);

    return {
      success: true,
      message: 'Registration successful!',
      data: newRecord,
    };
  }

  async findAll(query?: { search?: string; status?: string; website?: string; webinarId?: string; userId?: string }) {
    const all = this.readRegistrations();
    let result = all;

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.id.toLowerCase().includes(q) ||
          r.name.toLowerCase().includes(q) ||
          r.email.toLowerCase().includes(q) ||
          (r.webinar && r.webinar.toLowerCase().includes(q)) ||
          (r.companyName && r.companyName.toLowerCase().includes(q)),
      );
    }

    if (query?.status && query.status !== 'all') {
      result = result.filter((r) => r.status.toLowerCase() === query.status.toLowerCase());
    }

    if (query?.website && query.website !== 'all') {
      const wQuery = query.website.toUpperCase();
      result = result.filter((r) => r.website.toUpperCase() === wQuery);
    }

    if (query?.webinarId) {
      result = result.filter((r) => r.webinarId === query.webinarId);
    }

    if (query?.userId) {
      result = result.filter((r) => r.userId === query.userId);
    }

    return {
      success: true,
      total: result.length,
      data: result,
    };
  }

  async findOne(id: string) {
    const all = this.readRegistrations();
    const reg = all.find((r) => r.id === id);
    if (!reg) {
      throw new NotFoundException(`Registration with ID "${id}" not found.`);
    }
    return {
      success: true,
      data: reg,
    };
  }

  async update(id: string, updateDto: { status?: 'confirmed' | 'pending' | 'cancelled' | 'completed' }) {
    const all = this.readRegistrations();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new NotFoundException(`Registration with ID "${id}" not found.`);
    }

    const existing = all[index];
    const updated: RegistrationRecord = {
      ...existing,
      status: updateDto.status || existing.status,
    };

    all[index] = updated;
    this.writeRegistrations(all);

    return {
      success: true,
      message: 'Registration status updated successfully.',
      data: updated,
    };
  }

  async remove(id: string) {
    const all = this.readRegistrations();
    const index = all.findIndex((r) => r.id === id);
    if (index === -1) {
      throw new NotFoundException(`Registration with ID "${id}" not found.`);
    }

    all.splice(index, 1);
    this.writeRegistrations(all);

    return {
      success: true,
      message: 'Registration deleted successfully.',
      data: { id },
    };
  }
}
