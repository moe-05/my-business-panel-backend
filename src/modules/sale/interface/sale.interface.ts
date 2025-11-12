export interface Sale {
  branch_id: string;
  sale_date: string;
  user_id: string;
  currency_id: number;
  total_amount: number;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}
