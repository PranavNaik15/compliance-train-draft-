export interface ReportsOverview {
  webinars: {
    total: number;
    published: number;
    upcoming: number;
    byCategory: Record<string, number>;
    mostPopular: Array<{ id: string; title: string; registrationCount: number; category: string }>;
  };
  registrations: {
    total: number;
    original: number;
    bridge: number;
    byStatus: Record<string, number>;
  };
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  speakers: {
    total: number;
  };
  memberships: {
    total: number;
    active: number;
    expired: number;
    cancelled: number;
    byPlan: Record<string, number>;
    byType: Record<string, number>;
  };
  orders: {
    total: number;
    original: number;
    bridge: number;
    byStatus: {
      completed: number;
      pending: number;
      cancelled: number;
      failed: number;
    };
    totalValue: number;
    avgOrderValue: number;
  };
  payments: {
    total: number;
    successful: number;
    pending: number;
    failed: number;
    collectedRevenue: number;
    pendingRevenue: number;
  };
  inquiries: {
    contactRequests: { total: number; original: number; bridge: number; newCount: number };
    supportRequests: { total: number; original: number; bridge: number; openCount: number };
    onsiteRequests: { total: number; original: number; bridge: number; newCount: number };
  };
  monthlyRevenue: Array<{
    month: string;
    original: number;
    bridge: number;
    total: number;
  }>;
  crossPlatformComparison: {
    original: {
      registrations: number;
      orders: number;
      revenue: number;
      memberships: number;
      contactRequests: number;
    };
    bridge: {
      registrations: number;
      orders: number;
      revenue: number;
      memberships: number;
      contactRequests: number;
    };
  };
}
