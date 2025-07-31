// src/components/layout/B2BDashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart,
  BookCheck,
  CheckCircle,
  FileText,
  Home,
  Settings,
  UserPlus,
} from "lucide-react";

const menuItems = [
  { name: "Dashboard", href: "/dashboard/b2b", icon: Home },
  {
    name: "Question Generator",
    href: "/dashboard/b2b/question-generator",
    icon: FileText,
  },
  {
    name: "Paper Checking",
    href: "/dashboard/b2b/paper-checking",
    icon: CheckCircle,
  },
  {
    name: "Analytics",
    href: "/dashboard/b2b/analytics",
    icon: BarChart,
  },
  {
    name: "Student Manager",
    href: "/dashboard/b2b/student-manager",
    icon: UserPlus,
  },
  {
    name: "Curriculum Tools",
    href: "/dashboard/b2b/curriculum",
    icon: BookCheck,
  },
  { name: "Settings", href: "/dashboard/b2b/settings", icon: Settings },
];

export default function B2BDashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-[#047857] text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold">PrepMint Hub</h1>
        <p className="text-sm opacity-80">Institution Dashboard</p>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive
                      ? "bg-white text-[#41D786] shadow-md"
                      : "hover:bg-[#3ac574]"
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="p-4 text-center text-sm opacity-80">
        © PrepMint {new Date().getFullYear()}
      </div>
    </div>
  );
}