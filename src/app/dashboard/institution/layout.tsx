// src/app/dashboard/institution/layout.tsx
import InstitutionDashboardLayout from "@/components/layout/InstitutionDashboardLayout";

export default function InstitutionDashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InstitutionDashboardLayout>{children}</InstitutionDashboardLayout>;
}
