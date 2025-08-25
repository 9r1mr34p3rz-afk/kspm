import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ScanResults from "./pages/ScanResults";
import { PlaceholderPage } from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/scan/:scanId" element={<ScanResults />} />
          <Route
            path="/kubernetes"
            element={
              <PlaceholderPage
                title="Kubernetes Security Scans"
                description="Monitor and analyze security vulnerabilities in your Kubernetes clusters, including misconfigurations, RBAC issues, and container security."
              />
            }
          />
          <Route
            path="/docker"
            element={
              <PlaceholderPage
                title="Docker Image Security"
                description="Scan Docker images for vulnerabilities, malware, and compliance issues. View detailed reports and remediation guidance."
              />
            }
          />
          <Route
            path="/vulnerabilities"
            element={
              <PlaceholderPage
                title="Vulnerability Management"
                description="Comprehensive view of all security vulnerabilities across your infrastructure with risk prioritization and remediation tracking."
              />
            }
          />
          <Route
            path="/compliance"
            element={
              <PlaceholderPage
                title="Compliance Dashboard"
                description="Track compliance with security standards like CIS, PCI DSS, SOC 2, and custom policies across your container and Kubernetes environments."
              />
            }
          />
          <Route
            path="/settings"
            element={
              <PlaceholderPage
                title="Settings & Configuration"
                description="Configure scan policies, notification settings, integrations, and user management for your security scanning platform."
              />
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
