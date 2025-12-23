import { redirect } from "next/navigation";
import { getMeServer, hasPermission } from "@/lib/auth/me";

export default async function FinanceDashboard() {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/dashboard/finance");

  if (!hasPermission(me, "read_finance_data")) {
    redirect("/app/no-access");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Finance Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">Next: /app/api/finance/overview + AR aging.</p>
    </div>
  );
}
