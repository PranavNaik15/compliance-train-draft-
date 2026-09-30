export interface SpeakerRecord {
  id: string;
  name: string;
  designation: string;
  organization: string;
  bio?: string;
  photo?: string;
  profileLink?: string;
  status: 'active' | 'inactive';
  webinarCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSpeakerDto {
  name: string;
  designation: string;
  organization: string;
  bio?: string;
  photo?: string;
  profileLink?: string;
  status?: 'active' | 'inactive';
}

export interface UpdateSpeakerDto {
  name?: string;
  designation?: string;
  organization?: string;
  bio?: string;
  photo?: string;
  profileLink?: string;
  status?: 'active' | 'inactive';
}
