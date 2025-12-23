"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMeServer, hasPermission } from "@/lib/auth/me";

function requireRoleAdmin(me: any) {
  if (!me) throw new Error("unauthorized");
  if (!hasPermission(me, "manage_roles")) throw new Error("forbidden");
}

export async function createRoleAction(formData: FormData) {
  const me = await getMeServer();
  requireRoleAdmin(me);

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isManager = String(formData.get("is_manager") ?? "") === "on";

  if (!name) throw new Error("missing name");

  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("roles")
    .insert({ name, description: description || null, is_manager: isManager })
    .select("id")
    .single();

  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    actor_id: me.profile.id,
    action: "create_role",
    table_name: "roles",
    record_id: data.id,
    changes: { name, description: description || null, is_manager: isManager },
  });

  revalidatePath("/app/modules/roles");
}

export async function updateRoleAction(formData: FormData) {
  const me = await getMeServer();
  requireRoleAdmin(me);

  const roleId = String(formData.get("role_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const isManager = String(formData.get("is_manager") ?? "") === "on";

  if (!roleId) throw new Error("missing role_id");
  if (!name) throw new Error("missing name");

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("roles")
    .update({ name, description: description || null, is_manager: isManager })
    .eq("id", roleId);

  if (error) throw new Error(error.message);

  await supabase.from("audit_logs").insert({
    actor_id: me.profile.id,
    action: "update_role",
    table_name: "roles",
    record_id: roleId,
    changes: { name, description: description || null, is_manager: isManager },
  });

  revalidatePath("/app/modules/roles");
  revalidatePath("/app/modules/roles/" + roleId);
}

export async function setRolePermissionsAction(formData: FormData) {
  const me = await getMeServer();
  requireRoleAdmin(me);

  const roleId = String(formData.get("role_id") ?? "");
  if (!roleId) throw new Error("missing role_id");

  const selected = formData.getAll("permission_id").map((x) => String(x));

  const supabase = await createSupabaseServerClient();

  // Replace set (simple, sequential)
  const del = await supabase.from("role_permissions").delete().eq("role_id", roleId);
  if (del.error) throw new Error(del.error.message);

  if (selected.length > 0) {
    const rows = selected.map((pid) => ({ role_id: roleId, permission_id: pid }));
    const ins = await supabase.from("role_permissions").insert(rows);
    if (ins.error) throw new Error(ins.error.message);
  }

  await supabase.from("audit_logs").insert({
    actor_id: me.profile.id,
    action: "set_role_permissions",
    table_name: "role_permissions",
    record_id: null,
    changes: { role_id: roleId, permission_ids: selected },
  });

  revalidatePath("/app/modules/roles/" + roleId);
}
