export interface UserRecord {
  id: string;
  name: string;
  email: string;
  organization?: string;
  jobRole?: string;
  membership?: string;
  status: 'active' | 'suspended' | 'inactive';
  registeredDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserDto {
  name?: string;
  organization?: string;
  jobRole?: string;
  membership?: string;
  status?: 'active' | 'suspended' | 'inactive';
}
