export class CreateOnsiteTrainingDto {
  name: string;
  email: string;
  phone: string;
  industry: string;
  preferredTime?: string;
  specificNeeds?: string;
  organization?: string;
  participantsCount?: number;
  trainingRequirements?: string;
}
