import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type Me = {
  user: { id: string; email: string | null };
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role_id: string | null;
    role_name: string | null;
    is_active: boolean;
  };
  permissions: string[];
};

export async function getMeServer(): Promise<Me | null> {
  try {
    const supabase = await createSupabaseServerClient();

    const { data: userData, error: userErr } = await supabase.auth.getUser();
    const user = userData?.user;

    if (userErr || !user) return null;

    const { data: profile, error: profErr } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url, role_id, is_active, roles(name)")
      .eq("id", user.id)
      .maybeSingle<any>();

    if (profErr || !profile || profile.is_active === false) return null;

    let permissions: string[] = [];
    if (profile.role_id) {
      const { data: rp, error: rpErr } = await supabase
        .from("role_permissions")
        .select("permissions(name)")
        .eq("role_id", profile.role_id);

      if (rpErr) return null;

      permissions =
        (rp ?? [])
          .map((x: any) => x?.permissions?.name)
          .filter((x: any) => typeof x === "string") ?? [];
    }

    return {
      user: { id: user.id, email: user.email ?? null },
      profile: {
        id: profile.id,
        full_name: profile.full_name ?? null,
        avatar_url: profile.avatar_url ?? null,
        role_id: profile.role_id ?? null,
        role_name: profile.roles?.name ?? null,
        is_active: !!profile.is_active,
      },
      permissions,
    };
  } catch {
    return null;
  }
}

export function hasPermission(me: Me, permission: string) {
  return me.permissions.includes(permission);
}
