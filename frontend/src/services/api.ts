import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { 
  ApiResponse, 
  LoginData, 
  RegisterData, 
  User, 
  Image, 
  SubscriptionPlan,
  UserSubscription 
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor для автоматического добавления токена
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Interceptor для обработки ошибок
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Токен истек или недействителен
          localStorage.removeItem('jwt_token');
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete this.api.defaults.headers.common['Authorization'];
    }
  }

  private async handleResponse<T>(response: AxiosResponse): Promise<ApiResponse<T>> {
    return response.data;
  }

  private async handleError(error: any): Promise<ApiResponse> {
    if (error.response?.data) {
      return error.response.data;
    }
    return {
      success: false,
      message: error.message || 'Network error'
    };
  }

  // Аутентификация
  async login(data: LoginData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/login', data);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async register(data: RegisterData): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/register', data);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.get('/auth/profile');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Изображения
  async uploadImage(file: File): Promise<ApiResponse<Image>> {
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await this.api.post('/api/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getImages(): Promise<ApiResponse<Image[]>> {
    try {
      const response = await this.api.get('/api/images');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteImage(id: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete(`/api/images/${id}`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Подписки
  async getSubscriptionPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    try {
      const response = await this.api.get('/api/subscription/plans');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getUserSubscription(): Promise<ApiResponse<UserSubscription>> {
    try {
      const response = await this.api.get('/api/subscription/current');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  // Админ функции
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.api.get('/admin/users');
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async updateUserRole(userId: string, role: 'user' | 'admin'): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.patch(`/admin/users/${userId}/role`, { role });
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete(`/admin/users/${userId}`);
      return this.handleResponse(response);
    } catch (error) {
      return this.handleError(error);
    }
  }
}

export const api = new ApiService();
export const authApi = api; 