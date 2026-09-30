import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { webinars as defaultMockWebinars } from '../data/webinars';

export interface Speaker {
  name: string;
  role?: string;
  company?: string;
  bio?: string;
  avatarUrl?: string;
}

export interface WebinarRecord {
  id: string;
  title: string;
  shortDescription?: string;
  fullDescription?: string;
  speakerId?: string;
  speaker: Speaker;
  date: string;
  time: string;
  duration?: string;
  price?: number;
  type?: string;
  category?: string;
  level?: string;
  badgeLabel?: string;
  image?: string;
  status: 'published' | 'unpublished';
  featured?: boolean;
  isFeatured?: boolean;
  websiteVisibility: 'ORIGINAL' | 'BRIDGE' | 'BOTH';
  agenda?: string[];
  prerequisites?: string | null;
}

@Injectable()
export class WebinarsService {
  private readonly logger = new Logger(WebinarsService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly filePath = path.resolve(process.cwd(), 'data', 'webinars.json');

  constructor() {
    this.ensureDataFile();
  }

  private ensureDataFile(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (!fs.existsSync(this.filePath)) {
        // Initialize with default webinars data
        const initialData = defaultMockWebinars.map((w, index) => ({
          ...w,
          price: 179,
          type: 'Live Webinar',
          image: '/hero-executive.jpg',
          status: 'published' as const,
          featured: index < 2,
          isFeatured: index < 2,
          websiteVisibility: 'BOTH' as const,
        }));
        fs.writeFileSync(this.filePath, JSON.stringify(initialData, null, 2), 'utf-8');
        this.logger.log(`Initialized persistent webinars storage at ${this.filePath}`);
      }
    } catch (err: any) {
      this.logger.error(`Failed to initialize data file: ${err.message}`);
    }
  }

