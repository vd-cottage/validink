import { create } from 'zustand';
import { apiService } from '@/lib/services/api';

interface Stats {
  totalUsers: number;
  newToday: number;
  totalEarnings: number;
  revenueGrowth: number;
  activeUsers: number;
  userGrowth: number;
  credits?: {
    remaining: number;
    usedToday: number;
    usedThisMonth: number;
  };
  validations?: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    allTime: number;
    total_validations: number;
    valid_count: number;
    invalid_count: number;
    risky_count: number;
    change_percentage: number;
  };
  performance?: {
    avgResponseTime: number;
    successRate: number;
  };
}

interface Analytics {
  userGrowth: {
    labels: string[];
    data: number[];
  };
  revenue: {
    labels: string[];
    data: number[];
  };
}

interface RecentActivity {
  id: number;
  email: string;
  status: string;
  timestamp: string;
}

interface DashboardState {
  stats: Stats | null;
  analytics: Analytics | null;
  recentActivity: RecentActivity[];
  isLoading: boolean;
  error: string | null;
  fetchStats: () => Promise<void>;
  fetchAnalytics: () => Promise<void>;
  fetchRecentActivity: () => Promise<void>;
  fetchAllData: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  stats: null,
  analytics: null,
  recentActivity: [],
  isLoading: false,
  error: null,

  fetchStats: async () => {
    try {
      const response = await apiService.dashboard.getStats();
      // Extract data from response if it's wrapped
      const stats = response.data || response;
      set({ stats, error: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchAnalytics: async () => {
    try {
      const response = await apiService.dashboard.getAnalytics();
      // Extract data from response if it's wrapped
      const analytics = response.data || response;
      set({ analytics, error: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchRecentActivity: async () => {
    try {
      const response = await apiService.dashboard.getRecent();
      // Extract data array from response (API returns { success: true, data: [] })
      const recentActivity = Array.isArray(response?.data) ? response.data : 
                             Array.isArray(response) ? response : [];
      set({ recentActivity, error: null });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  fetchAllData: async () => {
    set({ isLoading: true });
    try {
      await Promise.all([
        get().fetchStats(),
        get().fetchAnalytics(),
        get().fetchRecentActivity()
      ]);
    } catch (error: any) {
      set({ error: error.message });
    } finally {
      set({ isLoading: false });
    }
  }
}));

