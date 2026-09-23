import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);
  private inMemoryUsers: Map<string, { id: string; name: string; email: string; password_hash: string; created_at: string; updated_at: string }> = new Map();

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    await this.initUsersTable();
  }

  private async initUsersTable() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id VARCHAR(100) PRIMARY KEY,
          name VARCHAR(150) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.db.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_user_email ON users (LOWER(email));
      `);

      this.logger.log('🐘 Users table initialized in PostgreSQL.');
    } catch (err: any) {
      this.logger.warn(`PostgreSQL users table init skipped: ${err.message}. In-memory fallback active.`);
    }
  }

  private getJwtSecret(): string {
    return process.env.JWT_SECRET || 'compliancetrain-jwt-super-secret-key-2026';
  }

  private generateToken(user: SafeUser): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };
    return jwt.sign(payload, this.getJwtSecret(), { expiresIn: '7d' });
  }

  private formatSafeUser(row: any): SafeUser {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      createdAt: row.created_at || row.createdAt,
      updatedAt: row.updated_at || row.updatedAt,
    };
  }

  async register(dto: RegisterDto) {
    const { name, email, password } = dto || {};
    const errors: string[] = [];

    if (!name || typeof name !== 'string' || !name.trim()) {
      errors.push('Full name is required.');
    }

    if (!email || typeof email !== 'string' || !email.trim()) {
      errors.push('Email address is required.');
    } else if (!EMAIL_REGEX.test(email.trim())) {
      errors.push('Please enter a valid email address.');
    }

    if (!password || typeof password !== 'string') {
      errors.push('Password is required.');
    } else if (password.length < 6) {
      errors.push('Password must be at least 6 characters long.');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // 1. Check duplicate email in DB / memory
    try {
      const existingUserResult = await this.db.query(
        'SELECT id FROM users WHERE LOWER(email) = $1',
        [normalizedEmail],
      );

      if (existingUserResult && existingUserResult.rows.length > 0) {
        throw new BadRequestException({
          success: false,
          message: 'An account with this email already exists.',
          errors: ['An account with this email already exists.'],
        });
      }
    } catch (err: any) {
      if (err instanceof BadRequestException) throw err;
      // If DB error, check in-memory
      if (this.inMemoryUsers.has(normalizedEmail)) {
        throw new BadRequestException({
          success: false,
          message: 'An account with this email already exists.',
          errors: ['An account with this email already exists.'],
        });
      }
    }

    // 2. Hash password securely
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const userId = `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    // 3. Store user in DB or in-memory
    let createdUser: SafeUser;

    try {
      const insertResult = await this.db.query(
        `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, email, created_at, updated_at;`,
        [userId, trimmedName, normalizedEmail, passwordHash],
      );

      createdUser = this.formatSafeUser(insertResult.rows[0]);
    } catch (err: any) {
      if (err.code === '23505') {
        throw new BadRequestException({
          success: false,
          message: 'An account with this email already exists.',
          errors: ['An account with this email already exists.'],
        });
      }

      // Fallback in-memory store
      const memUser = {
        id: userId,
        name: trimmedName,
        email: normalizedEmail,
        password_hash: passwordHash,
        created_at: now,
        updated_at: now,
      };
      this.inMemoryUsers.set(normalizedEmail, memUser);
      createdUser = this.formatSafeUser(memUser);
    }

    const token = this.generateToken(createdUser);

    return {
      success: true,
      message: 'Registration successful!',
      user: createdUser,
      token,
    };
  }

  async login(dto: LoginDto) {
    const { email, password } = dto || {};
    const errors: string[] = [];

    if (!email || typeof email !== 'string' || !email.trim()) {
      errors.push('Email is required.');
    }
    if (!password || typeof password !== 'string') {
      errors.push('Password is required.');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Look up user by email
    let userRecord: any = null;

    try {
      const { rows } = await this.db.query(
        'SELECT id, name, email, password_hash, created_at, updated_at FROM users WHERE LOWER(email) = $1',
        [normalizedEmail],
      );
      if (rows && rows.length > 0) {
        userRecord = rows[0];
      }
    } catch (err: any) {
      // In-memory fallback
      userRecord = this.inMemoryUsers.get(normalizedEmail) || null;
    }

    if (!userRecord && this.inMemoryUsers.has(normalizedEmail)) {
      userRecord = this.inMemoryUsers.get(normalizedEmail);
    }

    if (!userRecord) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 2. Verify password against password_hash
    const isPasswordValid = await bcrypt.compare(password, userRecord.password_hash);
    if (!isPasswordValid) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // 3. Return token and safe user
    const safeUser = this.formatSafeUser(userRecord);
    const token = this.generateToken(safeUser);

    return {
      success: true,
      message: 'Login successful!',
      user: safeUser,
      token,
    };
  }

  async getMe(userId: string): Promise<{ success: boolean; user: SafeUser }> {
    if (!userId) {
      throw new UnauthorizedException({
        success: false,
        message: 'User session not found.',
      });
    }

    let userRecord: any = null;

    try {
      const { rows } = await this.db.query(
        'SELECT id, name, email, created_at, updated_at FROM users WHERE id = $1',
        [userId],
      );
      if (rows && rows.length > 0) {
        userRecord = rows[0];
      }
    } catch (err: any) {
      // Look up in-memory by id
      for (const u of this.inMemoryUsers.values()) {
        if (u.id === userId) {
          userRecord = u;
          break;
        }
      }
    }

    if (!userRecord) {
      for (const u of this.inMemoryUsers.values()) {
        if (u.id === userId) {
          userRecord = u;
          break;
        }
      }
    }

    if (!userRecord) {
      throw new UnauthorizedException({
        success: false,
        message: 'User not found.',
      });
    }

    return {
      success: true,
      user: this.formatSafeUser(userRecord),
    };
  }
}
