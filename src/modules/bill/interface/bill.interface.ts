export interface Bill {
  tenant_customer_id: string;
  currency_id: number;
  subtotal_amount: number;
  tax_amount: number;
  total_amount: number;
  billed_at: Date;
  updated_at: Date;
  sale_id: string;
}

export interface FullBill extends Bill {
  bill_id: string;
}

export interface BillDB {
  tenant_name: string;
  first_name: string;
  last_name: string;
  document_number: string;
  email: string;
  subtotal_amount: number;
  total_amount: number;
  billed_at: string | any;
}
