"use client";
import SidebarNav from './SidebarNav';
import UserPanel from './UserPanel';

/**
 * Sidebar component visible on medium and larger screens. It contains
 * navigation links and a user panel. On smaller screens the sidebar
 * is hidden; consider implementing a drawer in the future for
 * mobile navigation.
 */
export default function Sidebar() {
  return (
    <aside className="hidden md:flex md:flex-col w-64 h-screen bg-gray-50 border-r border-gray-200">
      <div className="flex-1 overflow-y-auto p-4">
        <SidebarNav />
      </div>
      <div className="border-t border-gray-200 p-4">
        <UserPanel />
      </div>
    </aside>
  );
}