import axios from 'axios';
import { API_ROUTES, API_BASE_URL } from '@/lib/constants/api';
import { MOCK_DATA } from '@/lib/constants/mock';

// Export the axios instance for the provider to use
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});
// Request interceptor removed - handled by AxiosTokenProvider

// Handle response errors
// Use a separate instance for public requests to avoid 401 redirects
export const publicApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Track session ready state (kept for AxiosTokenProvider compatibility)
export const setSessionReady = (_ready: boolean) => {
  // Session state managed by NextAuth
};

// Handle response errors (ONLY for authenticated api instance)
// NOTE: Auto-logout on 401 is DISABLED to prevent session clearing issues
// Users will be redirected by middleware if their session is truly invalid
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Log 401 errors for debugging but don't auto-logout
      console.warn('[API] 401 Unauthorized:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Public endpoints (no auth required)
  public: {
    tryEmail: (email: string, turnstileToken: string) =>
      publicApi.post('/api/public/try-email', { email, turnstileToken })
  },
  auth: {
    login: async (data: { email: string; password: string; totpCode?: string }) => {
      const response = await api.post(API_ROUTES.AUTH.LOGIN, data);
      // Token is now handled by NextAuth, not localStorage
      return response;
    },
    register: async (data: { email: string; password: string; name: string }) => {
      const response = await api.post(API_ROUTES.AUTH.REGISTER, data);
      // Token is now handled by NextAuth, not localStorage
      return response;
    },
    // New methods for 2-step registration
    initiateRegister: async (data: { email: string; password: string; name: string }) => {
      return api.post(API_ROUTES.AUTH.REGISTER_INITIATE, data);
    },
    verifyRegister: async (data: { email: string; otp: string }) => {
      return api.post(API_ROUTES.AUTH.REGISTER_VERIFY, data);
    },
    logout: () => {
      // Logout is now handled by NextAuth signOut
    },
    forgotPassword: (email: string) =>
      api.post('/api/v1/auth/forgot-password', { email }),
    verifyForgotOtp: (email: string, otp: string) =>
      api.post('/api/v1/auth/forgot-password/verify', { email, otp }),
    resetPassword: (data: { token: string; password: string }) =>
      api.post('/api/v1/auth/reset-password', data)
  },
  validation: {
    comprehensive: (email: string) =>
      publicApi.post(API_ROUTES.VALIDATION.COMPREHENSIVE, { email }),
    syntax: (email: string) =>
      api.post(API_ROUTES.VALIDATION.SYNTAX, { email }),
    domain: (email: string) =>
      api.post(API_ROUTES.VALIDATION.DOMAIN, { email }),
    disposable: (email: string) =>
      api.post(API_ROUTES.VALIDATION.DISPOSABLE, { email }),
    fraud: (email: string) =>
      api.post(API_ROUTES.VALIDATION.FRAUD, { email }),
    role: (email: string) =>
      api.post(API_ROUTES.VALIDATION.ROLE, { email }),
    reputation: (email: string) =>
      api.post(API_ROUTES.VALIDATION.REPUTATION, { email }),
    smtp: (email: string) =>
      api.post(API_ROUTES.VALIDATION.SMTP, { email }),
    catchall: (domain: string) =>
      api.post(API_ROUTES.VALIDATION.CATCHALL, { domain }),
    enrich: (email: string) =>
      api.post(API_ROUTES.VALIDATION.ENRICH, { email }),
    batch: (emails: string[]) =>
      api.post(API_ROUTES.VALIDATION.BATCH, { emails }),
    validate: (email: string, mode: 'fast' | 'deep' = 'fast') =>
      api.post(API_ROUTES.VALIDATION.UNIFIED, { email, mode })
  },
  emailFinder: {
    find: (name: string, domain: string) =>
      api.post(API_ROUTES.EMAIL_FINDER.FIND, { name, domain })
  },
  email: {
    getDetails: (email: string) =>
      api.post(API_ROUTES.EMAIL.DETAILS, { email })
  },
  dashboard: {
    getStats: async () => {
      try {
        const response = await api.get(API_ROUTES.DASHBOARD.STATS);
        return response.data;
      } catch (error) {
        console.warn('Using mock data for stats');
        return MOCK_DATA.dashboard.stats;
      }
    },
    getRecent: async () => {
      try {
        const response = await api.get(API_ROUTES.DASHBOARD.RECENT);
        return response.data;
      } catch (error) {
        console.warn('Using mock data for recent activity');
        return MOCK_DATA.dashboard.recentActivity;
      }
    },
    getAnalytics: async () => {
      try {
        const response = await api.get(API_ROUTES.DASHBOARD.ANALYTICS);
        return response.data;
      } catch (error) {
        console.warn('Using mock data for analytics');
        return MOCK_DATA.dashboard.analytics;
      }
    }
  },
  bulk: {
    upload: (formData: FormData) => {
      return api.post(API_ROUTES.BULK.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    },
    getStatus: (jobId: string) =>
      api.get(API_ROUTES.BULK.STATUS(jobId)),
    getJobs: () =>
      api.get(API_ROUTES.BULK.JOBS),
    getResults: (jobId: string, params?: { page?: number; limit?: number; filter?: 'valid' | 'invalid' }) =>
      api.get(API_ROUTES.BULK.RESULTS(jobId), { params }),
    cancel: (jobId: string) =>
      api.delete(API_ROUTES.BULK.CANCEL(jobId)),
    getDownloadUrl: (jobId: string) =>
      `${API_BASE_URL}${API_ROUTES.BULK.DOWNLOAD(jobId)}`
  },
  // Phase 1 services
  webhooks: {
    list: () => api.get(API_ROUTES.WEBHOOKS.LIST),
    create: (data: { url: string; events: string[]; name?: string }) =>
      api.post(API_ROUTES.WEBHOOKS.CREATE, data),
    update: (id: string, data: { url?: string; events?: string[]; name?: string; is_active?: boolean }) =>
      api.put(API_ROUTES.WEBHOOKS.UPDATE(id), data),
    test: (id: string) =>
      api.post(API_ROUTES.WEBHOOKS.TEST(id)),
    delete: (id: string) =>
      api.delete(API_ROUTES.WEBHOOKS.DELETE(id))
  },
  apiKeys: {
    list: () => api.get(API_ROUTES.API_KEYS.LIST),
    create: (data: { name: string; rate_limit_per_minute?: number }) =>
      api.post(API_ROUTES.API_KEYS.CREATE, data),
    regenerate: (id: string) =>
      api.post(API_ROUTES.API_KEYS.REGENERATE(id)),
    delete: (id: string) =>
      api.delete(API_ROUTES.API_KEYS.DELETE(id))
  },
  billing: {
    getInfo: () => api.get(API_ROUTES.BILLING.INFO),
    getPlans: () => api.get(API_ROUTES.BILLING.PLANS),
    getInvoices: () => api.get(API_ROUTES.BILLING.INVOICES),
    downloadInvoice: (id: string) =>
      api.get(API_ROUTES.BILLING.DOWNLOAD_INVOICE(id), { responseType: 'blob' }),
    updatePaymentMethod: (data: { payment_method_id: string }) =>
      api.post(API_ROUTES.BILLING.PAYMENT_METHOD, data),
    changePlan: (data: { plan_id: string }) =>
      api.post(API_ROUTES.BILLING.CHANGE_PLAN, data),
    cancelSubscription: () =>
      api.post(API_ROUTES.BILLING.CANCEL)
  },
  // Phase 2 services
  user: {
    getProfile: () => api.get(API_ROUTES.USER.PROFILE),
    updateProfile: (data: { name?: string; company?: string }) =>
      api.put(API_ROUTES.USER.UPDATE_PROFILE, data),
    changePassword: (data: { current_password: string; new_password: string; confirm_password: string }) =>
      api.post(API_ROUTES.USER.CHANGE_PASSWORD, data),
    // OTP Password Change
    requestPasswordChangeOtp: () =>
      api.post('/api/v1/user/otp/password-change/request'),
    changePasswordWithOtp: (data: { otp: string; new_password: string; confirm_password: string }) =>
      api.post('/api/v1/user/otp/password-change/verify', data),
    deleteAccount: (data: { password: string }) =>
      api.delete(API_ROUTES.USER.DELETE_ACCOUNT, { data }),
    getNotifications: () =>
      api.get(API_ROUTES.USER.NOTIFICATIONS),
    updateNotifications: (data: {
      email_notifications?: boolean;
      low_credit_alerts?: boolean;
      bulk_job_completion?: boolean;
      weekly_report?: boolean;
      marketing_emails?: boolean;
    }) => api.put(API_ROUTES.USER.UPDATE_NOTIFICATIONS, data),
    twoFactor: {
      getStatus: () => api.get('/api/v1/user/2fa/status'),
      enable: () => api.post('/api/v1/user/2fa/setup'),
      verify: (data: { code: string }) =>
        api.post('/api/v1/user/2fa/verify', data),
      disable: (data: { code: string; password?: string }) =>
        api.post('/api/v1/user/2fa/disable', data)
    }
  },
  analytics: {
    getUsage: (params?: { period?: string; interval?: string }) =>
      api.get(API_ROUTES.ANALYTICS.USAGE, { params }),
    getEndpoints: (params?: { period?: string }) =>
      api.get(API_ROUTES.ANALYTICS.ENDPOINTS, { params }),
    getValidationTypes: (params?: { period?: string }) =>
      api.get(API_ROUTES.ANALYTICS.VALIDATION_TYPES, { params }),
    getErrors: (params?: { period?: string; interval?: string }) =>
      api.get(API_ROUTES.ANALYTICS.ERRORS, { params })
  }
};
