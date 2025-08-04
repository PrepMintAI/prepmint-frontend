// src/components/layout/B2BDashboardSidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  //BarChart,
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
    href: "/dashboard/b2b/question-paper-generator",
    icon: FileText,
  },
  {
    name: "Paper Checking",
    href: "/dashboard/b2b/paper-checking",
    icon: CheckCircle,
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
    <div className="flex h-full flex-col bg-emerald-700 text-white">
      <div className="p-6">
        <h1 className="text-2xl font-bold">PrepMint Hub</h1>
        <p className="text-sm text-emerald-100">Institution Dashboard</p>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-semibold border-l-4 border-blue-500"
                      : "text-white hover:bg-emerald-600"
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

      <div className="p-4 text-center text-sm text-emerald-100">
        © PrepMint {new Date().getFullYear()}
      </div>
    </div>
  );
}