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

export interface SaleFromDb {
  sale_id: string;
  sale_date: string;
  total_amount: number;
  subtotal_amount: number;
  tax_amount: number;
  is_completed: boolean;
  branch_id: string;
  branch_name: string;
  currency_code: string;
  symbol: string;
}
