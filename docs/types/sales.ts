export interface SalesLead {
  id: string;
  owner_id: string;
  company: string;
  contact_name: string | null;
  stage_id: string;
  expected_value: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SalesPipelineStage {
  id: string;
  name: string;
  sequence: number;
  is_active: boolean;
}

export interface SalesActivity {
  id: string;
  lead_id: string;
  type: string;
  note: string | null;
  activity_date: string;
  created_at: string;
}

export interface SalesReason {
  id: string;
  name: string;
  category: string;
  is_active: boolean;
}