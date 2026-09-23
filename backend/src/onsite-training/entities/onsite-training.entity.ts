export interface OnsiteTrainingRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  industry: string;
  preferredTime?: string;
  specificNeeds?: string;
  organization?: string;
  participantsCount?: number;
  createdAt: string;
}
