import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

function getKeys() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  return { url, key };
}

export async function GET(req: NextRequest) {
  const { url, key } = getKeys();

  if (!url || !key) {
    return NextResponse.json(
      {
        error: "missing_env",
        required: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
      },
      { status: 500 }
    );
  }

  // tampung cookies hasil refresh agar bisa dipasang ke response final
  const cookiesToSet: Array<{ name: string; value: string; options?: any }> = [];

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return req.cookies.getAll();
      },
      setAll(c) {
        cookiesToSet.push(...c);
      },
    },
  });

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user ?? null;

  if (userErr || !user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role_id, is_active, roles(name)")
    .eq("id", user.id)
    .maybeSingle<any>();

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 500 });
  }
  if (!profile || profile.is_active === false) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let permissions: string[] = [];
  if (profile.role_id) {
    const { data: rp, error: rpErr } = await supabase
      .from("role_permissions")
      .select("permissions(name)")
      .eq("role_id", profile.role_id);

    if (rpErr) {
      return NextResponse.json({ error: rpErr.message }, { status: 500 });
    }

    permissions =
      (rp ?? [])
        .map((x: any) => x?.permissions?.name)
        .filter((x: any) => typeof x === "string") ?? [];
  }

  const out = NextResponse.json({
    user: { id: user.id, email: user.email ?? null },
    profile: {
      id: profile.id,
      full_name: profile.full_name ?? null,
      avatar_url: profile.avatar_url ?? null,
      role_id: profile.role_id ?? null,
      role_name: profile.roles?.name ?? null,
    },
    permissions,
  });

  for (const c of cookiesToSet) {
    out.cookies.set(c.name, c.value, c.options);
  }

  return out;
}
