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
  WebsiteContentRecord,
  CreateWebsiteContentDto,
  UpdateWebsiteContentDto,
} from './website-content.interface';

@Injectable()
export class WebsiteContentService {
  private readonly logger = new Logger(WebsiteContentService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly filePath = path.resolve(process.cwd(), 'data', 'website-content.json');

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
        this.logger.log(`Created new website-content storage at ${this.filePath}`);
      }
    } catch (err: any) {
      this.logger.error(`Error ensuring website-content file: ${err.message}`);
    }
  }

  public readContent(): WebsiteContentRecord[] {
    try {
      this.ensureDataFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content);
    } catch (err: any) {
      this.logger.error(`Failed to read website-content.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to read website content storage.');
    }
  }

  public writeContent(records: WebsiteContentRecord[]): void {
    try {
      this.ensureDataFile();
      fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Failed to write website-content.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to write website content storage.');
    }
  }

  async findAll(query?: {
    website?: string;
    section?: string;
    search?: string;
    status?: string;
  }) {
    let list = this.readContent();

    if (query?.website && query.website !== 'all') {
      const w = query.website.toUpperCase();
      if (w === 'ORIGINAL') {
        list = list.filter((c) => (c.website || '').toUpperCase() === 'ORIGINAL' || (c.website || '').toUpperCase() === 'BOTH');
      } else if (w === 'BRIDGE') {
        list = list.filter((c) => (c.website || '').toUpperCase() === 'BRIDGE' || (c.website || '').toUpperCase() === 'BOTH');
      } else if (w === 'BOTH') {
        list = list.filter((c) => (c.website || '').toUpperCase() === 'BOTH');
      }
    }

    if (query?.section && query.section !== 'all') {
      const s = query.section.toUpperCase();
      list = list.filter((c) => (c.section || '').toUpperCase() === s);
    }

    if (query?.status && query.status !== 'all') {
      const st = query.status.toUpperCase();
      list = list.filter((c) => (c.status || '').toUpperCase() === st);
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.key.toLowerCase().includes(q) ||
          (c.label && c.label.toLowerCase().includes(q)) ||
          c.content.toLowerCase().includes(q) ||
          c.section.toLowerCase().includes(q),
      );
    }

    return {
      success: true,
      total: list.length,
      data: list,
    };
  }

  async findOne(id: string) {
    const list = this.readContent();
    const item = list.find((c) => c.id === id || c.id.toLowerCase() === id.toLowerCase() || c.key === id);
    if (!item) {
      throw new NotFoundException(`Website content item with ID or key "${id}" not found.`);
    }
    return {
      success: true,
      data: item,
    };
  }

  async create(dto: CreateWebsiteContentDto) {
    if (!dto.section || !dto.key || dto.content === undefined) {
      throw new BadRequestException('Section, key, and content are required.');
    }

    const list = this.readContent();
    const cleanKey = dto.key.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');
    const id = `cnt-${dto.section.toLowerCase()}-${cleanKey}`;

    const existingIdx = list.findIndex((c) => c.id === id || (c.section.toUpperCase() === dto.section.toUpperCase() && c.key === cleanKey && (c.website || 'BOTH') === (dto.website || 'BOTH')));
    const now = new Date().toISOString();

    const record: WebsiteContentRecord = {
      id,
      section: dto.section.toUpperCase(),
      key: cleanKey,
      label: dto.label || cleanKey.replace(/_/g, ' '),
      content: dto.content,
      website: (dto.website || 'BOTH').toUpperCase(),
      status: (dto.status || 'ACTIVE').toUpperCase(),
      updatedAt: now,
    };

    if (existingIdx >= 0) {
      list[existingIdx] = record;
    } else {
      list.push(record);
    }

    this.writeContent(list);

    return {
      success: true,
      message: 'Website content saved successfully.',
      data: record,
    };
  }

  async update(id: string, dto: UpdateWebsiteContentDto) {
    const list = this.readContent();
    const index = list.findIndex((c) => c.id === id || c.id.toLowerCase() === id.toLowerCase() || c.key === id);
    if (index === -1) {
      throw new NotFoundException(`Website content item with ID or key "${id}" not found.`);
    }

    const existing = list[index];
    const now = new Date().toISOString();

    const updatedRecord: WebsiteContentRecord = {
      ...existing,
      content: dto.content !== undefined ? dto.content : existing.content,
      label: dto.label !== undefined ? dto.label : existing.label,
      section: dto.section ? dto.section.toUpperCase() : existing.section,
      website: dto.website ? dto.website.toUpperCase() : existing.website,
      status: dto.status ? dto.status.toUpperCase() : existing.status,
      updatedAt: now,
    };

    list[index] = updatedRecord;
    this.writeContent(list);

    return {
      success: true,
      message: 'Website content updated successfully.',
      data: updatedRecord,
    };
  }

  async remove(id: string) {
    const list = this.readContent();
    const index = list.findIndex((c) => c.id === id || c.id.toLowerCase() === id.toLowerCase() || c.key === id);
    if (index === -1) {
      throw new NotFoundException(`Website content item with ID or key "${id}" not found.`);
    }
    const removed = list.splice(index, 1)[0];
    this.writeContent(list);
    return {
      success: true,
      message: `Website content "${id}" removed.`,
      data: removed,
    };
  }
}
