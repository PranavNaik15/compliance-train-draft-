import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { SpeakerRecord, CreateSpeakerDto, UpdateSpeakerDto } from './speakers.interface';

@Injectable()
export class SpeakersService {
  private readonly logger = new Logger(SpeakersService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly speakersFilePath = path.resolve(process.cwd(), 'data', 'speakers.json');
  private readonly webinarsFilePath = path.resolve(process.cwd(), 'data', 'webinars.json');

  constructor() {
    this.ensureDataFile();
  }

  private ensureDataFile(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (!fs.existsSync(this.speakersFilePath)) {
        const initialSpeakers: SpeakerRecord[] = [
          {
            id: 'spk-1',
            name: 'Brian L. Tuttle',
            designation: 'Certified HIPAA Consultant, CHP, CBRA, CCVO',
            organization: 'InGauge Healthcare Solutions',
            bio: 'Brian is a nationally renowned compliance consultant with 20+ years specializing in HIPAA, SAMHSA, and OCR audit defense.',
            photo: '/speaker-brian.jpg',
            profileLink: 'https://linkedin.com',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'spk-2',
            name: 'Dr. Evelyn Martinez',
            designation: 'Chief Health Informatics & Privacy Officer',
            organization: 'Apex Health Systems',
            bio: 'Specialist in clinical workflow data governance, modern AI integration standards, and SAMHSA Part 2 consent architectures.',
            photo: '/hero-executive.jpg',
            profileLink: 'https://linkedin.com',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'spk-3',
            name: 'Marcus Sterling, JD, CHC',
            designation: 'Healthcare Regulatory Counsel',
            organization: 'Sterling & Partners Law',
            bio: 'Former HHS/OCR enforcement attorney advising hospital systems on breach litigation, corrective action plans, and regulatory settlements.',
            photo: '/hero-executive.jpg',
            profileLink: 'https://linkedin.com',
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
        fs.writeFileSync(this.speakersFilePath, JSON.stringify(initialSpeakers, null, 2), 'utf-8');
        this.logger.log(`Initialized persistent speakers storage at ${this.speakersFilePath}`);
      }
    } catch (err: any) {
      this.logger.error(`Failed to initialize speakers data file: ${err.message}`);
    }
  }

  private readSpeakers(): SpeakerRecord[] {
    this.ensureDataFile();
    try {
      const content = fs.readFileSync(this.speakersFilePath, 'utf-8');
      if (!content || !content.trim()) {
        return [];
      }
      return JSON.parse(content) as SpeakerRecord[];
    } catch (err: any) {
      this.logger.error(`Error reading ${this.speakersFilePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to read speakers data file.');
    }
  }

  private writeSpeakers(speakers: SpeakerRecord[]): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.speakersFilePath, JSON.stringify(speakers, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Error writing ${this.speakersFilePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to write speakers data file.');
    }
  }

  private readWebinars(): any[] {
    try {
      if (!fs.existsSync(this.webinarsFilePath)) {
        return [];
      }
      const content = fs.readFileSync(this.webinarsFilePath, 'utf-8');
      if (!content || !content.trim()) {
        return [];
      }
      return JSON.parse(content);
    } catch (err: any) {
      this.logger.warn(`Could not read webinars file: ${err.message}`);
      return [];
    }
  }

  private countWebinarsForSpeaker(speakerId: string, speakerName: string, webinars: any[]): number {
    return webinars.filter((w) => {
      if (w.speakerId && w.speakerId === speakerId) return true;
      if (w.speaker?.id && w.speaker.id === speakerId) return true;
      if (w.speaker?.name && speakerName && w.speaker.name.trim().toLowerCase() === speakerName.trim().toLowerCase()) return true;
      return false;
    }).length;
  }

  async findAll(query?: { search?: string; status?: string }) {
    const speakers = this.readSpeakers();
    const webinars = this.readWebinars();

    let result = speakers.map((s) => ({
      ...s,
      webinarCount: this.countWebinarsForSpeaker(s.id, s.name, webinars),
    }));

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.designation?.toLowerCase().includes(q) ||
          s.organization?.toLowerCase().includes(q) ||
          s.bio?.toLowerCase().includes(q),
      );
    }

    if (query?.status && query.status !== 'all') {
      result = result.filter((s) => s.status === query.status);
    }

    return {
      success: true,
      count: result.length,
      data: result,
    };
  }

  async findOne(id: string) {
    const speakers = this.readSpeakers();
    const speaker = speakers.find((s) => s.id === id);
    if (!speaker) {
      throw new NotFoundException(`Speaker with ID "${id}" not found.`);
    }

    const webinars = this.readWebinars();
    const assignedWebinars = webinars.filter(
      (w) =>
        w.speakerId === id ||
        w.speaker?.id === id ||
        (w.speaker?.name && w.speaker.name.trim().toLowerCase() === speaker.name.trim().toLowerCase()),
    );

    return {
      success: true,
      data: {
        ...speaker,
        webinarCount: assignedWebinars.length,
        assignedWebinars: assignedWebinars.map((w) => ({
          id: w.id,
          title: w.title,
          date: w.date,
          status: w.status,
          websiteVisibility: w.websiteVisibility,
        })),
      },
    };
  }

  async create(dto: CreateSpeakerDto) {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('Speaker name is required.');
    }
    if (!dto.designation || !dto.designation.trim()) {
      throw new BadRequestException('Speaker designation is required.');
    }
    if (!dto.organization || !dto.organization.trim()) {
      throw new BadRequestException('Speaker organization is required.');
    }

    const speakers = this.readSpeakers();
    const id = `spk-${Date.now()}`;
    const now = new Date().toISOString();

    const newSpeaker: SpeakerRecord = {
      id,
      name: dto.name.trim(),
      designation: dto.designation.trim(),
      organization: dto.organization.trim(),
      bio: dto.bio?.trim() || '',
      photo: dto.photo?.trim() || '/speaker-brian.jpg',
      profileLink: dto.profileLink?.trim() || '',
      status: dto.status || 'active',
      createdAt: now,
      updatedAt: now,
    };

    speakers.unshift(newSpeaker);
    this.writeSpeakers(speakers);

    return {
      success: true,
      message: 'Speaker created successfully.',
      data: {
        ...newSpeaker,
        webinarCount: 0,
      },
    };
  }

  async update(id: string, dto: UpdateSpeakerDto) {
    const speakers = this.readSpeakers();
    const index = speakers.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Speaker with ID "${id}" not found.`);
    }

    const existing = speakers[index];
    const updatedSpeaker: SpeakerRecord = {
      ...existing,
      name: dto.name !== undefined ? dto.name.trim() : existing.name,
      designation: dto.designation !== undefined ? dto.designation.trim() : existing.designation,
      organization: dto.organization !== undefined ? dto.organization.trim() : existing.organization,
      bio: dto.bio !== undefined ? dto.bio.trim() : existing.bio,
      photo: dto.photo !== undefined ? dto.photo.trim() : existing.photo,
      profileLink: dto.profileLink !== undefined ? dto.profileLink.trim() : existing.profileLink,
      status: dto.status !== undefined ? dto.status : existing.status,
      updatedAt: new Date().toISOString(),
    };

    speakers[index] = updatedSpeaker;
    this.writeSpeakers(speakers);

    // Sync updated speaker info into referencing webinars in webinars.json
    try {
      const webinars = this.readWebinars();
      let webinarsUpdated = false;
      const syncedWebinars = webinars.map((w) => {
        const isMatched =
          w.speakerId === id ||
          w.speaker?.id === id ||
          (w.speaker?.name && existing.name && w.speaker.name.trim().toLowerCase() === existing.name.trim().toLowerCase());

        if (isMatched) {
          webinarsUpdated = true;
          return {
            ...w,
            speakerId: id,
            speaker: {
              ...w.speaker,
              id,
              name: updatedSpeaker.name,
              role: updatedSpeaker.designation,
              company: updatedSpeaker.organization,
              bio: updatedSpeaker.bio || w.speaker?.bio,
              avatarUrl: updatedSpeaker.photo || w.speaker?.avatarUrl,
            },
          };
        }
        return w;
      });

      if (webinarsUpdated) {
        fs.writeFileSync(this.webinarsFilePath, JSON.stringify(syncedWebinars, null, 2), 'utf-8');
      }
    } catch (syncErr: any) {
      this.logger.warn(`Failed to sync webinars for speaker ${id}: ${syncErr.message}`);
    }

    const webinars = this.readWebinars();
    const count = this.countWebinarsForSpeaker(id, updatedSpeaker.name, webinars);

    return {
      success: true,
      message: 'Speaker updated successfully.',
      data: {
        ...updatedSpeaker,
        webinarCount: count,
      },
    };
  }

  async remove(id: string) {
    const speakers = this.readSpeakers();
    const speaker = speakers.find((s) => s.id === id);
    if (!speaker) {
      throw new NotFoundException(`Speaker with ID "${id}" not found.`);
    }

    // Check if speaker is assigned to any webinars
    const webinars = this.readWebinars();
    const assignedWebinars = webinars.filter((w) => {
      if (w.speakerId && w.speakerId === id) return true;
      if (w.speaker?.id && w.speaker.id === id) return true;
      if (w.speaker?.name && speaker.name && w.speaker.name.trim().toLowerCase() === speaker.name.trim().toLowerCase()) return true;
      return false;
    });

    if (assignedWebinars.length > 0) {
      const webinarTitles = assignedWebinars.slice(0, 3).map((w) => `"${w.title}"`).join(', ');
      const moreCount = assignedWebinars.length > 3 ? ` and ${assignedWebinars.length - 3} more` : '';
      throw new BadRequestException(
        `This speaker is currently assigned to ${assignedWebinars.length} webinar(s) (${webinarTitles}${moreCount}). Please reassign those webinars before deleting this speaker.`
      );
    }

    const filtered = speakers.filter((s) => s.id !== id);
    this.writeSpeakers(filtered);

    return {
      success: true,
      message: 'Speaker deleted successfully.',
      data: { id },
    };
  }
}
