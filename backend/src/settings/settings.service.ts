import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { PlatformSettings, UpdateSettingsDto } from './settings.interface';

@Injectable()
export class SettingsService {
  private readonly logger = new Logger(SettingsService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly filePath = path.resolve(process.cwd(), 'data', 'settings.json');

  private readonly defaultSettings: PlatformSettings = {
    general: {
      siteName: 'ComplianceTrain Healthcare Learning Network',
      adminFullName: 'System Administrator',
      adminEmail: 'admin@compliancetrain.internal',
      supportEmail: 'contactus@compliancetrain.com',
      supportPhone: '+1-888-222-5917',
      defaultCurrency: 'USD',
      timezone: 'EDT',
      dateFormat: 'YYYY-MM-DD',
    },
    website: {
      originalEnabled: true,
      bridgeEnabled: true,
      originalUrl: 'http://localhost:5173',
      bridgeUrl: 'http://localhost:5174',
      backendApiUrl: 'http://localhost:5001/api',
    },
    notifications: {
      emailNotificationsEnabled: true,
      adminNotificationsEnabled: true,
      notifyNewRegistration: true,
      notifyNewSupportTicket: true,
      notifyNewOnsiteTraining: true,
      notifyNewOrder: true,
    },
    system: {
      maintenanceMode: false,
      defaultPaginationSize: 10,
      sessionTimeoutMinutes: 60,
    },
    updatedAt: new Date().toISOString(),
  };

  constructor() {
    this.ensureDataFile();
  }

  private ensureDataFile(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify(this.defaultSettings, null, 2), 'utf-8');
        this.logger.log(`Created new settings storage at ${this.filePath}`);
      }
    } catch (err: any) {
      this.logger.error(`Error ensuring settings file: ${err.message}`);
    }
  }

  public readSettings(): PlatformSettings {
    try {
      this.ensureDataFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      if (!content || !content.trim()) return this.defaultSettings;
      const parsed = JSON.parse(content);
      return {
        general: { ...this.defaultSettings.general, ...(parsed.general || {}) },
        website: { ...this.defaultSettings.website, ...(parsed.website || {}) },
        notifications: { ...this.defaultSettings.notifications, ...(parsed.notifications || {}) },
        system: { ...this.defaultSettings.system, ...(parsed.system || {}) },
        updatedAt: parsed.updatedAt || new Date().toISOString(),
      };
    } catch (err: any) {
      this.logger.error(`Failed to read settings.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to read platform settings.');
    }
  }

  public writeSettings(settings: PlatformSettings): void {
    try {
      this.ensureDataFile();
      fs.writeFileSync(this.filePath, JSON.stringify(settings, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Failed to write settings.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to write platform settings.');
    }
  }

  getSettings(): { success: boolean; data: PlatformSettings } {
    const settings = this.readSettings();
    return {
      success: true,
      data: settings,
    };
  }

  updateSettings(dto: UpdateSettingsDto): { success: boolean; message: string; data: PlatformSettings } {
    if (!dto || typeof dto !== 'object') {
      throw new BadRequestException('Settings payload must be a valid object.');
    }

    const current = this.readSettings();
    const now = new Date().toISOString();

    const updated: PlatformSettings = {
      general: {
        ...current.general,
        ...(dto.general || {}),
      },
      website: {
        ...current.website,
        ...(dto.website || {}),
      },
      notifications: {
        ...current.notifications,
        ...(dto.notifications || {}),
      },
      system: {
        ...current.system,
        ...(dto.system || {}),
      },
      updatedAt: now,
    };

    // Validation
    if (dto.general?.supportEmail && !dto.general.supportEmail.includes('@')) {
      throw new BadRequestException('Invalid support email address.');
    }

    this.writeSettings(updated);

    return {
      success: true,
      message: 'Platform settings updated and persisted successfully.',
      data: updated,
    };
  }
}
