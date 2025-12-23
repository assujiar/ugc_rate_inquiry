import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMeServer, hasPermission } from "@/lib/auth/me";
import { setRolePermissionsAction, updateRoleAction } from "../actions";

export default async function RoleDetailPage({ params }: { params: { id: string } }) {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/modules/roles/" + params.id);
  if (!hasPermission(me, "read_roles")) redirect("/app/no-access");

  const supabase = await createSupabaseServerClient();

  const roleRes = await supabase
    .from("roles")
    .select("id,name,description,is_manager")
    .eq("id", params.id)
    .maybeSingle<any>();

  if (!roleRes.data) redirect("/app/modules/roles");

  const permsRes = await supabase
    .from("permissions")
    .select("id,name,description")
    .order("name", { ascending: true });

  const assignedRes = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", params.id);

  const perms = (permsRes.data ?? []) as any[];
  const assigned = new Set((assignedRes.data ?? []).map((x: any) => String(x.permission_id)));

  const canManage = hasPermission(me, "manage_roles") && hasPermission(me, "manage_permissions");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Role Detail</h1>
          <div className="mt-1 text-sm text-gray-600">Edit role and permissions</div>
        </div>
        <Link className="text-sm font-medium text-gray-900 underline" href="/app/modules/roles">
          Back to Roles
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">Role Info</div>

        {canManage ? (
          <form action={updateRoleAction} className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
            <input type="hidden" name="role_id" value={params.id} />

            <div>
              <div className="text-xs font-medium text-gray-600">Name</div>
              <input
                name="name"
                defaultValue={roleRes.data.name}
                className="mt-1 h-9 w-full rounded-xl border border-gray-200 px-3 text-sm"
              />
            </div>

            <div>
              <div className="text-xs font-medium text-gray-600">Description</div>
              <input
                name="description"
                defaultValue={roleRes.data.description ?? ""}
                className="mt-1 h-9 w-full rounded-xl border border-gray-200 px-3 text-sm"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                name="is_manager"
                defaultChecked={!!roleRes.data.is_manager}
                className="h-4 w-4"
              />
              <span className="text-sm text-gray-700">Manager</span>
            </div>

            <div className="md:col-span-3">
              <button className="h-9 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white">
                Save Role
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-2 text-sm text-gray-700">
            Name: <span className="font-medium">{roleRes.data.name}</span>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">Permissions</div>
        <div className="mt-1 text-xs text-gray-500">
          Checklist → submit will replace permission set for this role
        </div>

        {canManage ? (
          <form action={setRolePermissionsAction} className="mt-3 space-y-3">
            <input type="hidden" name="role_id" value={params.id} />

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {perms.map((p) => (
                <label key={p.id} className="flex items-start gap-2 rounded-xl border border-gray-200 p-3">
                  <input
                    type="checkbox"
                    name="permission_id"
                    value={p.id}
                    defaultChecked={assigned.has(String(p.id))}
                    className="mt-1 h-4 w-4"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.description ?? "-"}</div>
                  </div>
                </label>
              ))}
            </div>

            <button className="h-9 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white">
              Save Permissions
            </button>
          </form>
        ) : (
          <div className="mt-3 text-sm text-gray-700">
            Anda tidak memiliki permission untuk mengubah role/permission.
          </div>
        )}
      </div>
    </div>
  );
}