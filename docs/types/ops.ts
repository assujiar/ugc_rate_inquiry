export interface OpsTicket {
  id: string;
  reporter_id: string;
  assignee_id: string | null;
  status_id: string;
  priority: string;
  subject: string;
  description: string;
  sla_id: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
}

export interface OpsSla {
  id: string;
  name: string;
  resolution_target_hours: number;
  priority_level: string;
}

export interface OpsTicketStatus {
  id: string;
  name: string;
  order: number;
  is_final: boolean;
}