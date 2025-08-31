// /src/components/layout/DashboardLayout.tsx

"use client";


import React, { useState, useEffect } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userName, setUserName] = useState(''); // 👈 dynamic user name

  // 👇 TODO: Replace with real API call to fetch authenticated user details
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Example:
        // const res = await fetch('/api/user/profile');
        // const data = await res.json();
        // setUserName(data.name);
        
        setUserName('Alex'); // Fallback/demo name
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setUserName('User'); // Default fallback
      }
    };

    fetchUserProfile();
  }, []);

  return (
    <div className="flex h-screen">
      <DashboardSidebar collapsed={isSidebarCollapsed} setCollapsed={setIsSidebarCollapsed} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader isSidebarCollapsed={isSidebarCollapsed} userName={userName} />
        <main className="flex-1 p-4 overflow-y-auto bg-gray-50">
          {/* 👇 Main content will be rendered here */}
          {children}
        </main>
      </div>
    </div>
  );
}


/*

🔌 Suggested Backend Linking Points
Feature	Endpoint	Usage
Authenticated user	/api/user/profile	For userName in header
Layout preferences	/api/user/preferences	Sidebar state, themes, etc.

*/