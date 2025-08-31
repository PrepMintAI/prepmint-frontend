// src/components/layout/InstitutionDashboardSidebar.tsx
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
  { name: "Dashboard", href: "/dashboard/institution", icon: Home },
  {
    name: "Question Generator",
    href: "/dashboard/institution/question-paper-generator",
    icon: FileText,
  },
  {
    name: "Paper Checking",
    href: "/dashboard/institution/paper-checking",
    icon: CheckCircle,
  },
  {
    name: "Student Manager",
    href: "/dashboard/institution/student-manager",
    icon: UserPlus,
  },
  {
    name: "Curriculum Tools",
    href: "/dashboard/institution/curriculum",
    icon: BookCheck,
  },
  { name: "Settings", href: "/dashboard/institution/settings", icon: Settings },
];

export default function InstitutionDashboardSidebar() {
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
