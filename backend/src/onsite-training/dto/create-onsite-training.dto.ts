export class CreateOnsiteTrainingDto {
  name: string;
  email: string;
  phone: string;
  industry: string;
  preferredTime?: string;
  preferredDate?: string;
  specificNeeds?: string;
  organization?: string;
  participants?: string;
  participantsCount?: number;
  attendeeCount?: string | number;
  trainingTopic?: string;
  trainingRequirements?: string;
  website?: string;
}
