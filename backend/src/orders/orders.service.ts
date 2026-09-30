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
  OrderRecord,
  OrderItem,
  CreateOrderDto,
  UpdateOrderDto,
  OrderStatus,
  PaymentStatus,
} from './orders.interface';
import { PaymentsService } from '../payments/payments.service';

const OPTION_PRICES: Record<string, { title: string; price: number }> = {
  live_single: { title: 'Single Live Attendee', price: 179 },
  live_combo: { title: 'Combo Offer (Live + Recording)', price: 299 },
  live_recording_combo: { title: 'Combo Offer (Live + Recording)', price: 299 },
  recorded_vault: { title: 'Recorded Vault Access + Transcript', price: 159 },
  dvd_live: { title: 'Training DVD + Attend Single Live', price: 349 },
  flash_live: { title: 'Flash Drive + Access Recording + Attend Single Live', price: 399 },
  live_team: { title: 'Team Live Attendance Pass', price: 499 },
};

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly filePath = path.resolve(process.cwd(), 'data', 'orders.json');
  private readonly webinarsFilePath = path.resolve(process.cwd(), 'data', 'webinars.json');
  private readonly plansFilePath = path.resolve(process.cwd(), 'data', 'membership-plans.json');
  private readonly usersFilePath = path.resolve(process.cwd(), 'data', 'users.json');

  constructor(private readonly paymentsService: PaymentsService) {
    this.ensureDataFile();
  }

  private ensureDataFile(): void {
    try {
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }

      if (!fs.existsSync(this.filePath)) {
        fs.writeFileSync(this.filePath, JSON.stringify([], null, 2), 'utf-8');
        this.logger.log(`Created new orders persistent file at ${this.filePath}`);
      }
    } catch (err: any) {
      this.logger.error(`Error ensuring orders file: ${err.message}`);
    }
  }

  public readOrders(): OrderRecord[] {
    try {
      this.ensureDataFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      if (!content || !content.trim()) {
        return [];
      }
      return JSON.parse(content);
    } catch (err: any) {
      this.logger.error(`Failed to read orders.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to read orders storage.');
    }
  }

  public writeOrders(records: OrderRecord[]): void {
    try {
      this.ensureDataFile();
      fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Failed to write orders.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to write orders storage.');
    }
  }

  private readWebinars(): any[] {
    try {
      if (fs.existsSync(this.webinarsFilePath)) {
        const content = fs.readFileSync(this.webinarsFilePath, 'utf-8');
        return content ? JSON.parse(content) : [];
      }
    } catch (err: any) {
      this.logger.warn(`Could not read webinars: ${err.message}`);
    }
    return [];
  }

  private readPlans(): any[] {
    try {
      if (fs.existsSync(this.plansFilePath)) {
        const content = fs.readFileSync(this.plansFilePath, 'utf-8');
        return content ? JSON.parse(content) : [];
      }
    } catch (err: any) {
      this.logger.warn(`Could not read membership plans: ${err.message}`);
    }
    return [];
  }

  private readUsers(): any[] {
    try {
      if (fs.existsSync(this.usersFilePath)) {
        const content = fs.readFileSync(this.usersFilePath, 'utf-8');
        return content ? JSON.parse(content) : [];
      }
    } catch (err: any) {
      this.logger.warn(`Could not read users: ${err.message}`);
    }
    return [];
  }

  /**
   * Resolve authoritative price for a line item from persistent JSON files.
   */
  private resolveAuthoritativeItem(item: any): OrderItem {
    const { productId, productType, optionType } = item;
    const quantity = Math.max(1, Number(item.quantity) || 1);

    const plans = this.readPlans();
    const matchedPlan = plans.find(
      (p) => p.id === productId || p.id.toLowerCase() === (productId || '').toLowerCase(),
    );

    if (matchedPlan || (productType && productType.toUpperCase() === 'MEMBERSHIP')) {
      const plan = matchedPlan || plans[0];
      const unitPrice = plan ? Number(plan.price) : 199;
      return {
        productId: plan ? plan.id : productId,
        productType: 'MEMBERSHIP',
        productName: plan ? plan.name : (item.productName || 'Membership Plan'),
        optionType: plan?.type || 'INDIVIDUAL',
        optionTitle: plan?.duration || '1 Year Access',
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        membershipId: plan?.id,
      };
    }

    // Lookup webinar
    const webinars = this.readWebinars();
    const matchedWebinar = webinars.find(
      (w) => w.id === productId || String(w.id) === String(productId),
    );

    let unitPrice = matchedWebinar ? Number(matchedWebinar.price || 179) : 179;
    let optionTitle = 'Single Live Attendee';
    let type = productType || 'LIVE_WEBINAR';

    if (optionType && OPTION_PRICES[optionType]) {
      unitPrice = OPTION_PRICES[optionType].price;
      optionTitle = OPTION_PRICES[optionType].title;
    } else if (productType === 'RECORDED_WEBINAR' || productType === 'recorded_webinar') {
      unitPrice = 159;
      optionTitle = 'Recorded Vault Access';
      type = 'RECORDED_WEBINAR';
    } else if (productType === 'DVD' || productType === 'dvd') {
      unitPrice = 299;
      optionTitle = 'Training DVD';
      type = 'DVD';
    } else if (productType === 'FLASH_DRIVE' || productType === 'flash_drive') {
      unitPrice = 349;
      optionTitle = 'Flash Drive Shipped';
      type = 'FLASH_DRIVE';
    } else if (matchedWebinar) {
      unitPrice = Number(matchedWebinar.price) || 179;
      optionTitle = 'Standard Registration';
    }

    return {
      productId: matchedWebinar ? matchedWebinar.id : productId,
      productType: type.toUpperCase(),
      productName: matchedWebinar ? matchedWebinar.title : (item.productName || 'Compliance Training Webinar'),
      optionType: optionType || 'live_single',
      optionTitle: item.optionTitle || optionTitle,
      quantity,
      unitPrice,
      totalPrice: unitPrice * quantity,
      webinarId: matchedWebinar?.id,
    };
  }

  async findAll(query?: {
    search?: string;
    status?: string;
    paymentStatus?: string;
    website?: string;
    userId?: string;
  }) {
    let list = this.readOrders();

    if (query?.userId) {
      list = list.filter((o) => o.userId === query.userId);
    }

    if (query?.status && query.status !== 'all') {
      const s = query.status.toUpperCase();
      list = list.filter((o) => (o.status || '').toUpperCase() === s);
    }

    if (query?.paymentStatus && query.paymentStatus !== 'all') {
      const ps = query.paymentStatus.toUpperCase();
      list = list.filter((o) => {
        const pStatus = (o.paymentStatus || '').toUpperCase();
        if (ps === 'SUCCESSFUL' || ps === 'SUCCESS') return pStatus === 'SUCCESS';
        return pStatus === ps;
      });
    }

    if (query?.website && query.website !== 'all') {
      const w = query.website.toUpperCase();
      list = list.filter((o) => {
        const oWeb = (o.website || '').toUpperCase();
        if (w === 'ORIGINAL') return oWeb === 'ORIGINAL' || oWeb === 'BOTH';
        if (w === 'BRIDGE') return oWeb === 'BRIDGE' || oWeb === 'BOTH';
        return oWeb === w;
      });
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.customerName || o.customer || '').toLowerCase().includes(q) ||
          (o.customerEmail || o.email || '').toLowerCase().includes(q) ||
          (o.itemsSummary || '').toLowerCase().includes(q) ||
          (Array.isArray(o.items) &&
            o.items.some((it) => (it.productName || '').toLowerCase().includes(q))),
      );
    }

    // Sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt || b.orderDate).getTime() - new Date(a.createdAt || a.orderDate).getTime());

    return {
      success: true,
      total: list.length,
      data: list,
    };
  }

  async findOne(id: string) {
    const list = this.readOrders();
    const order = list.find((o) => o.id === id || o.id.toLowerCase() === id.toLowerCase());
    if (!order) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }

    // Find linked payments
    const paymentsRes = await this.paymentsService.findAll({ orderId: order.id });

    return {
      success: true,
      data: {
        ...order,
        payments: paymentsRes.data || [],
      },
    };
  }

  async create(dto: CreateOrderDto) {
    if (!dto.items || !Array.isArray(dto.items) || dto.items.length === 0) {
      throw new BadRequestException('At least one order item is required.');
    }

    const authoritativeItems: OrderItem[] = dto.items.map((item) =>
      this.resolveAuthoritativeItem(item),
    );

    const subtotal = authoritativeItems.reduce((acc, it) => acc + it.totalPrice, 0);

    let discount = 0;
    if (dto.discount && Number(dto.discount) > 0) {
      discount = Number(dto.discount);
    } else if (dto.promoCode && dto.promoCode.trim().toUpperCase() === 'COMPLIANCE20') {
      discount = Math.round(subtotal * 0.2);
    }

    const total = Math.max(0, subtotal - discount);

    const now = new Date().toISOString();
    const orderDate = now.slice(0, 10);
    const nextNum = Math.floor(7700 + Math.random() * 2200);
    const orderId = `ORD-${nextNum}`;

    const itemsSummary = authoritativeItems
      .map((it) => `${it.quantity}x ${it.productName}${it.optionTitle ? ` (${it.optionTitle})` : ''}`)
      .join(', ');

    const website = (dto.website || 'ORIGINAL').toUpperCase() as 'ORIGINAL' | 'BRIDGE';

    const newOrder: OrderRecord = {
      id: orderId,
      userId: dto.userId || `USR-${Math.floor(3000 + Math.random() * 6000)}`,
      customerName: dto.customerName || 'Valued Customer',
      customer: dto.customerName || 'Valued Customer',
      customerEmail: dto.customerEmail || 'customer@compliancetrain.org',
      email: dto.customerEmail || 'customer@compliancetrain.org',
      items: authoritativeItems,
      itemsSummary,
      subtotal,
      discount,
      total,
      amount: total,
      currency: 'USD',
      orderDate,
      date: orderDate,
      status: 'PENDING',
      paymentStatus: 'PENDING',
      website,
      notes: dto.notes,
      createdAt: now,
      updatedAt: now,
    };

    const orders = this.readOrders();
    orders.unshift(newOrder);
    this.writeOrders(orders);

    // Create corresponding pending payment record
    try {
      await this.paymentsService.create({
        orderId: newOrder.id,
        userId: newOrder.userId,
        customerName: newOrder.customerName,
        customerEmail: newOrder.customerEmail,
        amount: newOrder.total,
        currency: 'USD',
        paymentMethod: dto.paymentMethod || 'Credit Card (Stripe)',
        status: 'PENDING',
        website: newOrder.website,
        notes: `Auto-generated transaction for ${newOrder.id}`,
      });
    } catch (err: any) {
      this.logger.warn(`Could not create initial payment record: ${err.message}`);
    }

    return {
      success: true,
      message: 'Order created successfully.',
      data: newOrder,
    };
  }

  async update(id: string, dto: UpdateOrderDto) {
    const orders = this.readOrders();
    const index = orders.findIndex((o) => o.id === id || o.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }

    const existing = orders[index];
    const now = new Date().toISOString();

    const updatedStatus: OrderStatus = dto.status
      ? (dto.status.toUpperCase() as OrderStatus)
      : existing.status;

    const updatedPaymentStatus: PaymentStatus = dto.paymentStatus
      ? (dto.paymentStatus.toUpperCase() as PaymentStatus)
      : existing.paymentStatus;

    const updatedOrder: OrderRecord = {
      ...existing,
      status: updatedStatus,
      paymentStatus: updatedPaymentStatus,
      notes: dto.notes !== undefined ? dto.notes : existing.notes,
      updatedAt: now,
    };

    orders[index] = updatedOrder;
    this.writeOrders(orders);

    // If paymentStatus changed, sync corresponding payments in payments.json
    if (dto.paymentStatus) {
      try {
        const paymentsRes = await this.paymentsService.findAll({ orderId: existing.id });
        if (paymentsRes.data && paymentsRes.data.length > 0) {
          for (const p of paymentsRes.data) {
            await this.paymentsService.update(p.id, {
              status: updatedPaymentStatus,
            });
          }
        }
      } catch (err: any) {
        this.logger.warn(`Could not sync payment records for order ${id}: ${err.message}`);
      }
    }

    return {
      success: true,
      message: 'Order updated successfully.',
      data: updatedOrder,
    };
  }

  async remove(id: string) {
    const orders = this.readOrders();
    const index = orders.findIndex((o) => o.id === id || o.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Order with ID "${id}" not found.`);
    }

    const removed = orders.splice(index, 1)[0];
    this.writeOrders(orders);

    return {
      success: true,
      message: `Order "${id}" removed successfully.`,
      data: removed,
    };
  }
}
