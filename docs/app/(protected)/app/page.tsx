import { redirect } from "next/navigation";
import { getMeServer } from "@/lib/auth/me";

export default async function AppIndexPage() {
  const me = await getMeServer();
  if (!me) redirect("/login?redirectTo=/app");

  switch (me.profile.role_name) {
    case "director":
      redirect("/app/dashboard/director");
    case "admin":
      redirect("/app/dashboard/admin");
    case "sales":
      redirect("/app/dashboard/sales");
    case "marketing":
      redirect("/app/dashboard/marketing");
    case "ops":
      redirect("/app/dashboard/ops");
    case "finance":
      redirect("/app/dashboard/finance");
    default:
      redirect("/app/no-access");
  }
}
