export const Permissions = {
  // Governance (RBAC)
  READ_USERS: 'read_users',
  MANAGE_USERS: 'manage_users',
  READ_ROLES: 'read_roles',
  MANAGE_ROLES: 'manage_roles',
  READ_PERMISSIONS: 'read_permissions',
  MANAGE_PERMISSIONS: 'manage_permissions',

  // Director
  READ_DIRECTOR_OVERVIEW: 'read_director_overview',

  // Sales
  READ_SALES_OVERVIEW: 'read_sales_overview',
  READ_SALES_PIPELINE: 'read_sales_pipeline',
  READ_SALES_ACTIVITY: 'read_sales_activity',
  READ_SALES_REASONS: 'read_sales_reasons',
  MANAGE_SALES_LEADS: 'manage_sales_leads',

  // Marketing
  READ_MARKETING_DATA: 'read_marketing_data',
  MANAGE_MARKETING_KPI: 'manage_marketing_kpi',
  MANAGE_SEO_SEM: 'manage_seo_sem',
  MANAGE_CONTENT_PIECES: 'manage_content_pieces',
  MANAGE_OFFLINE_EVENTS: 'manage_offline_events',

  // Ops
  READ_OPS_DATA: 'read_ops_data',
  MANAGE_OPS_TICKETS: 'manage_ops_tickets',

  // Finance
  READ_FINANCE_DATA: 'read_finance_data',
  MANAGE_FINANCE_DATA: 'manage_finance_data',

  // Master data (optional module)
  MANAGE_MASTER_DATA: 'manage_master_data',

  // Audit
  READ_AUDIT_LOGS: 'read_audit_logs',
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];

export const PermissionList: Permission[] = Object.values(Permissions);