"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMeServer, hasPermission } from "@/lib/auth/me";

function requireAdmin(me: any) {
  if (!me) throw new Error("unauthorized");
  if (!hasPermission(me, "manage_users")) throw new Error("forbidden");
}

export async function updateUserRoleAction(formData: FormData) {
  const me = await getMeServer();
  requireAdmin(me);

  const userId = String(formData.get("user_id") ?? "");
  const roleIdRaw = formData.get("role_id");
  const roleId = roleIdRaw ? String(roleIdRaw) : null;

  if (!userId) throw new Error("missing user_id");

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role_id: roleId })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  // audit
  await supabase.from("audit_logs").insert({
    actor_id: me.profile.id,
    action: "update_user_role",
    table_name: "profiles",
    record_id: userId,
    changes: { role_id: roleId },
  });

  revalidatePath("/app/modules/users");
}

export async function toggleUserActiveAction(formData: FormData) {
  const me = await getMeServer();
  requireAdmin(me);

  const userId = String(formData.get("user_id") ?? "");
  const nextActive = String(formData.get("next_active") ?? "");

  if (!userId) throw new Error("missing user_id");
  if (nextActive !== "true" && nextActive !== "false") throw new Error("invalid next_active");

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("profiles")
    .update({ is_active: nextActive === "true" })
    .eq("id", userId);

  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    actor_id: me.profile.id,
    action: "toggle_user_active",
    table_name: "profiles",
    record_id: userId,
    changes: { is_active: nextActive === "true" },
  });

  revalidatePath("/app/modules/users");
}
