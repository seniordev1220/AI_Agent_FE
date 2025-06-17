export interface Feature {
  text: string;
  bold: string[];
}

export interface PricePlanFeature {
  description: string;
  included: boolean;
}

export interface PricePlan {
  id: number;
  name: string;
  monthly_price: string;
  annual_price: string;
  additional_seat_price: string;
  included_seats: number;
  features: PricePlanFeature[];
  plan_type: 'individual' | 'standard' | 'smb' | 'enterprise';
  is_active: boolean;
  is_best_value: boolean;
  stripe_price_id_monthly: string | null;
  stripe_price_id_annual: string | null;
  created_at: string;
  updated_at: string;
} 