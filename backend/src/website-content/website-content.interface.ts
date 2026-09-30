export interface WebsiteContentRecord {
  id: string;
  section: string;
  key: string;
  label?: string;
  content: string;
  website: 'ORIGINAL' | 'BRIDGE' | 'BOTH' | string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  updatedAt: string;
}

export interface CreateWebsiteContentDto {
  section: string;
  key: string;
  label?: string;
  content: string;
  website?: string;
  status?: string;
}

export interface UpdateWebsiteContentDto {
  content?: string;
  label?: string;
  section?: string;
  website?: string;
  status?: string;
}
