import { redirect } from "next/navigation";
import { getMeServer, hasPermission } from "@/lib/auth/me";

export default async function OpsDashboard() {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/dashboard/ops");

  if (!hasPermission(me, "read_ops_data")) {
    redirect("/app/no-access");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Operations Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">Next: /app/api/ops/overview + advanced filters.</p>
    </div>
  );
}
