import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable } from "@/components/ui/data-table";
import { MetricCard } from "@/components/ui/metric-card";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowLeft,
  Download,
  Refresh,
  ExternalLink,
  Container,
  Calendar
} from "lucide-react";
import { Link } from "react-router-dom";

export default function ScanResults() {
  // Mock scan result data
  const scanInfo = {
    name: "nginx:1.21-alpine",
    type: "Docker Image",
    status: "Completed",
    scanTime: "2024-01-15 14:30:00 UTC",
    duration: "3m 45s",
    scanId: "scan-abc123"
  };

  const summaryMetrics = [
    {
      title: "Total Vulnerabilities",
      value: "47",
      change: "",
      changeType: "neutral" as const,
      icon: AlertTriangle
    },
    {
      title: "Critical",
      value: "3",
      change: "",
      changeType: "negative" as const,
      icon: AlertTriangle
    },
    {
      title: "High",
      value: "12",
      change: "",
      changeType: "negative" as const,
      icon: AlertTriangle
    },
    {
      title: "Medium/Low",
      value: "32",
      change: "",
      changeType: "neutral" as const,
      icon: CheckCircle
    }
  ];

  const vulnerabilities = [
    {
      cve: "CVE-2023-38545",
      severity: "Critical",
      score: "9.8",
      component: "curl",
      version: "7.74.0",
      fixedVersion: "8.4.0",
      description: "SOCKS5 heap buffer overflow vulnerability in libcurl",
      publishedDate: "2023-10-11",
      vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H"
    },
    {
      cve: "CVE-2023-4911",
      severity: "High",
      score: "7.8",
      component: "glibc",
      version: "2.31",
      fixedVersion: "2.38",
      description: "Buffer overflow vulnerability in GNU C Library's ld.so",
      publishedDate: "2023-10-03",
      vector: "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:H/I:H/A:H"
    },
    {
      cve: "CVE-2023-39325",
      severity: "High",
      score: "7.5",
      component: "golang.org/x/net",
      version: "0.10.0",
      fixedVersion: "0.17.0",
      description: "HTTP/2 rapid reset vulnerability",
      publishedDate: "2023-10-10",
      vector: "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:N/I:N/A:H"
    },
    {
      cve: "CVE-2023-29491",
      severity: "Medium",
      score: "5.3",
      component: "ncurses",
      version: "6.2",
      fixedVersion: "6.4",
      description: "Local privilege escalation in ncurses",
      publishedDate: "2023-04-12",
      vector: "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:L/I:L/A:L"
    },
    {
      cve: "CVE-2023-28484",
      severity: "Low",
      score: "3.3",
      component: "libxml2",
      version: "2.9.10",
      fixedVersion: "2.10.4",
      description: "NULL pointer dereference in xmlSchemaFixupComplexType",
      publishedDate: "2023-03-22",
      vector: "CVSS:3.1/AV:L/AC:L/PR:L/UI:N/S:U/C:N/I:N/A:L"
    }
  ];

  const vulnerabilityColumns = [
    { key: "cve", label: "CVE ID" },
    { key: "severity", label: "Severity" },
    { key: "score", label: "CVSS Score" },
    { key: "component", label: "Component" },
    { key: "version", label: "Current Version" },
    { key: "fixedVersion", label: "Fixed Version" },
    { key: "publishedDate", label: "Published" }
  ];

  const layerAnalysis = [
    {
      layer: "Base Image (alpine:3.16)",
      vulnerabilities: "15",
      critical: "1",
      high: "4",
      medium: "8",
      low: "2"
    },
    {
      layer: "nginx:1.21",
      vulnerabilities: "32",
      critical: "2",
      high: "8",
      medium: "18",
      low: "4"
    },
    {
      layer: "Application Layer",
      vulnerabilities: "0",
      critical: "0",
      high: "0",
      medium: "0",
      low: "0"
    }
  ];

  const layerColumns = [
    { key: "layer", label: "Layer" },
    { key: "vulnerabilities", label: "Total" },
    { key: "critical", label: "Critical" },
    { key: "high", label: "High" },
    { key: "medium", label: "Medium" },
    { key: "low", label: "Low" }
  ];

  return (
    <DashboardLayout>
      <div className="col-span-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              to="/" 
              className="flex items-center space-x-2 text-interactive-01 hover:text-interactive-03 carbon-type-body-01"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="carbon-type-productive-heading-04 text-text-01 mb-2">
                Scan Results: {scanInfo.name}
              </h1>
              <div className="flex items-center space-x-6 carbon-type-body-01 text-text-02">
                <div className="flex items-center space-x-2">
                  <Container className="h-4 w-4" />
                  <span>{scanInfo.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{scanInfo.scanTime}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Duration: {scanInfo.duration}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="inline-flex items-center px-2 py-1 rounded carbon-type-label-01 font-medium bg-support-02 text-white">
                    {scanInfo.status}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 border border-ui-04 text-text-01 rounded carbon-type-body-01 hover:bg-ui-01 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-interactive-01 text-white rounded carbon-type-body-01 hover:bg-interactive-03 transition-colors">
                <Refresh className="h-4 w-4" />
                <span>Rescan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryMetrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Vulnerabilities Table */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h2 className="carbon-type-productive-heading-03 text-text-01 mb-4">
                Vulnerability Details
              </h2>
              <DataTable columns={vulnerabilityColumns} data={vulnerabilities} />
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Scan Information */}
            <div className="bg-layer-01 border border-ui-03 rounded p-6">
              <h3 className="carbon-type-productive-heading-02 text-text-01 mb-4">
                Scan Information
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="carbon-type-label-01 text-text-02">Scan ID</p>
                  <p className="carbon-type-body-01 text-text-01 font-mono">{scanInfo.scanId}</p>
                </div>
                <div>
                  <p className="carbon-type-label-01 text-text-02">Scanner Version</p>
                  <p className="carbon-type-body-01 text-text-01">SecureScan v2.1.0</p>
                </div>
                <div>
                  <p className="carbon-type-label-01 text-text-02">Database Updated</p>
                  <p className="carbon-type-body-01 text-text-01">2024-01-15 12:00 UTC</p>
                </div>
                <div>
                  <p className="carbon-type-label-01 text-text-02">Image Size</p>
                  <p className="carbon-type-body-01 text-text-01">142.5 MB</p>
                </div>
              </div>
            </div>

            {/* Remediation Summary */}
            <div className="bg-layer-01 border border-ui-03 rounded p-6">
              <h3 className="carbon-type-productive-heading-02 text-text-01 mb-4">
                Remediation Priority
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-support-01 rounded">
                  <span className="carbon-type-body-01 text-white">Critical Issues</span>
                  <span className="carbon-type-productive-heading-02 text-white">3</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-support-03 rounded">
                  <span className="carbon-type-body-01 text-text-01">High Priority</span>
                  <span className="carbon-type-productive-heading-02 text-text-01">12</span>
                </div>
                <button className="w-full flex items-center justify-center space-x-2 p-3 border border-interactive-01 text-interactive-01 rounded carbon-type-body-01 hover:bg-ui-01 transition-colors">
                  <ExternalLink className="h-4 w-4" />
                  <span>View Remediation Guide</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Layer Analysis */}
        <div className="mt-8">
          <h2 className="carbon-type-productive-heading-03 text-text-01 mb-6">
            Layer-by-Layer Analysis
          </h2>
          <DataTable columns={layerColumns} data={layerAnalysis} />
        </div>
      </div>
    </DashboardLayout>
  );
}
