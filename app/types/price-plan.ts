export interface Feature {
  text: string;
  bold: string[];
}

export interface PricePlan {
  id: number;
  name: string;
  price_monthly: number;
  price_annual: number;
  seats: number;
  seat_price: number;
  features: Feature[];
  plan_type: 'individual' | 'standard' | 'smb' | 'enterprise';
  is_active: boolean;
  created_at: string;
  updated_at: string;
} 