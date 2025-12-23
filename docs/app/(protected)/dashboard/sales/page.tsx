import { redirect } from "next/navigation";
import { getMeServer, hasPermission } from "@/lib/auth/me";

export default async function SalesDashboard() {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/dashboard/sales");

  if (!hasPermission(me, "read_sales_overview")) {
    redirect("/app/no-access");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Sales Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">Next: /app/api/sales/overview + advanced filters.</p>
    </div>
  );
}
