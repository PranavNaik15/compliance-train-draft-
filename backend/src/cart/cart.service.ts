import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { webinars as mockWebinars } from '../data/webinars';
import { MEMBERSHIP_CATEGORIES } from '../data/memberships';
import { AddCartItemDto } from './dto/add-cart-item.dto';

export interface CartItem {
  id: string;
  userId: string;
  itemType: 'live_webinar' | 'recorded_webinar' | 'dvd' | 'flash_drive' | 'membership';
  productId: string;
  productTitle: string;
  optionType?: string;
  optionTitle?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  webinarId?: string;
  membershipId?: string;
  speakerName?: string;
  date?: string;
  time?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  success: boolean;
  itemCount: number;
  subtotal: number;
  discount: number;
  total: number;
  items: CartItem[];
}

const ALLOWED_ITEM_TYPES = [
  'live_webinar',
  'recorded_webinar',
  'dvd',
  'flash_drive',
  'membership',
];

const STANDARD_OPTION_PRICES: Record<string, { title: string; price: number }> = {
  live_single: { title: 'Single Live Attendee', price: 199 },
  live_recording_combo: { title: 'Combo Offer (Live + Recording)', price: 299 },
  dvd_live: { title: 'Training DVD + Attend Single Live', price: 349 },
  flash_live: { title: 'Flash Drive + Access Recording + Attend Single Live', price: 399 },
};

@Injectable()
export class CartService implements OnModuleInit {
  private readonly logger = new Logger(CartService.name);
  private inMemoryCart: Map<string, CartItem[]> = new Map();

  constructor(private readonly db: DatabaseService) {}

  async onModuleInit() {
    await this.initCartTable();
  }

