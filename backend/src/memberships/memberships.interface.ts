export interface MembershipPlanRecord {
  id: string;
  name: string;
  type: 'INDIVIDUAL' | 'CORPORATE';
  price: number;
  duration: string;
  durationMonths: number;
  durationUnit?: string;
  description: string;
  status: 'ACTIVE' | 'INACTIVE';
  isBestValue?: boolean;
  features?: string[];
  seats?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateMembershipPlanDto {
  name: string;
  type: 'INDIVIDUAL' | 'CORPORATE';
  price: number;
  duration: string;
  durationMonths?: number;
  durationUnit?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  isBestValue?: boolean;
  features?: string[];
  seats?: string;
}

export interface UpdateMembershipPlanDto {
  name?: string;
  type?: 'INDIVIDUAL' | 'CORPORATE';
  price?: number;
  duration?: string;
  durationMonths?: number;
  durationUnit?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  isBestValue?: boolean;
  features?: string[];
  seats?: string;
}

export interface MembershipSubscriptionRecord {
  id: string;
  userId: string;
  userName: string;
  email: string;
  planId: string;
  planName: string;
  membershipType: 'INDIVIDUAL' | 'CORPORATE';
  price: number;
  startDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
  website?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateSubscriptionDto {
  planId?: string;
  expiryDate?: string;
  startDate?: string;
  extendMonths?: number;
  status?: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED' | 'CANCELLED';
}

