// src/components/layout/B2BDashboardLayout.tsx
"use client";

import { useState } from "react";
import B2BDashboardSidebar from "./B2BDashboardSidebar";
import B2BDashboardHeader from "./B2BDashboardHeader";
import { Menu } from "lucide-react";

export default function B2BDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-20 rounded-md bg-[#41D786] p-2 text-white md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-10 h-full w-64 transform bg-[#41D786] transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <B2BDashboardSidebar />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-0">
        <B2BDashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-0 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}