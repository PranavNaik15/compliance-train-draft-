export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface OrderItem {
  productId: string;
  productType: string;
  productName: string;
  optionType?: string;
  optionTitle?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  webinarId?: string;
  membershipId?: string;
}

export interface OrderRecord {
  id: string;
  userId: string;
  customerName: string;
  customer?: string;
  customerEmail: string;
  email?: string;
  items: OrderItem[];
  itemsSummary?: string;
  subtotal: number;
  discount: number;
  total: number;
  amount?: number;
  currency: string;
  orderDate: string;
  date?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  website: 'ORIGINAL' | 'BRIDGE' | string;
  billingAddress?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  items: Array<{
    productId: string;
    productType?: string;
    productName?: string;
    optionType?: string;
    optionTitle?: string;
    quantity?: number;
    unitPrice?: number;
  }>;
  promoCode?: string;
  discount?: number;
  website?: string;
  notes?: string;
  paymentMethod?: string;
  clearCart?: boolean;
}

export interface UpdateOrderDto {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
}
