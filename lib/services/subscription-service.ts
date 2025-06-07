import { PlanType } from '@/types/subscription';

export interface SubscriptionCreate {
  plan_type: PlanType;
  seats: number;
}

export interface SubscriptionUpdate {
  seats?: number;
  cancel_at_period_end?: boolean;
}

export interface SubscriptionResponse {
  id: number;
  user_id: number;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_type: PlanType;
  status: string;
  trial_end: string;
  current_period_end: string;
  seats: number;
  cancel_at_period_end?: boolean;
}

export class SubscriptionService {
  private static API_URL = process.env.NEXT_PUBLIC_API_URL;

  static async createSubscription(
    subscriptionData: SubscriptionCreate,
    paymentMethodId: string,
    isAnnual: boolean
  ): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.API_URL}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...subscriptionData,
          payment_method_id: paymentMethodId,
          is_annual: isAnnual,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create subscription');
      }

      return response.json();
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  static async getCurrentSubscription(): Promise<SubscriptionResponse | null> {
    try {
      const response = await fetch(`${this.API_URL}/subscription`, {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Failed to fetch subscription');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  static async updateSubscription(
    subscriptionData: SubscriptionUpdate
  ): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${this.API_URL}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(subscriptionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to update subscription');
      }

      return response.json();
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  }
} 