import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import {
  MediaRecord,
  CreateMediaDto,
  UpdateMediaDto,
} from './media.interface';

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly filePath = path.resolve(process.cwd(), 'data', 'media.json');

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
        this.logger.log(`Created new media storage at ${this.filePath}`);
      }
    } catch (err: any) {
      this.logger.error(`Error ensuring media file: ${err.message}`);
    }
  }

  public readMedia(): MediaRecord[] {
    try {
      this.ensureDataFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content);
    } catch (err: any) {
      this.logger.error(`Failed to read media.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to read media storage.');
    }
  }

  public writeMedia(records: MediaRecord[]): void {
    try {
      this.ensureDataFile();
      fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Failed to write media.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to write media storage.');
    }
  }

  async findAll(query?: {
    website?: string;
    type?: string;
    category?: string;
    search?: string;
    status?: string;
  }) {
    let list = this.readMedia();

    if (query?.website && query.website !== 'all') {
      const w = query.website.toUpperCase();
      if (w === 'ORIGINAL') {
        list = list.filter((m) => (m.website || '').toUpperCase() === 'ORIGINAL' || (m.website || '').toUpperCase() === 'BOTH');
      } else if (w === 'BRIDGE') {
        list = list.filter((m) => (m.website || '').toUpperCase() === 'BRIDGE' || (m.website || '').toUpperCase() === 'BOTH');
      } else if (w === 'BOTH') {
        list = list.filter((m) => (m.website || '').toUpperCase() === 'BOTH');
      }
    }

    if (query?.category && query.category !== 'all') {
      const c = query.category.toLowerCase();
      list = list.filter((m) => (m.category || '').toLowerCase() === c || (m.section || '').toLowerCase() === c);
    }

    if (query?.type && query.type !== 'all') {
      const t = query.type.toUpperCase();
      list = list.filter((m) => (m.type || '').toUpperCase() === t);
    }

    if (query?.status && query.status !== 'all') {
      const s = query.status.toUpperCase();
      list = list.filter((m) => (m.status || '').toUpperCase() === s);
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.id.toLowerCase().includes(q) ||
          m.name.toLowerCase().includes(q) ||
          (m.filename && m.filename.toLowerCase().includes(q)) ||
          (m.altText && m.altText.toLowerCase().includes(q)) ||
          (m.category && m.category.toLowerCase().includes(q)),
      );
    }

    return {
      success: true,
      total: list.length,
      data: list,
    };
  }

  async findOne(id: string) {
    const list = this.readMedia();
    const item = list.find((m) => m.id === id || m.id.toLowerCase() === id.toLowerCase());
    if (!item) {
      throw new NotFoundException(`Media asset with ID "${id}" not found.`);
    }
    return {
      success: true,
      data: item,
    };
  }

  async create(dto: CreateMediaDto) {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('Asset name / filename is required.');
    }

    const trimmedName = dto.name.trim();
    const filename = dto.filename?.trim() || trimmedName;
    const url = dto.url?.trim() || '/hero-executive.jpg';
    const nextId = `med-${Date.now()}`;
    const now = new Date().toISOString();

    let detectedType = (dto.type || 'IMAGE').toUpperCase();
    if (filename.endsWith('.pdf') || filename.endsWith('.doc') || filename.endsWith('.docx')) {
      detectedType = 'DOCUMENT';
    } else if (filename.endsWith('.mp4') || filename.endsWith('.webm') || filename.endsWith('.mov')) {
      detectedType = 'VIDEO';
    }

    const newRecord: MediaRecord = {
      id: nextId,
      name: trimmedName,
      filename,
      type: detectedType,
      url,
      altText: dto.altText?.trim() || trimmedName,
      category: dto.category?.trim() || 'Webinar Visuals',
      section: dto.section?.trim() || 'HOMEPAGE',
      size: dto.size || '180 KB',
      dimensions: dto.dimensions || (detectedType === 'IMAGE' ? '1920x1080' : undefined),
      website: (dto.website || 'BOTH').toUpperCase(),
      status: (dto.status || 'ACTIVE').toUpperCase(),
      createdAt: now,
      updatedAt: now,
    };

    const mediaList = this.readMedia();
    mediaList.unshift(newRecord);
    this.writeMedia(mediaList);

    return {
      success: true,
      message: 'Media asset metadata added to library.',
      data: newRecord,
    };
  }

  async update(id: string, dto: UpdateMediaDto) {
    const list = this.readMedia();
    const index = list.findIndex((m) => m.id === id || m.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Media asset with ID "${id}" not found.`);
    }

    const existing = list[index];
    const now = new Date().toISOString();

    const updatedRecord: MediaRecord = {
      ...existing,
      name: dto.name?.trim() || existing.name,
      filename: dto.filename?.trim() || existing.filename,
      type: dto.type ? dto.type.toUpperCase() : existing.type,
      url: dto.url?.trim() || existing.url,
      altText: dto.altText !== undefined ? dto.altText : existing.altText,
      category: dto.category || existing.category,
      section: dto.section || existing.section,
      website: dto.website ? dto.website.toUpperCase() : existing.website,
      status: dto.status ? dto.status.toUpperCase() : existing.status,
      updatedAt: now,
    };

    list[index] = updatedRecord;
    this.writeMedia(list);

    return {
      success: true,
      message: 'Media metadata updated successfully.',
      data: updatedRecord,
    };
  }

  async remove(id: string) {
    const list = this.readMedia();
    const index = list.findIndex((m) => m.id === id || m.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Media asset with ID "${id}" not found.`);
    }

    const removed = list.splice(index, 1)[0];
    this.writeMedia(list);

    return {
      success: true,
      message: `Media metadata "${id}" removed from library.`,
      data: removed,
    };
  }
}
