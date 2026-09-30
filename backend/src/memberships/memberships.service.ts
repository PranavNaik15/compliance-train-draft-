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
  MembershipPlanRecord,
  CreateMembershipPlanDto,
  UpdateMembershipPlanDto,
  MembershipSubscriptionRecord,
  UpdateSubscriptionDto,
} from './memberships.interface';

@Injectable()
export class MembershipsService {
  private readonly logger = new Logger(MembershipsService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly plansFilePath = path.resolve(process.cwd(), 'data', 'membership-plans.json');
  private readonly subsFilePath = path.resolve(process.cwd(), 'data', 'memberships.json');
  private readonly usersFilePath = path.resolve(process.cwd(), 'data', 'users.json');

  constructor() {
    this.ensureDataFiles();
  }

  private ensureDataFiles(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (!fs.existsSync(this.plansFilePath)) {
        fs.writeFileSync(this.plansFilePath, '[]', 'utf-8');
      }

      if (!fs.existsSync(this.subsFilePath)) {
        fs.writeFileSync(this.subsFilePath, '[]', 'utf-8');
      }
    } catch (err: any) {
      this.logger.error(`Failed to initialize membership data files: ${err.message}`);
    }
  }

  private readPlans(): MembershipPlanRecord[] {
    this.ensureDataFiles();
    try {
      const content = fs.readFileSync(this.plansFilePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content) as MembershipPlanRecord[];
    } catch (err: any) {
      this.logger.error(`Error reading ${this.plansFilePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to read membership plans storage.');
    }
  }

  private writePlans(plans: MembershipPlanRecord[]): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.plansFilePath, JSON.stringify(plans, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Error writing ${this.plansFilePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to write membership plans storage.');
    }
  }

  private readSubscriptions(): MembershipSubscriptionRecord[] {
    this.ensureDataFiles();
    try {
      const content = fs.readFileSync(this.subsFilePath, 'utf-8');
      if (!content || !content.trim()) return [];
      return JSON.parse(content) as MembershipSubscriptionRecord[];
    } catch (err: any) {
      this.logger.error(`Error reading ${this.subsFilePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to read memberships storage.');
    }
  }

  private writeSubscriptions(subs: MembershipSubscriptionRecord[]): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      fs.writeFileSync(this.subsFilePath, JSON.stringify(subs, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Error writing ${this.subsFilePath}: ${err.message}`);
      throw new InternalServerErrorException('Failed to write memberships storage.');
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
      this.logger.warn(`Failed to update users file: ${err.message}`);
    }
  }

  private calculateMonths(duration: string, durationMonths?: number): number {
    if (durationMonths && durationMonths > 0) return durationMonths;
    const lower = (duration || '').toLowerCase();
    if (lower.includes('1 year') || lower.includes('12 month') || lower.includes('annual')) return 12;
    if (lower.includes('6 month') || lower.includes('semi')) return 6;
    if (lower.includes('1 month') || lower.includes('monthly')) return 1;
    if (lower.includes('3 month') || lower.includes('quarter')) return 3;
    const match = lower.match(/\d+/);
    return match ? parseInt(match[0], 10) : 1;
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  // ==========================================
  // MEMBERSHIP PLANS MANAGEMENT
  // ==========================================

  async findAllPlans(query?: { search?: string; type?: string; status?: string }) {
    const plans = this.readPlans();
    const subs = this.readSubscriptions();

    let result = plans.map((p) => {
      const activeCount = subs.filter((s) => s.planId === p.id && s.status === 'ACTIVE').length;
      return {
        ...p,
        activeSubscribersCount: activeCount,
      };
    });

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.type.toLowerCase().includes(q),
      );
    }

    if (query?.type && query.type !== 'all') {
      result = result.filter((p) => p.type.toUpperCase() === query.type.toUpperCase());
    }

    if (query?.status && query.status !== 'all') {
      result = result.filter((p) => p.status.toUpperCase() === query.status.toUpperCase());
    }

    return {
      success: true,
      count: result.length,
      data: result,
    };
  }

  async findOnePlan(id: string) {
    const plans = this.readPlans();
    const plan = plans.find((p) => p.id === id || p.id.toLowerCase() === id.toLowerCase());
    if (!plan) {
      throw new NotFoundException(`Membership plan with ID "${id}" not found.`);
    }

    const subs = this.readSubscriptions();
    const planSubs = subs.filter((s) => s.planId === plan.id);

    return {
      success: true,
      data: {
        ...plan,
        subscriptionsCount: planSubs.length,
        activeSubscriptionsCount: planSubs.filter((s) => s.status === 'ACTIVE').length,
      },
    };
  }

  async createPlan(dto: CreateMembershipPlanDto) {
    if (!dto.name || !dto.name.trim()) {
      throw new BadRequestException('Plan name is required.');
    }
    if (dto.price === undefined || dto.price === null || isNaN(Number(dto.price)) || Number(dto.price) < 0) {
      throw new BadRequestException('Valid positive price is required.');
    }
    if (!dto.duration || !dto.duration.trim()) {
      throw new BadRequestException('Plan duration is required.');
    }

    const typeUpper = (dto.type || 'INDIVIDUAL').toUpperCase() as 'INDIVIDUAL' | 'CORPORATE';
    if (typeUpper !== 'INDIVIDUAL' && typeUpper !== 'CORPORATE') {
      throw new BadRequestException('Plan type must be either "INDIVIDUAL" or "CORPORATE".');
    }

    const durationMonths = this.calculateMonths(dto.duration, dto.durationMonths);
    const plans = this.readPlans();

    const slug = dto.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 20);

    const id = `${typeUpper === 'CORPORATE' ? 'corp' : 'ind'}-${slug || Date.now()}`;
    const now = new Date().toISOString();

    const newPlan: MembershipPlanRecord = {
      id,
      name: dto.name.trim(),
      type: typeUpper,
      price: Number(dto.price),
      duration: dto.duration.trim(),
      durationMonths,
      durationUnit: dto.durationUnit || (durationMonths === 12 ? 'year' : 'months'),
      description: dto.description?.trim() || `${dto.name} healthcare compliance training plan.`,
      status: (dto.status || 'ACTIVE').toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      isBestValue: Boolean(dto.isBestValue),
      features: Array.isArray(dto.features) ? dto.features : [
        'Full access to live and recorded webinars during subscription',
        'CEU certification and verifiable completion records',
        'Downloadable slide decks and compliance guides',
        'Standard customer & technical support',
      ],
      seats: dto.seats || (typeUpper === 'CORPORATE' ? 'Up to 5 team members' : undefined),
      createdAt: now,
      updatedAt: now,
    };

    plans.push(newPlan);
    this.writePlans(plans);

    return {
      success: true,
      message: 'Membership plan created successfully.',
      data: newPlan,
    };
  }

  async updatePlan(id: string, dto: UpdateMembershipPlanDto) {
    const plans = this.readPlans();
    const index = plans.findIndex((p) => p.id === id || p.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Membership plan with ID "${id}" not found.`);
    }

    const existing = plans[index];

    let typeUpper = existing.type;
    if (dto.type) {
      const t = dto.type.toUpperCase() as 'INDIVIDUAL' | 'CORPORATE';
      if (t === 'INDIVIDUAL' || t === 'CORPORATE') {
        typeUpper = t;
      }
    }

    let durationMonths = existing.durationMonths;
    if (dto.duration || dto.durationMonths) {
      durationMonths = this.calculateMonths(dto.duration || existing.duration, dto.durationMonths);
    }

    const updatedPlan: MembershipPlanRecord = {
      ...existing,
      name: dto.name !== undefined ? dto.name.trim() : existing.name,
      type: typeUpper,
      price: dto.price !== undefined ? Number(dto.price) : existing.price,
      duration: dto.duration !== undefined ? dto.duration.trim() : existing.duration,
      durationMonths,
      durationUnit: dto.durationUnit !== undefined ? dto.durationUnit : existing.durationUnit,
      description: dto.description !== undefined ? dto.description.trim() : existing.description,
      status: dto.status !== undefined ? (dto.status.toUpperCase() === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE') : existing.status,
      isBestValue: dto.isBestValue !== undefined ? Boolean(dto.isBestValue) : existing.isBestValue,
      features: dto.features !== undefined ? dto.features : existing.features,
      seats: dto.seats !== undefined ? dto.seats : existing.seats,
      updatedAt: new Date().toISOString(),
    };

    plans[index] = updatedPlan;
    this.writePlans(plans);

    return {
      success: true,
      message: 'Membership plan updated successfully.',
      data: updatedPlan,
    };
  }

  async deletePlan(id: string) {
    const plans = this.readPlans();
    const index = plans.findIndex((p) => p.id === id || p.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Membership plan with ID "${id}" not found.`);
    }

    const plan = plans[index];
    const subs = this.readSubscriptions();
    const activeAssignedSubs = subs.filter((s) => s.planId === plan.id && s.status === 'ACTIVE');

    if (activeAssignedSubs.length > 0) {
      throw new BadRequestException(
        `Cannot delete plan "${plan.name}": Currently active on ${activeAssignedSubs.length} member subscription(s). Please deactivate the plan instead.`
      );
    }

    plans.splice(index, 1);
    this.writePlans(plans);

    return {
      success: true,
      message: `Membership plan "${plan.name}" deleted successfully.`,
      data: { id },
    };
  }

  // ==========================================
  // PUBLIC WEBSITE CATEGORIZED PLANS
  // ==========================================

  getCategoriesWithPlans() {
    const allPlans = this.readPlans();
    const activePlans = allPlans.filter((p) => p.status === 'ACTIVE');

    const indPlans = activePlans
      .filter((p) => p.type === 'INDIVIDUAL')
      .map((p) => ({
        id: p.id,
        name: p.name,
        duration: p.duration,
        durationMonths: p.durationMonths,
        price: p.price,
        priceDisplay: `$${p.price.toLocaleString()}`,
        frequency: p.durationMonths === 1 ? '/ month' : p.durationMonths === 6 ? '/ 6 months' : '/ year',
        effectiveRate: p.durationMonths === 12 ? `$${Math.round(p.price / 12)}/month when billed annually` : p.durationMonths === 6 ? `$${Math.round(p.price / 6)}/month when billed semi-annually` : null,
        isBestValue: Boolean(p.isBestValue),
        description: p.description,
        features: p.features || [],
      }));

    const corpPlans = activePlans
      .filter((p) => p.type === 'CORPORATE')
      .map((p) => ({
        id: p.id,
        name: p.name,
        duration: p.duration,
        durationMonths: p.durationMonths,
        price: p.price,
        priceDisplay: `$${p.price.toLocaleString()}`,
        frequency: p.durationMonths === 1 ? '/ month' : p.durationMonths === 6 ? '/ 6 months' : '/ year',
        effectiveRate: p.durationMonths === 12 ? `$${Math.round(p.price / 12)}/month when billed annually` : p.durationMonths === 6 ? `$${Math.round(p.price / 6)}/month when billed semi-annually` : null,
        isBestValue: Boolean(p.isBestValue),
        seats: p.seats || 'Up to 10 team members',
        description: p.description,
        features: p.features || [],
      }));

    return {
      success: true,
      data: [
        {
          id: 'individual',
          title: 'Individual Membership',
          tagline: 'Personal Professional Education & Compliance Certification',
          description: 'Designed for healthcare practitioners, practice managers, compliance officers, and medical billers who require ongoing CEU training and regulatory updates.',
          plans: indPlans,
        },
        {
          id: 'corporate',
          title: 'Corporate Membership',
          tagline: 'Organization-Wide Healthcare Compliance & Staff Training Solutions',
          description: 'Custom training packages designed for healthcare systems, hospitals, multi-specialty clinics, and business associates requiring scalable staff certification.',
          plans: corpPlans,
        },
      ],
    };
  }

  // ==========================================
  // MEMBER SUBSCRIPTIONS MANAGEMENT
  // ==========================================

  async findAllSubscriptions(query?: { search?: string; type?: string; status?: string; planId?: string; userId?: string }) {
    const subs = this.readSubscriptions();
    const todayStr = new Date().toISOString().slice(0, 10);

    let result = subs.map((s) => {
      // Auto check expiration for display
      let status = s.status;
      if (status === 'ACTIVE' && s.expiryDate && s.expiryDate < todayStr) {
        status = 'EXPIRED';
      }
      return {
        ...s,
        status,
      };
    });

    if (query?.search) {
      const q = query.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.userName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.planName.toLowerCase().includes(q),
      );
    }

    if (query?.type && query.type !== 'all') {
      result = result.filter((s) => s.membershipType.toUpperCase() === query.type.toUpperCase());
    }

    if (query?.status && query.status !== 'all') {
      result = result.filter((s) => s.status.toUpperCase() === query.status.toUpperCase());
    }

    if (query?.planId) {
      result = result.filter((s) => s.planId === query.planId);
    }

    if (query?.userId) {
      result = result.filter((s) => s.userId === query.userId);
    }

    return {
      success: true,
      total: result.length,
      data: result,
    };
  }

  async findOneSubscription(id: string) {
    const subs = this.readSubscriptions();
    const sub = subs.find((s) => s.id === id);
    if (!sub) {
      throw new NotFoundException(`Subscription with ID "${id}" not found.`);
    }

    const plans = this.readPlans();
    const plan = plans.find((p) => p.id === sub.planId);

    return {
      success: true,
      data: {
        ...sub,
        planDetails: plan || null,
      },
    };
  }

  async subscribe(user: any, dto: { membershipId?: string; planId: string; website?: string }) {
    if (!dto || !dto.planId) {
      throw new BadRequestException('Plan ID is required.');
    }

    const plans = this.readPlans();
    const plan = plans.find((p) => p.id === dto.planId || p.id.toLowerCase() === dto.planId.toLowerCase());

    if (!plan) {
      throw new NotFoundException(`Membership plan "${dto.planId}" not found.`);
    }

    const userId = user?.sub || user?.id || `USR-${Math.floor(1000 + Math.random() * 9000)}`;
    const userName = user?.name || 'Valued Member';
    const userEmail = user?.email || 'member@compliancetrain.org';

    const startDateObj = new Date();
    const expiryDateObj = this.addMonths(startDateObj, plan.durationMonths);

    const startDate = startDateObj.toISOString().slice(0, 10);
    const expiryDate = expiryDateObj.toISOString().slice(0, 10);
    const now = new Date().toISOString();

    const subId = `MEM-${Math.floor(500 + Math.random() * 4500)}`;

    const newSub: MembershipSubscriptionRecord = {
      id: subId,
      userId,
      userName,
      email: userEmail,
      planId: plan.id,
      planName: plan.name,
      membershipType: plan.type,
      price: plan.price,
      startDate,
      expiryDate,
      status: 'ACTIVE',
      website: dto.website || 'ORIGINAL',
      createdAt: now,
      updatedAt: now,
    };

    const subs = this.readSubscriptions();
    subs.unshift(newSub);
    this.writeSubscriptions(subs);

    // Sync user membership in users.json
    try {
      const users = this.readUsers();
      const uIndex = users.findIndex((u) => u.id === userId || (u.email && u.email.toLowerCase() === userEmail.toLowerCase()));
      if (uIndex >= 0) {
        users[uIndex] = {
          ...users[uIndex],
          membership: plan.name,
          status: 'active',
          updatedAt: now,
        };
        this.writeUsers(users);
      }
    } catch (err: any) {
      this.logger.warn(`Could not sync user membership: ${err.message}`);
    }

    return {
      success: true,
      message: `Successfully subscribed to ${plan.name}!`,
      data: newSub,
      subscription: newSub,
    };
  }

  async updateSubscription(id: string, dto: UpdateSubscriptionDto) {
    const subs = this.readSubscriptions();
    const index = subs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Subscription with ID "${id}" not found.`);
    }

    const existing = subs[index];
    const now = new Date().toISOString();

    let planId = existing.planId;
    let planName = existing.planName;
    let membershipType = existing.membershipType;
    let price = existing.price;

    if (dto.planId && dto.planId !== existing.planId) {
      const plans = this.readPlans();
      const newPlan = plans.find((p) => p.id === dto.planId || p.id.toLowerCase() === dto.planId.toLowerCase());
      if (newPlan) {
        planId = newPlan.id;
        planName = newPlan.name;
        membershipType = newPlan.type;
        price = newPlan.price;
      }
    }

    let finalExpiryDate = existing.expiryDate;
    if (dto.extendMonths && Number(dto.extendMonths) > 0) {
      const baseDate = new Date(existing.expiryDate);
      const effectiveBase = isNaN(baseDate.getTime()) ? new Date() : baseDate;
      finalExpiryDate = this.addMonths(effectiveBase, Number(dto.extendMonths)).toISOString().slice(0, 10);
    } else if (dto.expiryDate) {
      finalExpiryDate = dto.expiryDate;
    }

    const updatedSub: MembershipSubscriptionRecord = {
      ...existing,
      planId,
      planName,
      membershipType,
      price,
      startDate: dto.startDate || existing.startDate,
      expiryDate: finalExpiryDate,
      status: dto.status || existing.status,
      updatedAt: now,
    };


    subs[index] = updatedSub;
    this.writeSubscriptions(subs);

    // Update user's membership in users.json
    try {
      const users = this.readUsers();
      const uIndex = users.findIndex((u) => u.id === existing.userId || (u.email && u.email.toLowerCase() === existing.email.toLowerCase()));
      if (uIndex >= 0) {
        users[uIndex] = {
          ...users[uIndex],
          membership: updatedSub.status === 'ACTIVE' ? planName : 'None (Expired/Cancelled)',
          updatedAt: now,
        };
        this.writeUsers(users);
      }
    } catch (err: any) {
      this.logger.warn(`Could not sync user membership on update: ${err.message}`);
    }

    return {
      success: true,
      message: 'Subscription updated successfully.',
      data: updatedSub,
    };
  }

  async removeSubscription(id: string) {
    const subs = this.readSubscriptions();
    const index = subs.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Subscription with ID "${id}" not found.`);
    }

    subs.splice(index, 1);
    this.writeSubscriptions(subs);

    return {
      success: true,
      message: 'Subscription deleted successfully.',
      data: { id },
    };
  }
}
