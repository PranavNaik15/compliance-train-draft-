export interface SupportRequest {
  id: string;
  message: string;
  name?: string;
  email?: string;
  phone?: string;
  category?: string;
  subject?: string;
  status: 'open' | 'in_progress' | 'resolved';
  response?: string;
  createdAt: string;
}
