import { Navigation } from "@/components/ui/navigation";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-ui-background">
      <Navigation />
      <main className="carbon-grid py-8">{children}</main>
    </div>
  );
}
