export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  queryType?: string;
  subject?: string;
  message: string;
  createdAt: string;
}
