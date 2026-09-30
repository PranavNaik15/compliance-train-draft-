export interface MediaRecord {
  id: string;
  name: string;
  filename: string;
  type: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | string;
  url: string;
  altText?: string;
  category?: string;
  section?: string;
  size?: string;
  dimensions?: string;
  website: 'ORIGINAL' | 'BRIDGE' | 'BOTH' | string;
  status: 'ACTIVE' | 'INACTIVE' | string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMediaDto {
  name: string;
  filename?: string;
  type?: 'IMAGE' | 'VIDEO' | 'DOCUMENT' | string;
  url: string;
  altText?: string;
  category?: string;
  section?: string;
  size?: string;
  dimensions?: string;
  website?: string;
  status?: string;
}

export interface UpdateMediaDto {
  name?: string;
  filename?: string;
  type?: string;
  url?: string;
  altText?: string;
  category?: string;
  section?: string;
  size?: string;
  dimensions?: string;
  website?: string;
  status?: string;
}