  private async initCartTable() {
    try {
      await this.db.query(`
        CREATE TABLE IF NOT EXISTS cart_items (
          id VARCHAR(100) PRIMARY KEY,
          user_id VARCHAR(100) NOT NULL,
          item_type VARCHAR(50) NOT NULL,
          product_id VARCHAR(100) NOT NULL,
          product_title VARCHAR(255) NOT NULL,
          option_type VARCHAR(100),
          option_title VARCHAR(255),
          quantity INTEGER NOT NULL DEFAULT 1,
          unit_price NUMERIC(10, 2) NOT NULL,
          total_price NUMERIC(10, 2) NOT NULL,
          webinar_id VARCHAR(50),
          membership_id VARCHAR(50),
          speaker_name VARCHAR(150),
          date VARCHAR(100),
          time VARCHAR(100),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await this.db.query(`
        CREATE INDEX IF NOT EXISTS idx_cart_user_id ON cart_items (user_id);
      `);

      this.logger.log('🐘 cart_items table initialized in PostgreSQL.');
    } catch (err: any) {
      this.logger.warn(`PostgreSQL cart table init skipped: ${err.message}. Using in-memory fallback.`);
    }
  }

  /**
   * Resolve authoritative product details and pricing.
   */
  private resolveProduct(dto: AddCartItemDto): {
    productTitle: string;
    optionTitle?: string;
    unitPrice: number;
    webinarId?: string;
    membershipId?: string;
    speakerName?: string;
    date?: string;
    time?: string;
  } {
    const { itemType, productId, optionType, membershipId } = dto;

    if (itemType === 'membership') {
      // Look up membership plan
      let matchedPlan: any = null;
      let matchedCategory: any = null;

      for (const cat of MEMBERSHIP_CATEGORIES) {
        const foundPlan = cat.plans.find((p) => p.id === productId || p.id === dto.productId);
        if (foundPlan) {
          matchedPlan = foundPlan;
          matchedCategory = cat;
          break;
        }
      }

      if (!matchedPlan) {
        throw new NotFoundException({
          success: false,
          message: `Membership plan with ID "${productId}" not found.`,
        });
      }

      return {
        productTitle: `${matchedCategory.title} (${matchedPlan.name})`,
        optionTitle: matchedPlan.duration,
        unitPrice: matchedPlan.price,
        membershipId: matchedCategory.id,
      };
    }

    // Look up webinar product
    const webinarId = dto.webinarId || productId;
    const webinar = mockWebinars.find(
      (w) => w.id === webinarId || String(w.id) === String(productId),
    );

    if (!webinar) {
      throw new NotFoundException({
        success: false,
        message: `Webinar product with ID "${productId}" not found.`,
      });
    }

    let unitPrice = 199;
    let optionTitle = 'Single Live Attendee';

    if (optionType && STANDARD_OPTION_PRICES[optionType]) {
      unitPrice = STANDARD_OPTION_PRICES[optionType].price;
      optionTitle = STANDARD_OPTION_PRICES[optionType].title;
    } else if (itemType === 'recorded_webinar') {
      unitPrice = 249;
      optionTitle = 'On-Demand Recording';
    } else if (itemType === 'dvd') {
      unitPrice = 299;
      optionTitle = 'Training DVD';
    } else if (itemType === 'flash_drive') {
      unitPrice = 349;
      optionTitle = 'Flash Drive Shipped';
    }

    return {
      productTitle: webinar.title,
      optionTitle,
      unitPrice,
      webinarId: webinar.id,
      speakerName: webinar.speaker?.name,
      date: webinar.date,
      time: webinar.time,
    };
  }

  /**
   * Get user's cart summary.
   */
  async getCart(user: any): Promise<CartSummary> {
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication required to access cart.',
      });
    }

    let items: CartItem[] = [];

    try {
      const { rows } = await this.db.query(
        'SELECT * FROM cart_items WHERE user_id = $1 ORDER BY created_at ASC',
        [userId],
      );
      if (rows && rows.length > 0) {
        items = rows.map((r) => ({
          id: r.id,
          userId: r.user_id,
          itemType: r.item_type,
          productId: r.product_id,
          productTitle: r.product_title,
          optionType: r.option_type,
          optionTitle: r.option_title,
          quantity: Number(r.quantity),
          unitPrice: Number(r.unit_price),
          totalPrice: Number(r.total_price),
          webinarId: r.webinar_id,
          membershipId: r.membership_id,
          speakerName: r.speaker_name,
          date: r.date,
          time: r.time,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
        }));
      }
    } catch (err: any) {
      items = this.inMemoryCart.get(userId) || [];
    }

    if (items.length === 0 && this.inMemoryCart.has(userId)) {
      items = this.inMemoryCart.get(userId) || [];
    }

    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const discount = 0;
    const total = Math.max(0, subtotal - discount);

    return {
      success: true,
      itemCount,
      subtotal,
      discount,
      total,
      items,
    };
  }

  /**
   * Add item to cart.
   */
  async addItem(user: any, dto: AddCartItemDto): Promise<CartSummary> {
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication required to add items to cart.',
      });
    }

    const { itemType, productId, optionType } = dto || {};
    const quantity = dto?.quantity !== undefined ? Number(dto.quantity) : 1;

    if (!itemType || !ALLOWED_ITEM_TYPES.includes(itemType)) {
      throw new BadRequestException({
        success: false,
        message: `Invalid item type "${itemType}". Allowed types: ${ALLOWED_ITEM_TYPES.join(', ')}.`,
      });
    }

    if (!productId || typeof productId !== 'string' || !productId.trim()) {
      throw new BadRequestException({
        success: false,
        message: 'Product ID is required.',
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException({
        success: false,
        message: 'Quantity must be a positive integer greater than or equal to 1.',
      });
    }

    // 1. Authoritative resolution & pricing
    const resolved = this.resolveProduct(dto);
    const unitPrice = resolved.unitPrice;
    const totalPrice = unitPrice * quantity;
    const now = new Date().toISOString();

    // 2. Check if identical item already exists in user's cart
    const userCart = this.inMemoryCart.get(userId) || [];
    const existingIndex = userCart.findIndex(
      (item) =>
        item.itemType === itemType &&
        item.productId === productId &&
        (item.optionType || '') === (optionType || ''),
    );

    if (existingIndex > -1) {
      // Update quantity
      userCart[existingIndex].quantity += quantity;
      userCart[existingIndex].totalPrice = userCart[existingIndex].unitPrice * userCart[existingIndex].quantity;
      userCart[existingIndex].updatedAt = now;
      this.inMemoryCart.set(userId, userCart);

      try {
        await this.db.query(
          `UPDATE cart_items 
           SET quantity = quantity + $1, total_price = unit_price * (quantity + $1), updated_at = CURRENT_TIMESTAMP
           WHERE id = $2;`,
          [quantity, userCart[existingIndex].id],
        );
      } catch (err: any) {}
    } else {
      // Insert new cart item
      const cartItemId = `cart-item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newItem: CartItem = {
        id: cartItemId,
        userId,
        itemType,
        productId,
        productTitle: resolved.productTitle,
        optionType: optionType || undefined,
        optionTitle: resolved.optionTitle,
        quantity,
        unitPrice,
        totalPrice,
        webinarId: resolved.webinarId,
        membershipId: resolved.membershipId,
        speakerName: resolved.speakerName,
        date: resolved.date,
        time: resolved.time,
        createdAt: now,
        updatedAt: now,
      };

      userCart.push(newItem);
      this.inMemoryCart.set(userId, userCart);

      try {
        await this.db.query(
          `INSERT INTO cart_items (
            id, user_id, item_type, product_id, product_title, option_type, option_title,
            quantity, unit_price, total_price, webinar_id, membership_id, speaker_name, date, time, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);`,
          [
            newItem.id,
            newItem.userId,
            newItem.itemType,
            newItem.productId,
            newItem.productTitle,
            newItem.optionType || null,
            newItem.optionTitle || null,
            newItem.quantity,
            newItem.unitPrice,
            newItem.totalPrice,
            newItem.webinarId || null,
            newItem.membershipId || null,
            newItem.speakerName || null,
            newItem.date || null,
            newItem.time || null,
          ],
        );
      } catch (err: any) {}
    }

    return this.getCart(user);
  }

  /**
   * Remove a single item from cart.
   */
  async removeItem(user: any, itemId: string): Promise<CartSummary> {
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication required.',
      });
    }

    const userCart = this.inMemoryCart.get(userId) || [];
    const itemIndex = userCart.findIndex((i) => i.id === itemId);

    if (itemIndex > -1) {
      userCart.splice(itemIndex, 1);
      this.inMemoryCart.set(userId, userCart);
    }

    try {
      await this.db.query(
        'DELETE FROM cart_items WHERE id = $1 AND user_id = $2',
        [itemId, userId],
      );
    } catch (err: any) {}

    return this.getCart(user);
  }

  /**
   * Clear entire cart for user.
   */
  async clearCart(user: any): Promise<{ success: boolean; message: string }> {
    const userId = user?.sub || user?.id;
    if (!userId) {
      throw new UnauthorizedException({
        success: false,
        message: 'Authentication required.',
      });
    }

    this.inMemoryCart.set(userId, []);

    try {
      await this.db.query('DELETE FROM cart_items WHERE user_id = $1', [userId]);
    } catch (err: any) {}

    return {
      success: true,
      message: 'Cart cleared successfully.',
    };
  }
}
