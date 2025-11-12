export interface Payment {
  tenant_customer_id: string;
  sale_id?: string;
  payment_method_id: number;
  payment_amount: number;
  payment_date: string;
  currency_id: number;
  verified: boolean;
}
