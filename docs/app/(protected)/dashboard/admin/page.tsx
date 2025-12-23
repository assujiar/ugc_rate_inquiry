import { redirect } from "next/navigation";
import { getMeServer, hasPermission } from "@/lib/auth/me";

export default async function AdminDashboard() {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/dashboard/admin");

  if (!hasPermission(me, "read_users")) {
    redirect("/app/no-access");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">RBAC OK. Next: management modules (users/roles/permissions).</p>
    </div>
  );
}
