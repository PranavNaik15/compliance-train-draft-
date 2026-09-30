export interface PlatformSettings {
  general: {
    siteName: string;
    adminFullName: string;
    adminEmail: string;
    supportEmail: string;
    supportPhone: string;
    defaultCurrency: string;
    timezone: string;
    dateFormat: string;
  };
  website: {
    originalEnabled: boolean;
    bridgeEnabled: boolean;
    originalUrl: string;
    bridgeUrl: string;
    backendApiUrl: string;
  };
  notifications: {
    emailNotificationsEnabled: boolean;
    adminNotificationsEnabled: boolean;
    notifyNewRegistration: boolean;
    notifyNewSupportTicket: boolean;
    notifyNewOnsiteTraining: boolean;
    notifyNewOrder: boolean;
  };
  system: {
    maintenanceMode: boolean;
    defaultPaginationSize: number;
    sessionTimeoutMinutes: number;
  };
  updatedAt: string;
}

export interface UpdateSettingsDto {
  general?: Partial<PlatformSettings['general']>;
  website?: Partial<PlatformSettings['website']>;
  notifications?: Partial<PlatformSettings['notifications']>;
  system?: Partial<PlatformSettings['system']>;
}
