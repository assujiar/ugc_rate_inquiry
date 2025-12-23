import { redirect } from "next/navigation";
import { getMeServer, hasPermission } from "@/lib/auth/me";
import { MetricCard } from "@/components/dashboard/MetricCard";

export default async function AdminDashboardPage() {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/dashboard/admin");
  if (!hasPermission(me, "read_users")) redirect("/app/no-access");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
        <div className="mt-1 text-sm text-gray-600">System overview & access control</div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard title="Role" value={me.profile.role_name ?? "-"} subtitle={me.user.email ?? ""} />
        <MetricCard title="Permissions" value={(me.permissions?.length ?? 0).toLocaleString()} subtitle="Assigned to your role" />
        <MetricCard title="User ID" value={me.user.id} subtitle="Auth user id" />
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="text-sm font-semibold text-gray-900">Next (Admin Modules)</div>
        <ul className="mt-2 list-disc pl-5 text-sm text-gray-700 space-y-1">
          <li>Users management</li>
          <li>Roles & permissions editor</li>
          <li>Master data editor</li>
          <li>Audit logs</li>
        </ul>
      </div>
    </div>
  );
}
