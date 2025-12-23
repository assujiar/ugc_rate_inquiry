import type { Permission } from '@/lib/rbac/permissions';
import type { Role } from '@/lib/rbac/roles';

export interface RoleDefinition {
  id: string;
  name: Role;
  description: string | null;
}

export interface PermissionDefinition {
  id: string;
  name: Permission;
  description: string | null;
}

export interface RolePermission {
  role_id: string;
  permission_id: string;
}