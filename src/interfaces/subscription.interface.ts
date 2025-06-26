import {
  SubscriptionPlan,
  SubscriptionStatus,
} from '../enums/subscription.enum';

export interface SubscriptionPlanConfig {
  id: SubscriptionPlan;
  name: string;
  description: string;
  imageQuota: number;
  price: number;
  currency: string;
  features: string[];
  paymentUrl?: string;
}

export interface UserSubscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  imagesUploaded: number;
  imageQuota: number;
  startDate: Date;
  endDate: Date;
  paymentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionUsage {
  userId: string;
  plan: SubscriptionPlan;
  imagesUploaded: number;
  imageQuota: number;
  quotaUsagePercent: number;
  daysRemaining: number;
  status: SubscriptionStatus;
}
