// src/app/dashboard/b2b/layout.tsx
import B2BDashboardLayout from "@/components/layout/B2BDashboardLayout";

export default function B2BDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <B2BDashboardLayout>{children}</B2BDashboardLayout>;
}