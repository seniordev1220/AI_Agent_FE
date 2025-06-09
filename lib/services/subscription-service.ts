export interface SubscriptionResponse {
  id: number;
  user_id: number;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_type: 'INDIVIDUAL' | 'STANDARD' | 'SMB';
  status: string;
  trial_end: string;
  current_period_end: string;
  seats: number;
  cancel_at_period_end: boolean;
}

export interface SubscriptionCreate {
  plan_type: 'INDIVIDUAL' | 'STANDARD' | 'SMB';
  seats: number;
  payment_method_id: string;
  is_annual: boolean;
}

export interface SubscriptionUpdate {
  seats?: number;
  cancel_at_period_end?: boolean;
}

export class SubscriptionService {
  static async createSubscription(data: SubscriptionCreate, accessToken: string): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          plan_type: data.plan_type,
          seats: data.seats,
          payment_method_id: data.payment_method_id,
          is_annual: data.is_annual
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

  static async getCurrentSubscription(accessToken: string): Promise<SubscriptionResponse | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to fetch subscription');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  }

  static async updateSubscription(data: SubscriptionUpdate, accessToken: string): Promise<SubscriptionResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
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

  static async handleWebhook(signature: string, payload: any): Promise<void> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/webhook`, {
        method: 'POST',
        headers: {
          'stripe-signature': signature,
        },
        body: payload,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to process webhook');
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      throw error;
    }
  }
} 