import { create } from 'zustand';
import { apiService } from '@/lib/services/api';

interface User {
  id: string;
  email: string;
  name: string;
  credits: number;
  plan: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.auth.login({ email, password });
      set({ user: response.data.user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Login failed', 
        isLoading: false 
      });
      throw error;
    }
  },
  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiService.auth.register({ email, password, name });
      set({ user: response.data.user, isLoading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.error || 'Registration failed', 
        isLoading: false 
      });
      throw error;
    }
  },
  logout: () => {
    apiService.auth.logout();
    set({ user: null, error: null });
  },
  clearError: () => set({ error: null })
}));

