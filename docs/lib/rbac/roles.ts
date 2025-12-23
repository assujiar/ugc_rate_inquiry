/**
 * Defines role names used in the application. Roles map to a set of
 * permissions via the `role_permissions` table in the database. Keep this list
 * consistent with seed data.
 */
export const Roles = {
  DIRECTOR: 'director',
  ADMIN: 'admin',
  SALES: 'sales',
  MARKETING: 'marketing',
  OPS: 'ops',
  FINANCE: 'finance'
} as const;

export type RoleKey = keyof typeof Roles;
export type Role = (typeof Roles)[RoleKey];