// src/components/layout/B2BDashboardHeader.tsx
"use client";

import { Bell, User } from "lucide-react";

export default function B2BDashboardHeader() {
  return (
    <header className="flex items-center justify-between border-b bg-white p-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Institution Dashboard</h2>
        <p className="text-sm text-gray-500">Welcome back, Admin</p>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 hover:bg-gray-100">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
        </button>
        
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-gray-200 p-2">
            <User size={20} className="text-gray-600" />
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-gray-500">Institution Name</p>
          </div>
        </div>
      </div>
    </header>
  );
}