export type UUID = string;

export interface Estimate {
  id: UUID;
  company_id: UUID;
  title: string;
  status: string;
  vat_rate: number;
  subtotal: number;
  vat_amount: number;
  total: number;
  created_at: string;
  updated_at: string;
}

