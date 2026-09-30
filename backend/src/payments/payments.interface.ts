export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';

export interface PaymentRecord {
  id: string;
  orderId: string;
  userId: string;
  customerName: string;
  customer?: string;
  customerEmail: string;
  email?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  method?: string;
  transactionId?: string;
  paymentDate: string;
  date?: string;
  status: PaymentStatus;
  website: 'ORIGINAL' | 'BRIDGE' | string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentDto {
  orderId: string;
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  transactionId?: string;
  status?: PaymentStatus;
  website?: string;
  notes?: string;
}

export interface UpdatePaymentDto {
  status?: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}
