import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, LoginData, RegisterData } from '../types';
import { authApi } from '../services/api';

interface AuthStore extends AuthState {
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,

      login: async (data: LoginData) => {
        try {
          set({ loading: true });
          const response = await authApi.login(data);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            // Сохраняем токен в localStorage и устанавливаем в axios
            localStorage.setItem('jwt_token', token);
            authApi.setAuthToken(token);
            
            set({ 
              user, 
              token, 
              isAuthenticated: true, 
              loading: false 
            });
          } else {
            throw new Error(response.message || 'Login failed');
          }
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      register: async (data: RegisterData) => {
        try {
          set({ loading: true });
          const response = await authApi.register(data);
          
          if (response.success && response.data) {
            const { user, token } = response.data;
            
            localStorage.setItem('jwt_token', token);
            authApi.setAuthToken(token);
            
            set({ 
              user, 
              token, 
              isAuthenticated: true, 
              loading: false 
            });
          } else {
            throw new Error(response.message || 'Registration failed');
          }
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('jwt_token');
        authApi.setAuthToken(null);
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        });
      },

      checkAuth: async () => {
        try {
          const token = localStorage.getItem('jwt_token');
          if (!token) return;

          authApi.setAuthToken(token);
          const response = await authApi.getProfile();
          
          if (response.success && response.data) {
            set({ 
              user: response.data, 
              token, 
              isAuthenticated: true 
            });
          } else {
            // Токен недействителен
            get().logout();
          }
        } catch (error) {
          // Ошибка проверки токена
          get().logout();
        }
      },

      setLoading: (loading: boolean) => set({ loading }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
); 