export interface Bill {
  tenant_customer_id: string;
  currency_id: number;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  billed_at: Date;
}

export interface FullBill extends Bill {
  bill_id: string;
  updated_at: string;
}
