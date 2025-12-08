import { create } from 'zustand';
import { apiService } from '@/lib/services/api';

interface ValidationResult {
  email: string;
  isValid?: boolean;
  status?: string;
  details?: Record<string, any>;
  error?: string;
}

interface ValidationState {
  results: ValidationResult[];
  currentResult: ValidationResult | null;
  isLoading: boolean;
  error: string | null;
  validateEmail: (email: string, type?: string) => Promise<void>;
  validateBatch: (emails: string[]) => Promise<void>;
  clearResults: () => void;
  clearError: () => void;
}

export const useValidationStore = create<ValidationState>((set, get) => ({
  results: [],
  currentResult: null,
  isLoading: false,
  error: null,

  validateEmail: async (email: string, type = 'comprehensive') => {
    set({ isLoading: true, error: null });
    try {
      let result;
      switch (type) {
        case 'syntax':
          result = await apiService.validation.syntax(email);
          break;
        case 'domain':
          result = await apiService.validation.domain(email);
          break;
        case 'disposable':
          result = await apiService.validation.disposable(email);
          break;
        case 'fraud':
          result = await apiService.validation.fraud(email);
          break;
        case 'smtp':
          result = await apiService.validation.smtp(email);
          break;
        case 'enrich':
          result = await apiService.validation.enrich(email);
          break;
        default:
          result = await apiService.validation.comprehensive(email);
      }

      const validationResult = {
        email,
        ...result.data
      };

      set(state => ({
        currentResult: validationResult,
        results: [validationResult, ...state.results].slice(0, 10),
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message,
        isLoading: false
      });
      throw error;
    }
  },

  validateBatch: async (emails: string[]) => {
    set({ isLoading: true, error: null });
    try {
      const result = await apiService.validation.batch(emails);
      set(state => ({
        results: result.data.results,
        isLoading: false
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.error || error.message,
        isLoading: false
      });
      throw error;
    }
  },

  clearResults: () => set({ results: [], currentResult: null }),
  clearError: () => set({ error: null })
}));

