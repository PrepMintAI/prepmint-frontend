// src/components/layout/InstitutionDashboardLayout.tsx
"use client";

import { useState } from "react";
import InstitutionDashboardSidebar from "./InstitutionDashboardSidebar";
import InstitutionDashboardHeader from "./InstitutionDashboardHeader";
import { Menu } from "lucide-react";

export default function InstitutionDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-20 rounded-md bg-emerald-600 p-2 text-white md:hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-expanded={sidebarOpen}
        aria-controls="sidebar"
      >
        <Menu size={24} aria-hidden="true" />
        <span className="sr-only">Toggle sidebar</span>
      </button>

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={`fixed left-0 top-0 z-10 h-full w-64 transform bg-emerald-700 text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <InstitutionDashboardSidebar />
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-0">
        <InstitutionDashboardHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-0 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
}
