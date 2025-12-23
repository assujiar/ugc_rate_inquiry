export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
}

export interface FinanceTransaction {
  id: string;
  account_id: string;
  customer_id: string | null;
  amount: number;
  transaction_date: string;
  transaction_type: string;
  description: string | null;
}

export interface ArAging {
  id: string;
  customer_id: string;
  invoice_id: string;
  due_date: string;
  amount_due: number;
  bucket: string;
}

export interface FinanceMargin {
  id: string;
  period: string;
  revenue: number;
  cogs: number;
  margin: number;
}