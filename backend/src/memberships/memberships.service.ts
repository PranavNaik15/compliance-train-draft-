import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { MEMBERSHIP_CATEGORIES, MembershipCategory, MembershipPlan } from '../data/memberships';
import { SubscribeMembershipDto } from './dto/subscribe.dto';

export interface SubscriptionRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  membershipId: string;
  membershipTitle: string;
  planId: string;
  planName: string;
  price: number;
  priceDisplay: string;
  duration: string;
  status: 'active' | 'pending' | 'expired';
  startsAt: string;
  expiresAt: string;
  createdAt: string;
}

@Injectable()
export class MembershipsService implements OnModuleInit {
  private readonly logger = new Logger(MembershipsService.name);
  private inMemorySubscriptions: Map<string, SubscriptionRecord> = new Map();

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    await this.initSubscriptionsTable();
  }

  private async initSubscriptionsTable() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS user_subscriptions (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          user_email VARCHAR(255) NOT NULL,
          user_name VARCHAR(150),
          membership_id VARCHAR(50) NOT NULL,
          membership_type VARCHAR(50) NOT NULL,
          plan_id VARCHAR(50) NOT NULL,
          plan_name VARCHAR(150) NOT NULL,
          price NUMERIC(10, 2) NOT NULL,
          billing_cycle VARCHAR(50) NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          starts_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      this.logger.log('🐘 user_subscriptions table initialized in PostgreSQL.');
    } catch (err: any) {
      this.logger.warn(`PostgreSQL subscriptions table init skipped: ${err.message}. Using in-memory fallback.`);
    }
  }

  /**
   * Return all membership categories and authoritative plans.
   */
  findAll(): { success: boolean; data: MembershipCategory[] } {
    return {
      success: true,
      data: MEMBERSHIP_CATEGORIES,
    };
  }

  /**
   * Return a single membership category by id ('individual' | 'corporate').
   */
  findOne(id: string): { success: boolean; data: MembershipCategory } {
    const normalizedId = (id || '').trim().toLowerCase();
    const category = MEMBERSHIP_CATEGORIES.find(
      (c) => c.id === normalizedId || c.title.toLowerCase().includes(normalizedId),
    );

    if (!category) {
      throw new NotFoundException({
        success: false,
        message: `Membership category "${id}" not found. Available categories: individual, corporate.`,
      });
    }

    return {
      success: true,
      data: category,
    };
  }

  /**
   * Subscribe an authenticated user to a membership plan.
   */
  async subscribe(user: any, dto: SubscribeMembershipDto) {
    if (!user || (!user.sub && !user.id)) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication required to subscribe to a membership plan.',
      });
    }

    const { membershipId, planId } = dto || {};
    const errors: string[] = [];

    if (!membershipId || typeof membershipId !== 'string' || !membershipId.trim()) {
      errors.push('Membership ID is required (e.g. "individual" or "corporate").');
    }
    if (!planId || typeof planId !== 'string' || !planId.trim()) {
      errors.push('Plan ID is required (e.g. "ind-1m", "ind-6m", "ind-1y").');
    }

    if (errors.length > 0) {
      throw new BadRequestException({
        success: false,
        message: 'Validation failed.',
        errors,
      });
    }

    // 1. Validate membership category exists
    const category = MEMBERSHIP_CATEGORIES.find(
      (c) => c.id === membershipId.trim().toLowerCase(),
    );

    if (!category) {
      throw new NotFoundException({
        success: false,
        message: `Invalid membership type "${membershipId}". Available types: individual, corporate.`,
      });
    }

    // 2. Validate plan exists in that category
    const plan = category.plans.find(
      (p) => p.id === planId.trim().toLowerCase(),
    );

    if (!plan) {
      const validPlanIds = category.plans.map((p) => p.id).join(', ');
      throw new BadRequestException({
        success: false,
        message: `Invalid plan "${planId}" for ${category.title}. Available plans: ${validPlanIds}.`,
      });
    }

    // 3. Compute active period
    const userId = user.sub || user.id;
    const userName = user.name || 'Valued Member';
    const userEmail = user.email;

    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + plan.durationMonths);

    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const record: SubscriptionRecord = {
      id: subscriptionId,
      userId,
      userName,
      userEmail,
      membershipId: category.id,
      membershipTitle: category.title,
      planId: plan.id,
      planName: plan.name,
      price: plan.price,
      priceDisplay: plan.priceDisplay,
      duration: plan.duration,
      status: 'active',
      startsAt: startDate.toISOString(),
      expiresAt: expiryDate.toISOString(),
      createdAt: startDate.toISOString(),
    };

    // 4. Save to DB or in-memory
    try {
      await this.db.query(
        `INSERT INTO user_subscriptions (
          id, user_id, user_email, user_name, membership_id, membership_type,
          plan_id, plan_name, price, billing_cycle, status, starts_at, expires_at, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP);`,
        [
          record.id,
          record.userId,
          record.userEmail,
          record.userName,
          record.membershipId,
          category.id,
          record.planId,
          record.planName,
          record.price,
          plan.frequency,
          record.status,
          record.startsAt,
          record.expiresAt,
        ],
      );
    } catch (err: any) {
      this.inMemorySubscriptions.set(record.id, record);
    }

    return {
      success: true,
      message: `Successfully subscribed to ${category.title} (${plan.name})!`,
      subscription: record,
    };
  }
}
