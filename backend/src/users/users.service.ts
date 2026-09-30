import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { UserRecord, UpdateUserDto } from './users.interface';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly usersFilePath = path.resolve(process.cwd(), 'data', 'users.json');
  private readonly regsFilePath = path.resolve(process.cwd(), 'data', 'registrations.json');
  private readonly ordersFilePath = path.resolve(process.cwd(), 'data', 'orders.json');

  constructor() {
    this.ensureDataFile();
  }

  private ensureDataFile(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      if (!fs.existsSync(this.usersFilePath)) {
        fs.writeFileSync(this.usersFilePath, '[]', 'utf-8');
      }
    } catch (err: any) {
      this.logger.error(`Failed to initialize users data file: ${err.message}`);
    }
  }

  private readUsers(): UserRecord[] {
    this.ensureDataFile();
    try {
      const content = fs.readFileSync(this.usersFilePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content) as UserRecord[];
    } catch (err: any) {
      this.logger.error(`Error reading ${this.usersFilePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to read users file.');
    }
  }

  private writeUsers(users: UserRecord[]): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Error writing ${this.usersFilePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to write users file.');
    }
  }

  private readRegistrations(): any[] {
    try {
      if (!fs.existsSync(this.regsFilePath)) return [];
      const content = fs.readFileSync(this.regsFilePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  private readOrders(): any[] {
    try {
      if (!fs.existsSync(this.ordersFilePath)) return [];
      const content = fs.readFileSync(this.ordersFilePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content);
    } catch {
      return [];
    }
  }

  async findAll(query?: { search?: string; status?: string }) {
    const users = this.readUsers();
    const registrations = this.readRegistrations();
    const orders = this.readOrders();

    let result = users.map((u) => {
      const userRegs = registrations.filter(
        (r) => r.userId === u.id || (r.email && u.email && r.email.trim().toLowerCase() === u.email.trim().toLowerCase()),
      );
      const userOrders = orders.filter(
        (o) =>
          o.userId === u.id ||
          (o.customerEmail && u.email && o.customerEmail.trim().toLowerCase() === u.email.trim().toLowerCase()) ||
          (o.email && u.email && o.email.trim().toLowerCase() === u.email.trim().toLowerCase()),
      );
      return {
        ...u,
        ordersCount: userOrders.length || userRegs.length,
        registrationsCount: userRegs.length,
      };
    });

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.id.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.organization && u.organization.toLowerCase().includes(q)),
      );
    }

    if (query?.status && query.status !== 'all') {
      result = result.filter((u) => u.status === query.status);
    }

    return {
      success: true,
      total: result.length,
      data: result,
    };
  }

  async findOne(id: string) {
    const users = this.readUsers();
    const user = users.find((u) => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    const registrations = this.readRegistrations();
    const userRegs = registrations.filter(
      (r) => r.userId === id || (r.email && user.email && r.email.trim().toLowerCase() === user.email.trim().toLowerCase()),
    );

    return {
      success: true,
      data: {
        ...user,
        ordersCount: userRegs.length,
        registrationsCount: userRegs.length,
        registrations: userRegs.map((r) => ({
          id: r.id,
          webinarId: r.webinarId,
          webinar: r.webinar || r.webinarTitle,
          date: r.date || r.registeredAt?.slice(0, 10),
          tier: r.tier,
          status: r.status,
          website: r.website,
        })),
      },
    };
  }

  async update(id: string, dto: UpdateUserDto) {
    const users = this.readUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    const existing = users[index];
    const updatedUser: UserRecord = {
      ...existing,
      name: dto.name !== undefined ? dto.name.trim() : existing.name,
      organization: dto.organization !== undefined ? dto.organization.trim() : existing.organization,
      jobRole: dto.jobRole !== undefined ? dto.jobRole.trim() : existing.jobRole,
      membership: dto.membership !== undefined ? dto.membership : existing.membership,
      status: dto.status !== undefined ? dto.status : existing.status,
      updatedAt: new Date().toISOString(),
    };

    users[index] = updatedUser;
    this.writeUsers(users);

    return {
      success: true,
      message: 'User updated successfully.',
      data: updatedUser,
    };
  }
}
