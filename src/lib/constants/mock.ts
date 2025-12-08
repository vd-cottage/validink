export const MOCK_DATA = {
  dashboard: {
    stats: {
      success: true,
      data: {
        validations: {
          total_validations: 1247,
          valid_count: 892,
          invalid_count: 235,
          disposable_count: 120,
          avg_fraud_score: 0.15,
          change_percentage: 15.3,
          valid_percentage: 71.5,
          invalid_percentage: 18.8,
          risky_count: 45,
          risky_percentage: 3.6
        },
        account: {
          credits: 8500,
          credits_used: 1500,
          plan: 'pro'
        }
      }
    },
    analytics: {
      success: true,
      data: {
        daily: {
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          valid: [45, 52, 48, 61, 55, 38, 42],
          invalid: [12, 15, 10, 18, 14, 8, 11],
          disposable: [5, 3, 4, 6, 5, 2, 3]
        },
        weekly: {
          labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
          data: [234, 289, 312, 267]
        },
        distribution: {
          valid: 892,
          invalid: 235,
          disposable: 120,
          risky: 45
        }
      }
    },
    recentActivity: {
      success: true,
      data: [
        {
          id: '1',
          email: 'test@example.com',
          status: 'valid',
          is_valid: true,
          risk_level: 'low',
          fraud_score: 0.1,
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          created_at: new Date(Date.now() - 5 * 60000).toISOString()
        },
        {
          id: '2',
          email: 'invalid@nonexistent.xyz',
          status: 'invalid',
          is_valid: false,
          risk_level: 'high',
          fraud_score: 0.85,
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          created_at: new Date(Date.now() - 15 * 60000).toISOString()
        },
        {
          id: '3',
          email: 'temp@tempmail.com',
          status: 'disposable',
          is_valid: false,
          risk_level: 'medium',
          fraud_score: 0.6,
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          created_at: new Date(Date.now() - 30 * 60000).toISOString()
        }
      ]
    }
  },
  validation: {
    comprehensive: {
      success: true,
      data: {
        email: 'test@example.com',
        status: 'valid',
        sub_status: 'verified',
        is_valid: true,
        is_free_email: true,
        is_disposable: false,
        is_role_account: false,
        is_catch_all: false,
        fraud_score: 0.1,
        risk_level: 'low',
        domain_reputation: 1.0,
        has_mx_record: true,
        mx_servers: ['alt1.gmail-smtp-in.l.google.com'],
        smtp_valid: true,
        processing_time_ms: 102.5,
        did_you_mean: null
      }
    }
  }
};

