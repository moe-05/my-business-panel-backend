export interface LoyalProgram {
  loyal_program_id: string;
  tenant_id: string;
  points_per_dollar: number;
  points_per_currency_unit: number;
  minimum_purchase_for_points: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
