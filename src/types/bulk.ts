// Types for bulk validation operations

export interface BulkJob {
  id: string;
  _id?: string;
  name?: string;
  filename?: string;
  originalFileName?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  totalEmails: number;
  processedEmails: number;
  validEmails: number;
  invalidEmails: number;
  validationType: 'fast' | 'deep' | 'comprehensive';
  webhookUrl?: string;
  errorMessage?: string;
  createdAt: string;
  created_at?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface BulkJobResult {
  email: string;
  isValid: boolean;
  result: string;
  details?: Record<string, unknown>;
}

export interface BulkResultsResponse {
  success: boolean;
  data: {
    results: BulkJobResult[];
    summary: {
      total: number;
      valid: number;
      invalid: number;
    };
    pagination: {
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface BulkUploadOptions {
  validationType?: 'fast' | 'deep' | 'comprehensive';
  webhookUrl?: string;
}

export interface ParsedEmailPreview {
  emails: string[];
  totalCount: number;
  previewEmails: string[];
  hasHeader: boolean;
}
