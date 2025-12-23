"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/hooks/usePermissions";
import { Permissions } from "@/lib/rbac/permissions";

type NavItem = {
  label: string;
  href: string;
  required?: string[];
};

const NAV: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Dashboards",
    items: [
      { label: "Director", href: "/app/dashboard/director", required: [Permissions.READ_FINANCE_DATA] },
      { label: "Sales", href: "/app/dashboard/sales", required: [Permissions.READ_SALES_OVERVIEW] },
      { label: "Marketing", href: "/app/dashboard/marketing", required: [Permissions.READ_MARKETING_DATA] },
      { label: "Operations", href: "/app/dashboard/ops", required: [Permissions.READ_OPS_DATA] },
      { label: "Finance", href: "/app/dashboard/finance", required: [Permissions.READ_FINANCE_DATA] },
      { label: "Admin", href: "/app/dashboard/admin", required: [Permissions.READ_USERS] },
    ],
  },
  {
    label: "Modules",
    items: [
      { label: "Master Data", href: "/app/modules/master-data", required: [Permissions.MANAGE_MASTER_DATA] },
      { label: "Users", href: "/app/modules/users", required: [Permissions.READ_USERS] },
      { label: "Roles", href: "/app/modules/roles", required: [Permissions.READ_ROLES] },
      { label: "Audit Logs", href: "/app/modules/audit-logs", required: [Permissions.READ_AUDIT_LOGS] },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { permissions, loading } = usePermissions();

  const canSee = (required?: string[]) => {
    if (!required || required.length === 0) return true;
    if (loading) return false;
    return required.some((p) => permissions.includes(p));
  };

  return (
    <nav className="space-y-5">
      {NAV.map((section) => {
        const visible = section.items.filter((i) => canSee(i.required));
        if (visible.length === 0) return null;

        return (
          <div key={section.label}>
            <div className="px-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
              {section.label}
            </div>
            <div className="mt-2 space-y-1">
              {visible.map((item) => {
                const active =
                  pathname === item.href ||
                  (pathname.startsWith(item.href + "/") && item.href !== "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-xl px-3 py-2 text-sm ${
                      active ? "bg-gray-900 text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </nav>
  );
}

// Export default juga, supaya aman kalau ada file lain yang import default
export default SidebarNav;
