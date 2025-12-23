import { redirect } from "next/navigation";
import { getMeServer, hasPermission } from "@/lib/auth/me";

export default async function MarketingDashboard() {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app/dashboard/marketing");

  if (!hasPermission(me, "read_marketing_data")) {
    redirect("/app/no-access");
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Marketing Dashboard</h1>
      <p className="mt-2 text-sm text-gray-600">Next: /app/api/marketing/overview + advanced filters.</p>
    </div>
  );
}
