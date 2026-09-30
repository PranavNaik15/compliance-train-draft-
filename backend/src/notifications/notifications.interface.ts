export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: string; // 'INFO' | 'SUCCESS' | 'WARNING' | 'ALERT' | 'REGISTRATION' | 'ORDER' | 'PAYMENT' | 'SUPPORT' | 'ONSITE'
  status: string; // 'UNREAD' | 'READ'
  priority: string; // 'LOW' | 'MEDIUM' | 'HIGH'
  target: string; // 'ALL' | 'ORIGINAL' | 'BRIDGE' | 'ADMIN'
  createdAt: string;
  readAt?: string | null;
}

export interface CreateNotificationDto {
  title?: string;
  message: string;
  type?: string;
  priority?: string;
  target?: string;
  recipient?: string;
}

export interface UpdateNotificationDto {
  title?: string;
  message?: string;
  type?: string;
  status?: string; // 'UNREAD' | 'READ'
  priority?: string;
  target?: string;
}