  private readWebinars(): WebinarRecord[] {
    this.ensureDataFile();
    try {
      const content = fs.readFileSync(this.filePath, 'utf-8');
      if (!content || !content.trim()) {
        return [];
      }
      return JSON.parse(content) as WebinarRecord[];
    } catch (err: any) {
      this.logger.error(`Error reading ${this.filePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to read webinars data file.');
    }
  }

  private writeWebinars(webinars: WebinarRecord[]): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.filePath, JSON.stringify(webinars, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Error writing ${this.filePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to write webinars data file.');
    }
  }

  async findAll(query?: { site?: string; admin?: string; type?: string }) {
    const allWebinars = this.readWebinars();
    const siteParam = query?.site ? query.site.toUpperCase() : null;
    const isAdmin = query?.admin === 'true';

    let result = allWebinars;

    // Filter by website visibility for public sites
    if (siteParam === 'ORIGINAL') {
      result = result.filter(
        (w) =>
          (w.websiteVisibility === 'ORIGINAL' || w.websiteVisibility === 'BOTH' || !w.websiteVisibility) &&
          (isAdmin || w.status === 'published' || !w.status)
      );
    } else if (siteParam === 'BRIDGE') {
      result = result.filter(
        (w) =>
          (w.websiteVisibility === 'BRIDGE' || w.websiteVisibility === 'BOTH' || !w.websiteVisibility) &&
          (isAdmin || w.status === 'published' || !w.status)
      );
    } else if (!isAdmin) {
      // General public request without site param: only return published
      result = result.filter((w) => w.status === 'published' || !w.status);
    }

    if (query?.type && query.type !== 'all') {
      result = result.filter((w) => w.type?.toLowerCase() === query.type?.toLowerCase());
    }

    return {
      success: true,
      count: result.length,
      data: result,
    };
  }

  async findOne(id: string) {
    const allWebinars = this.readWebinars();
    const item =
      allWebinars.find((w) => w.id === id) ||
      (Number.isInteger(Number(id)) && Number(id) >= 1 && Number(id) <= allWebinars.length
        ? allWebinars[Number(id) - 1]
        : null);

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

  async create(createDto: any) {
    if (!createDto || !createDto.title) {
      throw new BadRequestException({
        success: false,
        message: 'Webinar title is required.',
      });
    }

    const allWebinars = this.readWebinars();

    // Generate unique ID
    const slug = createDto.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 30);
    const uniqueId = createDto.id || `webinar-${slug || Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Normalize speaker
    let speakerObj: Speaker = {
      name: 'Brian L. Tuttle',
      role: 'Health IT & Compliance Consultant',
      company: 'InGauge Healthcare Solutions',
      bio: 'Brian is a nationally renowned compliance consultant.',
      avatarUrl: '/speaker-brian.jpg',
    };

    if (createDto.speaker) {
      if (typeof createDto.speaker === 'string') {
        try {
          speakerObj = JSON.parse(createDto.speaker);
        } catch {
          speakerObj = { name: createDto.speaker };
        }
      } else {
        speakerObj = { ...speakerObj, ...createDto.speaker };
      }
    } else if (createDto.speakerName) {
      speakerObj = {
        name: createDto.speakerName,
        role: createDto.speakerRole || 'Compliance Consultant',
        company: createDto.speakerCompany || 'Healthcare Regulatory Faculty',
        bio: createDto.speakerBio || '',
        avatarUrl: createDto.speakerPhoto || '/speaker-brian.jpg',
      };
    }

    // Normalize visibility
    let visibility: 'ORIGINAL' | 'BRIDGE' | 'BOTH' = 'BOTH';
    if (createDto.websiteVisibility) {
      const visUpper = String(createDto.websiteVisibility).toUpperCase();
      if (visUpper === 'ORIGINAL' || visUpper === 'BRIDGE' || visUpper === 'BOTH') {
        visibility = visUpper;
      }
    }

    // Normalize status
    const status: 'published' | 'unpublished' =
      createDto.status === 'unpublished' || createDto.status === 'draft' ? 'unpublished' : 'published';

    const speakerId = createDto.speakerId || createDto.speaker?.id || 'spk-1';

    const newWebinar: WebinarRecord = {
      id: uniqueId,
      title: createDto.title.trim(),
      shortDescription:
        createDto.shortDescription ||
        createDto.description ||
        'Comprehensive healthcare regulatory compliance training.',
      fullDescription:
        createDto.fullDescription ||
        createDto.description ||
        createDto.shortDescription ||
        'Join our expert faculty for an intensive compliance session.',
      speakerId,
      speaker: speakerObj,
      date: createDto.date || 'TBD',
      time: createDto.time || '10:00 AM PDT - 01:00 PM EDT',
      duration: createDto.duration || '90 minutes',
      price: createDto.price !== undefined ? Number(createDto.price) : 179,
      type: createDto.type || 'Live Webinar',
      category: createDto.category || 'HIPAA Privacy & Security',
      level: createDto.level || 'All Levels',
      badgeLabel: createDto.badgeLabel || 'COMPLIANCE WEBINAR',
      image: createDto.image || '/hero-executive.jpg',
      status,
      featured: Boolean(createDto.featured ?? createDto.isFeatured),
      isFeatured: Boolean(createDto.isFeatured ?? createDto.featured),
      websiteVisibility: visibility,
      agenda: Array.isArray(createDto.agenda)
        ? createDto.agenda
        : [
            'Comprehensive analysis of current regulatory standards',
            'Interactive Q&A session with faculty',
            'Take-home implementation checklist and presentation materials',
          ],
      prerequisites:
        createDto.prerequisites ||
        'Applicable to healthcare administrators, compliance officers, and practice teams.',
    };

    allWebinars.unshift(newWebinar);
    this.writeWebinars(allWebinars);
    this.logger.log(`Created new webinar with ID: ${newWebinar.id}`);

    return {
      success: true,
      data: newWebinar,
    };
  }

  async update(id: string, updateDto: any) {
    const allWebinars = this.readWebinars();
    const index = allWebinars.findIndex((w) => w.id === id);

    if (index === -1) {
      throw new NotFoundException({
        success: false,
        message: `Webinar with ID "${id}" not found for update.`,
      });
    }

    const existing = allWebinars[index];

    // Normalize speaker update
    let updatedSpeaker = existing.speaker;
    if (updateDto.speaker) {
      if (typeof updateDto.speaker === 'string') {
        try {
          updatedSpeaker = JSON.parse(updateDto.speaker);
        } catch {
          updatedSpeaker = { ...existing.speaker, name: updateDto.speaker };
        }
      } else {
        updatedSpeaker = { ...existing.speaker, ...updateDto.speaker };
      }
    } else if (updateDto.speakerName) {
      updatedSpeaker = {
        ...existing.speaker,
        name: updateDto.speakerName,
        role: updateDto.speakerRole || existing.speaker?.role,
        company: updateDto.speakerCompany || existing.speaker?.company,
        avatarUrl: updateDto.speakerPhoto || existing.speaker?.avatarUrl,
      };
    }

    // Normalize visibility
    let visibility = existing.websiteVisibility;
    if (updateDto.websiteVisibility) {
      const visUpper = String(updateDto.websiteVisibility).toUpperCase();
      if (visUpper === 'ORIGINAL' || visUpper === 'BRIDGE' || visUpper === 'BOTH') {
        visibility = visUpper;
      }
    }

    // Normalize status
    let status = existing.status;
    if (updateDto.status !== undefined) {
      status = updateDto.status === 'unpublished' || updateDto.status === 'draft' ? 'unpublished' : 'published';
    }

    const isFeatured =
      updateDto.isFeatured !== undefined
        ? Boolean(updateDto.isFeatured)
        : updateDto.featured !== undefined
        ? Boolean(updateDto.featured)
        : existing.isFeatured;

    const speakerId =
      updateDto.speakerId !== undefined
        ? updateDto.speakerId
        : updateDto.speaker?.id !== undefined
        ? updateDto.speaker.id
        : existing.speakerId;

    const updatedWebinar: WebinarRecord = {
      ...existing,
      title: updateDto.title !== undefined ? String(updateDto.title).trim() : existing.title,
      shortDescription:
        updateDto.shortDescription !== undefined
          ? updateDto.shortDescription
          : updateDto.description !== undefined
          ? updateDto.description
          : existing.shortDescription,
      fullDescription:
        updateDto.fullDescription !== undefined
          ? updateDto.fullDescription
          : updateDto.description !== undefined
          ? updateDto.description
          : existing.fullDescription,
      speakerId,
      speaker: updatedSpeaker,
      date: updateDto.date !== undefined ? updateDto.date : existing.date,
      time: updateDto.time !== undefined ? updateDto.time : existing.time,
      duration: updateDto.duration !== undefined ? updateDto.duration : existing.duration,
      price: updateDto.price !== undefined ? Number(updateDto.price) : existing.price,
      type: updateDto.type !== undefined ? updateDto.type : existing.type,
      category: updateDto.category !== undefined ? updateDto.category : existing.category,
      level: updateDto.level !== undefined ? updateDto.level : existing.level,
      badgeLabel: updateDto.badgeLabel !== undefined ? updateDto.badgeLabel : existing.badgeLabel,
      image: updateDto.image !== undefined ? updateDto.image : existing.image,
      status,
      featured: isFeatured,
      isFeatured,
      websiteVisibility: visibility,
      agenda: updateDto.agenda !== undefined ? updateDto.agenda : existing.agenda,
      prerequisites: updateDto.prerequisites !== undefined ? updateDto.prerequisites : existing.prerequisites,
    };

    allWebinars[index] = updatedWebinar;
    this.writeWebinars(allWebinars);
    this.logger.log(`Updated webinar with ID: ${id}`);

    return {
      success: true,
      data: updatedWebinar,
    };
  }

  async remove(id: string) {
    const allWebinars = this.readWebinars();
    const index = allWebinars.findIndex((w) => w.id === id);

    if (index === -1) {
      throw new NotFoundException({
        success: false,
        message: `Webinar with ID "${id}" not found for deletion.`,
      });
    }

    allWebinars.splice(index, 1);
    this.writeWebinars(allWebinars);
    this.logger.log(`Deleted webinar with ID: ${id}`);

    return {
      success: true,
      message: `Webinar with ID "${id}" deleted successfully.`,
    };
  }
}
