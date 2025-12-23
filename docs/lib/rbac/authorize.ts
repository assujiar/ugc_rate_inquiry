import type { User } from '@supabase/supabase-js';
import { createServiceSupabaseClient } from '@/lib/supabase/server';
import type { Permission } from './permissions';

/**
 * Checks whether the given user has a specific permission. This function
 * queries the `profiles`, `role_permissions`, and `permissions` tables to
 * determine if the user's role grants the requested permission. Returns
 * `false` if the user is null or no mapping exists.
 *
 * @param user The current authenticated user (from session).
 * @param permission The permission to check.
 */
export async function authorize(user: User | null | undefined, permission: Permission): Promise<boolean> {
  if (!user) {
    return false;
  }
  const supabase = createServiceSupabaseClient();
  // Fetch the user's role ID from the profiles table
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role_id')
    .eq('id', user.id)
    .maybeSingle();
  if (profileErr || !profile) {
    return false;
  }
  const roleId = profile.role_id;
  // Query role_permissions joined with permissions to see if the role grants the permission
  const { data: perms, error: permsErr } = await supabase
    .from('role_permissions')
    .select('permission:permission_id (name)')
    .eq('role_id', roleId)
    .eq('permission.name', permission);
  if (permsErr) {
    return false;
  }
  return Array.isArray(perms) && perms.length > 0;
}