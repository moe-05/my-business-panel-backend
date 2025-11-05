export interface Client {
  client_id: string;
  tenant_id: string;
  first_name: string;
  last_name: string;
  document_type_id: number;
  email: string;
  phone: string;
  birthdate?: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}