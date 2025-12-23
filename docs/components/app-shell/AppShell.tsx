import type { ReactNode } from "react";
import SidebarNav from "@/components/navigation/SidebarNav";
import { UserSidebar } from "@/components/navigation/UserSidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-[1400px] p-4">
        <div className="grid grid-cols-12 gap-4">
          <aside className="col-span-12 md:col-span-3 xl:col-span-2">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-3">
              <div className="px-3 py-2">
                <div className="text-sm font-semibold text-gray-900">UGC Dashboard</div>
                <div className="text-xs text-gray-500">Internal</div>
              </div>

              <div className="mt-3">
                <SidebarNav />
              </div>

              <div className="mt-4 border-t border-gray-100 pt-3">
                <UserSidebar />
              </div>
            </div>
          </aside>

          <main className="col-span-12 md:col-span-9 xl:col-span-10">
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
