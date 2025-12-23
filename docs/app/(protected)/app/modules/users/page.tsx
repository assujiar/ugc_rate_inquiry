import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMeServer, hasPermission } from "@/lib/auth/me";
import { updateUserRoleAction, toggleUserActiveAction } from "./actions";

export default async function UsersModulePage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/modules/users");
  if (!hasPermission(me, "read_users")) redirect("/app/no-access");

  const supabase = await createSupabaseServerClient();

  const q = (searchParams.q ?? "").trim();

  let profilesQuery = supabase
    .from("profiles")
    .select("id, full_name, avatar_url, role_id, is_active, created_at, roles(name)")
    .order("created_at", { ascending: false });

  if (q) profilesQuery = profilesQuery.ilike("full_name", "%" + q + "%");

  const profilesRes = await profilesQuery;
  const rolesRes = await supabase.from("roles").select("id,name,is_manager").order("name", { ascending: true });

  const profiles = (profilesRes.data ?? []) as any[];
  const roles = (rolesRes.data ?? []) as any[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Users</h1>
          <div className="mt-1 text-sm text-gray-600">Manage user profiles, roles, and activation</div>
        </div>

        <form className="flex items-end gap-2" method="get">
          <div>
            <div className="text-xs font-medium text-gray-600">Search (Full name)</div>
            <input
              name="q"
              defaultValue={q}
              className="mt-1 h-9 w-64 rounded-xl border border-gray-200 px-3 text-sm"
              placeholder="e.g. Ari"
            />
          </div>
          <button className="h-9 rounded-xl bg-gray-900 px-4 text-sm font-medium text-white">Search</button>
          <a className="h-9 rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center" href="/app/modules/users">
            Reset
          </a>
        </form>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">Profiles</div>
        <div className="mt-3 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Active</th>
                <th className="py-2 pr-3">User ID</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const roleName = p?.roles?.name ?? "-";
                const canManage = hasPermission(me, "manage_users");

                return (
                  <tr key={p.id} className="border-t border-gray-100 align-top">
                    <td className="py-3 pr-3">
                      <div className="font-medium text-gray-900">{p.full_name ?? "(no name)"}</div>
                    </td>

                    <td className="py-3 pr-3">
                      <div className="text-gray-700">{roleName}</div>

                      {canManage ? (
                        <form action={updateUserRoleAction} className="mt-2 flex items-center gap-2">
                          <input type="hidden" name="user_id" value={p.id} />
                          <select
                            name="role_id"
                            defaultValue={p.role_id ?? ""}
                            className="h-9 rounded-xl border border-gray-200 px-3 text-sm"
                          >
                            <option value="">(none)</option>
                            {roles.map((r) => (
                              <option key={r.id} value={r.id}>
                                {r.name}{r.is_manager ? " (manager)" : ""}
                              </option>
                            ))}
                          </select>
                          <button className="h-9 rounded-xl bg-gray-900 px-3 text-sm font-medium text-white">
                            Save
                          </button>
                        </form>
                      ) : null}
                    </td>

                    <td className="py-3 pr-3">
                      <div className={p.is_active ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                        {p.is_active ? "Active" : "Inactive"}
                      </div>
                    </td>

                    <td className="py-3 pr-3">
                      <code className="text-xs text-gray-600">{p.id}</code>
                    </td>

                    <td className="py-3 pr-3">
                      {canManage ? (
                        <form action={toggleUserActiveAction} className="flex items-center gap-2">
                          <input type="hidden" name="user_id" value={p.id} />
                          <input type="hidden" name="next_active" value={p.is_active ? "false" : "true"} />
                          <button className="h-9 rounded-xl border border-gray-200 px-3 text-sm font-medium text-gray-700 hover:bg-gray-50">
                            {p.is_active ? "Deactivate" : "Activate"}
                          </button>
                        </form>
                      ) : (
                        <div className="text-xs text-gray-500">No permission</div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {profiles.length === 0 ? (
                <tr className="border-t border-gray-100">
                  <td className="py-3 text-sm text-gray-500" colSpan={5}>
                    No profiles found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Catatan: email tidak ditampilkan karena schema profiles tidak menyimpan email (email ada di auth.users).
        </div>
      </div>
    </div>
  );
}
