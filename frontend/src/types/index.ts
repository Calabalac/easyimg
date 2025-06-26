// Пользователь
export interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Аутентификация
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

// API ответы
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Изображения
export interface Image {
  id: string;
  filename: string;
  original_name: string;
  size: number;
  mime_type: string;
  url: string;
  user_id: string;
  created_at: string;
}

// Подписки
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  duration_days: number;
  features: string[];
  is_active: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  plan?: SubscriptionPlan;
}

// Меню
export interface MenuItem {
  label: string;
  href: string;
  icon?: string;
  children?: MenuItem[];
  roles?: ('user' | 'admin')[];
} 