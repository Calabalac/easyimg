import { Injectable, BadRequestException } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../enums/subscription.enum';
import {
  SubscriptionPlanConfig,
  UserSubscription,
  SubscriptionUsage,
} from '../interfaces/subscription.interface';
import { nanoid } from 'nanoid';

@Injectable()
export class SubscriptionService {
  private defaultPlans: SubscriptionPlanConfig[] = [
    {
      id: SubscriptionPlan.FREE,
      name: 'Free',
      description: 'Perfect for personal use',
      imageQuota: 10,
      price: 0,
      currency: 'USD',
      features: ['10 images per month', 'Basic support', 'Standard quality'],
    },
    {
      id: SubscriptionPlan.CLASSIC,
      name: 'Classic',
      description: 'Great for small businesses',
      imageQuota: 100,
      price: 9.99,
      currency: 'USD',
      features: [
        '100 images per month',
        'Priority support',
        'High quality',
        'API access',
      ],
    },
    {
      id: SubscriptionPlan.PRO,
      name: 'Pro',
      description: 'For growing businesses',
      imageQuota: 500,
      price: 29.99,
      currency: 'USD',
      features: [
        '500 images per month',
        '24/7 support',
        'Ultra quality',
        'Advanced API',
        'Custom domains',
      ],
    },
    {
      id: SubscriptionPlan.MAX,
      name: 'Max',
      description: 'For enterprise use',
      imageQuota: 2000,
      price: 99.99,
      currency: 'USD',
      features: [
        '2000 images per month',
        'Dedicated support',
        'Premium quality',
        'Full API access',
        'White-label solution',
        'SLA guarantee',
      ],
    },
  ];

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Get all available subscription plans
   */
  async getSubscriptionPlans(): Promise<SubscriptionPlanConfig[]> {
    try {
      const supabase = await this.supabaseService.getClient();
      const { data: customPlans, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price', { ascending: true });

      if (error && !error.message.includes('relation')) {
        throw error;
      }

      // If custom plans exist, use them; otherwise use defaults
      if (customPlans && customPlans.length > 0) {
        return customPlans;
      }

      return this.defaultPlans;
    } catch (error) {
      console.warn('Using default plans due to error:', error.message);
      return this.defaultPlans;
    }
  }

  /**
   * Get user's current subscription
   */
  async getUserSubscription(userId: string): Promise<UserSubscription | null> {
    try {
      const supabase = await this.supabaseService.getClient();
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (error) {
      console.warn('Failed to get user subscription:', error.message);
      return null;
    }
  }

  /**
   * Create or update user subscription
   */
  async createUserSubscription(
    userId: string,
    plan: SubscriptionPlan,
    customQuota?: number,
  ): Promise<UserSubscription> {
    const supabase = await this.supabaseService.getClient();
    const plans = await this.getSubscriptionPlans();
    const planConfig = plans.find((p) => p.id === plan);

    if (!planConfig) {
      throw new BadRequestException('Invalid subscription plan');
    }

    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1); // Monthly subscription

    const subscriptionData = {
      id: nanoid(),
      user_id: userId,
      plan: plan,
      status: SubscriptionStatus.ACTIVE,
      images_uploaded: 0,
      image_quota: customQuota || planConfig.imageQuota,
      start_date: now.toISOString(),
      end_date: endDate.toISOString(),
      payment_url: planConfig.paymentUrl,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    };

    const { data, error } = await supabase
      .from('user_subscriptions')
      .upsert(subscriptionData, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) throw error;

    return this.mapSubscriptionFromDb(data);
  }

  /**
   * Check if user can upload more images
   */
  async canUserUploadImage(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) {
      // Create free subscription for new users
      await this.createUserSubscription(userId, SubscriptionPlan.FREE);
      return true;
    }

    // Check if subscription is active and not expired
    if (
      subscription.status !== SubscriptionStatus.ACTIVE ||
      new Date() > subscription.endDate
    ) {
      return false;
    }

    // Check quota
    return subscription.imagesUploaded < subscription.imageQuota;
  }

  /**
   * Increment user's image count
   */
  async incrementImageCount(userId: string): Promise<void> {
    const supabase = await this.supabaseService.getClient();

    const { error } = await supabase.rpc('increment_user_images', {
      user_id: userId,
    });

    if (error) throw error;
  }

  /**
   * Get subscription usage statistics
   */
  async getSubscriptionUsage(
    userId: string,
  ): Promise<SubscriptionUsage | null> {
    const subscription = await this.getUserSubscription(userId);

    if (!subscription) return null;

    const now = new Date();
    const daysRemaining = Math.max(
      0,
      Math.ceil(
        (subscription.endDate.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    const quotaUsagePercent = Math.round(
      (subscription.imagesUploaded / subscription.imageQuota) * 100,
    );

    return {
      userId: subscription.userId,
      plan: subscription.plan,
      imagesUploaded: subscription.imagesUploaded,
      imageQuota: subscription.imageQuota,
      quotaUsagePercent,
      daysRemaining,
      status: subscription.status,
    };
  }

  /**
   * Update user's quota (admin function)
   */
  async updateUserQuota(userId: string, newQuota: number): Promise<void> {
    const supabase = await this.supabaseService.getClient();

    const { error } = await supabase
      .from('user_subscriptions')
      .update({
        image_quota: newQuota,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Get all users with their subscriptions (admin function)
   */
  async getAllUsersWithSubscriptions(): Promise<any[]> {
    try {
      const supabase = await this.supabaseService.getClient();

      // Получаем всех пользователей
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        return [];
      }

      // Для каждого пользователя получаем подписки отдельно
      const usersWithSubscriptions = [];

      for (const user of users) {
        const { data: subscriptions, error: subError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id);

        if (subError) {
          console.warn(
            `Failed to get subscriptions for user ${user.email}:`,
            subError.message,
          );
          usersWithSubscriptions.push({
            ...user,
            user_subscriptions: [],
          });
        } else {
          usersWithSubscriptions.push({
            ...user,
            user_subscriptions: subscriptions || [],
          });
        }
      }

      return usersWithSubscriptions;
    } catch (error) {
      console.warn('Failed to get users with subscriptions:', error.message);
      return [];
    }
  }

  /**
   * Update subscription plan configuration (admin function)
   */
  async updateSubscriptionPlan(
    planId: SubscriptionPlan,
    updates: Partial<SubscriptionPlanConfig>,
  ): Promise<void> {
    const supabase = await this.supabaseService.getClient();

    const { error } = await supabase.from('subscription_plans').upsert({
      id: planId,
      ...updates,
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;
  }

  /**
   * Map database record to UserSubscription interface
   */
  private mapSubscriptionFromDb(data: any): UserSubscription {
    return {
      id: data.id,
      userId: data.user_id,
      plan: data.plan,
      status: data.status,
      imagesUploaded: data.images_uploaded,
      imageQuota: data.image_quota,
      startDate: new Date(data.start_date),
      endDate: new Date(data.end_date),
      paymentUrl: data.payment_url,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
