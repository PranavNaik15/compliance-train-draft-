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
  PaymentRecord,
  CreatePaymentDto,
  UpdatePaymentDto,
  PaymentStatus,
} from './payments.interface';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly dataDir = path.resolve(process.cwd(), 'data');
  private readonly filePath = path.resolve(process.cwd(), 'data', 'payments.json');
  private readonly ordersFilePath = path.resolve(process.cwd(), 'data', 'orders.json');

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
        this.logger.log(`Created new payments persistent file at ${this.filePath}`);
      }
    } catch (err: any) {
      this.logger.error(`Error ensuring payments file: ${err.message}`);
    }
  }

  public readPayments(): PaymentRecord[] {
    try {
      this.ensureDataFile();
      const content = fs.readFileSync(this.filePath, 'utf-8');
      if (!content || !content.trim()) {
        return [];
      }
      return JSON.parse(content);
    } catch (err: any) {
      this.logger.error(`Failed to read payments.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to read payments storage.');
    }
  }

  public writePayments(records: PaymentRecord[]): void {
    try {
      this.ensureDataFile();
      fs.writeFileSync(this.filePath, JSON.stringify(records, null, 2), 'utf-8');
    } catch (err: any) {
      this.logger.error(`Failed to write payments.json: ${err.message}`);
      throw new InternalServerErrorException('Failed to write payments storage.');
    }
  }

  async findAll(query?: {
    search?: string;
    status?: string;
    paymentMethod?: string;
    orderId?: string;
    userId?: string;
    website?: string;
  }) {
    let list = this.readPayments();

    if (query?.orderId) {
      list = list.filter((p) => p.orderId === query.orderId);
    }

    if (query?.userId) {
      list = list.filter((p) => p.userId === query.userId);
    }

    if (query?.status && query.status !== 'all') {
      const s = query.status.toUpperCase();
      list = list.filter((p) => {
        const pStatus = (p.status || '').toUpperCase();
        if (s === 'SUCCESSFUL' || s === 'SUCCESS') return pStatus === 'SUCCESS' || pStatus === 'SUCCESSFUL';
        return pStatus === s;
      });
    }

    if (query?.paymentMethod && query.paymentMethod !== 'all') {
      const pm = query.paymentMethod.toLowerCase();
      list = list.filter((p) => (p.paymentMethod || p.method || '').toLowerCase().includes(pm));
    }

    if (query?.website && query.website !== 'all') {
      const w = query.website.toUpperCase();
      list = list.filter((p) => {
        const pWeb = (p.website || '').toUpperCase();
        if (w === 'ORIGINAL') return pWeb === 'ORIGINAL' || pWeb === 'BOTH';
        if (w === 'BRIDGE') return pWeb === 'BRIDGE' || pWeb === 'BOTH';
        return pWeb === w;
      });
    }

    if (query?.search && query.search.trim()) {
      const q = query.search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.orderId.toLowerCase().includes(q) ||
          (p.customerName || p.customer || '').toLowerCase().includes(q) ||
          (p.customerEmail || p.email || '').toLowerCase().includes(q) ||
          (p.paymentMethod || p.method || '').toLowerCase().includes(q) ||
          (p.transactionId && p.transactionId.toLowerCase().includes(q)),
      );
    }

    // Sort by createdAt descending
    list.sort((a, b) => new Date(b.createdAt || b.paymentDate).getTime() - new Date(a.createdAt || a.paymentDate).getTime());

    return {
      success: true,
      total: list.length,
      data: list,
    };
  }

  async findOne(id: string) {
    const list = this.readPayments();
    const item = list.find((p) => p.id === id || p.id.toLowerCase() === id.toLowerCase());
    if (!item) {
      throw new NotFoundException(`Payment record with ID "${id}" not found.`);
    }

    return {
      success: true,
      data: item,
    };
  }

  async create(dto: CreatePaymentDto) {
    if (!dto.orderId) {
      throw new BadRequestException('Order ID is required to create a payment record.');
    }

    const list = this.readPayments();
    const nextNum = Math.floor(900 + Math.random() * 9000);
    const id = `PAY-${nextNum}`;
    const now = new Date().toISOString();
    const dateFormatted = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const paymentStatus: PaymentStatus = dto.status || 'PENDING';
    const method = dto.paymentMethod || 'MANUAL';

    const newPayment: PaymentRecord = {
      id,
      orderId: dto.orderId,
      userId: dto.userId || 'USR-ANON',
      customerName: dto.customerName || 'Valued Customer',
      customer: dto.customerName || 'Valued Customer',
      customerEmail: dto.customerEmail || 'customer@compliancetrain.org',
      email: dto.customerEmail || 'customer@compliancetrain.org',
      amount: Number(dto.amount || 0),
      currency: dto.currency || 'USD',
      paymentMethod: method,
      method: method,
      transactionId: dto.transactionId || `tx_${id.toLowerCase()}`,
      paymentDate: dateFormatted,
      date: dateFormatted,
      status: paymentStatus,
      website: (dto.website || 'ORIGINAL').toUpperCase(),
      notes: dto.notes,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newPayment);
    this.writePayments(list);

    return {
      success: true,
      message: 'Payment record created successfully.',
      data: newPayment,
    };
  }

  async update(id: string, dto: UpdatePaymentDto) {
    const list = this.readPayments();
    const index = list.findIndex((p) => p.id === id || p.id.toLowerCase() === id.toLowerCase());
    if (index === -1) {
      throw new NotFoundException(`Payment record with ID "${id}" not found.`);
    }

    const existing = list[index];
    const now = new Date().toISOString();

    const updatedStatus: PaymentStatus = dto.status ? (dto.status.toUpperCase() as PaymentStatus) : existing.status;
    const updatedMethod = dto.paymentMethod || existing.paymentMethod || existing.method;

    const updatedRecord: PaymentRecord = {
      ...existing,
      status: updatedStatus,
      paymentMethod: updatedMethod,
      method: updatedMethod,
      transactionId: dto.transactionId !== undefined ? dto.transactionId : existing.transactionId,
      notes: dto.notes !== undefined ? dto.notes : existing.notes,
      updatedAt: now,
    };

    list[index] = updatedRecord;
    this.writePayments(list);

    // Sync status with associated order if exists
    try {
      if (fs.existsSync(this.ordersFilePath)) {
        const orderContent = fs.readFileSync(this.ordersFilePath, 'utf-8');
        if (orderContent && orderContent.trim()) {
          const orders = JSON.parse(orderContent);
          const orderIdx = orders.findIndex((o: any) => o.id === existing.orderId);
          if (orderIdx >= 0) {
            orders[orderIdx].paymentStatus = updatedStatus;
            if (updatedStatus === 'REFUNDED') {
              orders[orderIdx].status = 'REFUNDED';
            } else if (updatedStatus === 'SUCCESS' && orders[orderIdx].status === 'PENDING') {
              orders[orderIdx].status = 'COMPLETED';
            }
            orders[orderIdx].updatedAt = now;
            fs.writeFileSync(this.ordersFilePath, JSON.stringify(orders, null, 2), 'utf-8');
          }
        }
      }
    } catch (err: any) {
      this.logger.warn(`Could not sync payment status to order: ${err.message}`);
    }

    return {
      success: true,
      message: 'Payment record updated successfully.',
      data: updatedRecord,
    };
  }
}
