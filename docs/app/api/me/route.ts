import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createRouteHandlerSupabaseClient } from '@supabase/auth-helpers-nextjs';

/**
 * GET /api/me
 * Returns: { user, profile, permissions }
 *
 * - Profile stored in public.profiles (id = auth user id).
 * - Permissions derived from role_permissions -> permissions.
 * - If profile does not exist, auto-provision with role 'salesperson' (if available).
 */
export async function GET() {
  const supabase = createRouteHandlerSupabaseClient({ cookies });

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (!user || userError) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Load profile + role name
  let { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, role_id, is_active, roles(name)')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 });
  }

  // Auto-provision profile if missing
  if (!profile) {
    const defaultRole = await supabase.from('roles').select('id').eq('name', 'salesperson').maybeSingle();

    const ins = await supabase
      .from('profiles')
      .insert({
        id: user.id,
        full_name: user.email ? user.email.split('@')[0] : null,
        role_id: defaultRole.data?.id ?? null,
        is_active: true,
      })
      .select('id, full_name, avatar_url, role_id, is_active, roles(name)')
      .single();

    if (ins.error) {
      return NextResponse.json({ error: ins.error.message }, { status: 500 });
    }

    profile = ins.data as any;
  }

  if (profile?.is_active === false) {
    return NextResponse.json({ error: 'Account is inactive' }, { status: 403 });
  }

  // Load permissions from role
  let permissions: string[] = [];
  if (profile?.role_id) {
    const { data: rows, error: permError } = await supabase
      .from('role_permissions')
      .select('permissions(name)')
      .eq('role_id', profile.role_id);

    if (permError) {
      return NextResponse.json({ error: permError.message }, { status: 500 });
    }

    permissions = (rows ?? [])
      .map((r: any) => r?.permissions?.name)
      .filter(Boolean);
  }

  return NextResponse.json({
    user: { id: user.id, email: user.email },
    profile: {
      id: profile.id,
      full_name: profile.full_name ?? null,
      avatar_url: profile.avatar_url ?? null,
      role_id: profile.role_id ?? null,
      role_name: profile.roles?.name ?? null,
    },
    permissions,
  });
}