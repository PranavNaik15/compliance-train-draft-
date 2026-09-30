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
  NotificationRecord,
  CreateNotificationDto,
  UpdateNotificationDto,
} from './notifications.interface';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly filePath = path.resolve(process.cwd(), 'data', 'notifications.json');

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
        this.logger.log(`Created new notifications storage at ${this.filePath}`);
      }
    } catch (err: any) {
      this.logger.error(`Error ensuring notifications file: ${err.message}`);
    }
  }

  public readNotifications(): NotificationRecord[] {
    try {
      this.ensureDataFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content);
    } catch (err: any) {
      this.logger.error(`Failed to read notifications.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to read notifications storage.');
    }
  }

  public writeNotifications(records: NotificationRecord[]): void {
    try {
      this.ensureDataFile();
      fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Failed to write notifications.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to write notifications storage.');
    }
  }

  async findAll(query?: {
    type?: string;
    status?: string;
    priority?: string;
    search?: string;
  }) {
    let list = this.readNotifications();

    if (query?.type && query.type !== 'all') {
      const t = query.type.toUpperCase();
      list = list.filter((n) => (n.type || '').toUpperCase() === t);
    }

    if (query?.status && query.status !== 'all') {
      const s = query.status.toUpperCase();
      list = list.filter((n) => (n.status || '').toUpperCase() === s);
    }

    if (query?.priority && query.priority !== 'all') {
      const p = query.priority.toUpperCase();
      list = list.filter((n) => (n.priority || '').toUpperCase() === p);
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      list = list.filter(
        (n) =>
          n.id.toLowerCase().includes(q) ||
          n.title.toLowerCase().includes(q) ||
          n.message.toLowerCase().includes(q) ||
          (n.target && n.target.toLowerCase().includes(q)) ||
          n.type.toLowerCase().includes(q),
      );
    }

    return {
      success: true,
      total: list.length,
      unreadCount: list.filter((n) => (n.status || '').toUpperCase() === 'UNREAD').length,
      data: list,
    };
  }

  async findOne(id: string) {
    const list = this.readNotifications();
    const item = list.find((n) => n.id === id || n.id.toLowerCase() === id.toLowerCase());
    if (!item) {
      throw new NotFoundException(`Notification with ID "${id}" not found.`);
    }
    return {
      success: true,
      data: item,
    };
  }

  async create(dto: CreateNotificationDto) {
    if (!dto.message || !dto.message.trim()) {
      throw new BadRequestException('Notification message is required.');
    }

    const nextId = `not-${Date.now()}`;
    const now = new Date().toISOString();
    const cleanTitle = dto.title?.trim() || 'System Alert';

    const newRecord: NotificationRecord = {
      id: nextId,
      title: cleanTitle,
      message: dto.message.trim(),
      type: (dto.type || 'INFO').toUpperCase(),
      status: 'UNREAD',
      priority: (dto.priority || 'MEDIUM').toUpperCase(),
      target: (dto.target || dto.recipient || 'ALL').toUpperCase(),
      createdAt: now,
      readAt: null,
    };

    const list = this.readNotifications();
    list.unshift(newRecord);
    this.writeNotifications(list);

    return {
      success: true,
      message: 'Notification created successfully.',
      data: newRecord,
    };
  }

  async update(id: string, dto: UpdateNotificationDto) {
    const list = this.readNotifications();
    const index = list.findIndex((n) => n.id === id || n.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Notification with ID "${id}" not found.`);
    }

    const existing = list[index];
    const now = new Date().toISOString();
    let readAt = existing.readAt;

    if (dto.status && dto.status.toUpperCase() === 'READ' && !existing.readAt) {
      readAt = now;
    } else if (dto.status && dto.status.toUpperCase() === 'UNREAD') {
      readAt = null;
    }

    const updatedRecord: NotificationRecord = {
      ...existing,
      title: dto.title?.trim() || existing.title,
      message: dto.message?.trim() || existing.message,
      type: dto.type ? dto.type.toUpperCase() : existing.type,
      status: dto.status ? dto.status.toUpperCase() : existing.status,
      priority: dto.priority ? dto.priority.toUpperCase() : existing.priority,
      target: dto.target ? dto.target.toUpperCase() : existing.target,
      readAt,
    };

    list[index] = updatedRecord;
    this.writeNotifications(list);

    return {
      success: true,
      message: 'Notification updated successfully.',
      data: updatedRecord,
    };
  }

  async remove(id: string) {
    const list = this.readNotifications();
    const index = list.findIndex((n) => n.id === id || n.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Notification with ID "${id}" not found.`);
    }

    const removed = list.splice(index, 1)[0];
    this.writeNotifications(list);

    return {
      success: true,
      message: `Notification "${id}" deleted.`,
      data: removed,
    };
  }
}
