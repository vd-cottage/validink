// API Version
const API_VERSION = 'v1';

export const API_ROUTES = {
  AUTH: {
    LOGIN: `/api/${API_VERSION}/auth/login`,
    REGISTER: `/api/${API_VERSION}/auth/register`,
    REGISTER_INITIATE: `/api/${API_VERSION}/auth/register/initiate`,
    REGISTER_VERIFY: `/api/${API_VERSION}/auth/register/verify`
  },
  VALIDATION: {
    UNIFIED: `/api/${API_VERSION}/validate`,
    COMPREHENSIVE: `/api/${API_VERSION}/validate/comprehensive`,
    SYNTAX: `/api/${API_VERSION}/validate/syntax`,
    DOMAIN: `/api/${API_VERSION}/validate/domain`,
    DISPOSABLE: `/api/${API_VERSION}/validate/disposable`,
    FRAUD: `/api/${API_VERSION}/validate/fraud`,
    ROLE: `/api/${API_VERSION}/validate/role`,
    REPUTATION: `/api/${API_VERSION}/validate/reputation`,
    SMTP: `/api/${API_VERSION}/validate/smtp`,
    CATCHALL: `/api/${API_VERSION}/validate/catchall`,
    ENRICH: `/api/${API_VERSION}/validate/enrich`,
    BATCH: `/api/${API_VERSION}/validate/batch`
  },
  EMAIL: {
    DETAILS: `/api/${API_VERSION}/validate/details`
  },
  EMAIL_FINDER: {
    FIND: `/api/${API_VERSION}/email-finder/find`
  },
  DASHBOARD: {
    STATS: `/api/${API_VERSION}/dashboard/stats`,
    RECENT: `/api/${API_VERSION}/dashboard/recent`,
    ANALYTICS: `/api/${API_VERSION}/dashboard/analytics`
  },
  BULK: {
    UPLOAD: `/api/${API_VERSION}/bulk/upload`,
    STATUS: (jobId: string) => `/api/${API_VERSION}/bulk/status/${jobId}`,
    JOBS: `/api/${API_VERSION}/bulk/jobs`,
    RESULTS: (jobId: string) => `/api/${API_VERSION}/bulk/results/${jobId}`,
    DOWNLOAD: (jobId: string) => `/api/${API_VERSION}/bulk/download/${jobId}`,
    CANCEL: (jobId: string) => `/api/${API_VERSION}/bulk/${jobId}`
  },
  // Phase 1 endpoints
  WEBHOOKS: {
    LIST: `/api/${API_VERSION}/webhooks`,
    CREATE: `/api/${API_VERSION}/webhooks`,
    UPDATE: (id: string) => `/api/${API_VERSION}/webhooks/${id}`,
    TEST: (id: string) => `/api/${API_VERSION}/webhooks/${id}/test`,
    DELETE: (id: string) => `/api/${API_VERSION}/webhooks/${id}`
  },
  API_KEYS: {
    LIST: `/api/${API_VERSION}/api-keys`,
    CREATE: `/api/${API_VERSION}/api-keys`,
    REGENERATE: (id: string) => `/api/${API_VERSION}/api-keys/${id}/regenerate`,
    DELETE: (id: string) => `/api/${API_VERSION}/api-keys/${id}`
  },
  BILLING: {
    INFO: `/api/${API_VERSION}/billing/info`,
    PLANS: `/api/${API_VERSION}/billing/plans`,
    INVOICES: `/api/${API_VERSION}/billing/invoices`,
    DOWNLOAD_INVOICE: (id: string) => `/api/${API_VERSION}/billing/invoices/${id}/pdf`,
    PAYMENT_METHOD: `/api/${API_VERSION}/billing/payment-method`,
    CHANGE_PLAN: `/api/${API_VERSION}/billing/change-plan`,
    CANCEL: `/api/${API_VERSION}/billing/cancel`
  },
  // Phase 2 endpoints
  USER: {
    PROFILE: `/api/${API_VERSION}/user/profile`,
    UPDATE_PROFILE: `/api/${API_VERSION}/user/profile`,
    CHANGE_PASSWORD: `/api/${API_VERSION}/user/change-password`,
    DELETE_ACCOUNT: `/api/${API_VERSION}/user/account`,
    NOTIFICATIONS: `/api/${API_VERSION}/user/notifications`,
    UPDATE_NOTIFICATIONS: `/api/${API_VERSION}/user/notifications`,
    TWO_FACTOR: {
      STATUS: `/api/${API_VERSION}/user/2fa/status`,
      ENABLE: `/api/${API_VERSION}/user/2fa/enable`,
      VERIFY: `/api/${API_VERSION}/user/2fa/verify`,
      DISABLE: `/api/${API_VERSION}/user/2fa/disable`
    }
  },
  ANALYTICS: {
    USAGE: `/api/${API_VERSION}/analytics/usage`,
    ENDPOINTS: `/api/${API_VERSION}/analytics/endpoints`,
    VALIDATION_TYPES: `/api/${API_VERSION}/analytics/validation-types`,
    ERRORS: `/api/${API_VERSION}/analytics/errors`
  }
} as const;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

