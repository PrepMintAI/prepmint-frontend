// /src/app/dashboard/page.tsx
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase.admin";
import DashboardLayout from "@/components/layout/DashboardLayout";
import XPCard from "@/components/dashboard/XPCard";
import StreakTracker from "@/components/dashboard/StreakTracker";
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap";
import SubjectProgress from "@/components/dashboard/SubjectProgress";
import UpcomingTests from "@/components/dashboard/UpcomingTests";
import { DashboardClient } from "./DashboardClient"; // 👈 we'll create this

export default async function DashboardPage() {
  const cookie = (await cookies()).get("__session")?.value;
  let userEmail = "guest";

  try {
    if (cookie) {
      const decoded = await adminAuth.verifySessionCookie(cookie, true);
      userEmail = decoded.email ?? decoded.uid;
    }
  } catch {
    // invalid / expired cookie → treat as guest
  }

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Learning Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome <span className="font-medium">{userEmail}</span> — track your progress and achievements
            </p>
          </div>
        </div>

        {/* 👇 Client-side dashboard logic (timeRange, data fetching, etc.) */}
        <DashboardClient />
      </div>
    </DashboardLayout>
  );
}
