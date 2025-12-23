import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMeServer, hasPermission } from "@/lib/auth/me";
import { createRoleAction } from "./actions";

export default async function RolesModulePage() {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/modules/roles");
  if (!hasPermission(me, "read_roles")) redirect("/app/no-access");

  const supabase = await createSupabaseServerClient();

  const rolesRes = await supabase.from("roles").select("id,name,description,is_manager,created_at").order("name", { ascending: true });
  const rpRes = await supabase.from("role_permissions").select("role_id");

  const roles = (rolesRes.data ?? []) as any[];
  const rp = (rpRes.data ?? []) as any[];

  const countByRole: Record<string, number> = {};
  for (const r of rp) {
    const k = String(r.role_id);
    countByRole[k] = (countByRole[k] ?? 0) + 1;
  }

  const canManage = hasPermission(me, "manage_roles");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Roles</h1>
          <div className="mt-1 text-sm text-gray-600">Role catalog and permission assignment</div>
        </div>

        {canManage ? (
          <form action={createRoleAction} className="flex flex-wrap items-end gap-2 rounded-2xl border border-gray-200 bg-white p-3">
            <div>
              <div className="text-xs font-medium text-gray-600">Name</div>
              <input name="name" className="mt-1 h-9 w-48 rounded-xl border border-gray-200 px-3 text-sm" placeholder="e.g. admin" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-600">Description</div>
              <input name="description" className="mt-1 h-9 w-64 rounded-xl border border-gray-200 px-3 text-sm" placeholder="Optional" />
            </div>
            <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
              <input type="checkbox" name="is_manager" className="h-4 w-4" />
              Manager
            </label>
            <button className="h-9 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white">Create</button>
          </form>
        ) : null}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">Role List</div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Manager</th>
                <th className="py-2 pr-3">Permissions</th>
                <th className="py-2 pr-3">Description</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((r) => (
                <tr key={r.id} className="border-t border-gray-100">
                  <td className="py-3 pr-3 font-medium text-gray-900">{r.name}</td>
                  <td className="py-3 pr-3">{r.is_manager ? <span className="text-green-700 font-medium">Yes</span> : "No"}</td>
                  <td className="py-3 pr-3">{(countByRole[r.id] ?? 0).toLocaleString()}</td>
                  <td className="py-3 pr-3 text-gray-700">{r.description ?? "-"}</td>
                  <td className="py-3 pr-3">
                    <Link className="text-sm font-medium text-gray-900 underline" href={"/app/modules/roles/" + r.id}>
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}

              {roles.length === 0 ? (
                <tr className="border-t border-gray-100">
                  <td className="py-3 text-sm text-gray-500" colSpan={5}>No roles found.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
