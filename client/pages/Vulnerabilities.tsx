import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable } from "@/components/ui/data-table";
import {
  Shield,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  Package,
  Server,
  Activity,
  Bug,
  Search,
  Filter,
  Download,
  Eye,
  ExternalLink,
} from "lucide-react";
import { VulnerabilityResponse, Vulnerability, ContainerImage, ClusterVulnerabilityStatus } from "@shared/api";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Vulnerabilities() {
  const [vulnerabilityData, setVulnerabilityData] = useState<VulnerabilityResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedCluster, setSelectedCluster] = useState("all");

  // Mock data based on the provided JSON
  const mockVulnerabilityData: VulnerabilityResponse = {
    valid: true,
    message: "Kubeconfig is valid and all clusters are reachable",
    clusterStatuses: [
      {
        name: "kind-demo-cluster",
        server: "https://127.0.0.1:53266",
        reachable: true,
        nodes: [
          {
            name: "demo-cluster-control-plane",
            kubeletVersion: "v1.29.2",
            containerImages: [
              {
                name: "nginx",
                image: "nginx:1.14.2",
                vulnerabilities: []
              }
            ]
          }
        ],
        apiVersions: ["v1", "apps/v1"],
        permissions: {
          canListNodes: true,
          canListPods: true,
          canGetMetrics: false
        }
      },
      {
        name: "orbstack",
        server: "https://127.0.0.1:26443",
        reachable: true,
        nodes: [
          {
            name: "orbstack",
            kubeletVersion: "v1.31.6+orb1",
            containerImages: [
              {
                name: "coredns",
                image: "rancher/mirrored-coredns-coredns:1.10.1",
                vulnerabilities: [
                  {
                    id: "e5f39a58b76834a13d5dd8121ae98831afa11c22614d8786f5b80435372da241",
                    category: "container_scanning",
                    message: "CVE-2024-51744 on github.com/golang-jwt/jwt@4.2.0",
                    description: "Unclear documentation of the error behavior in `ParseWithClaims` can lead to situation where users are potentially not checking errors in the way they should be.",
                    cve: "CVE-2024-51744",
                    severity: "Low",
                    solution: "Upgrade github.com/golang-jwt/jwt@4.2.0 to 4.5.1"
                  },
                  {
                    id: "824c689a7fb53cede6d9c1269aa17fcf0b52fa019b6928036d17a36917f0f4ae",
                    category: "container_scanning",
                    message: "CVE-2023-24539 on stdlib@1.20",
                    description: "Angle brackets (<>) are not considered dangerous characters when inserted into CSS contexts. Templates containing multiple actions separated by a '/' character can result in unexpectedly closing the CSS context and allowing for injection of unexpected HTML, if executed with untrusted input.",
                    cve: "CVE-2023-24539",
                    severity: "High",
                    solution: "Upgrade stdlib@1.20 to 1.20.4"
                  },
                  {
                    id: "e8e2647c0f4f5ea4aeb9705feec0ceaa15cc701f098fdbc1cde82774cbb6f9ce",
                    category: "container_scanning",
                    message: "CVE-2025-22871 on stdlib@1.20",
                    description: "The net/http package improperly accepts a bare LF as a line terminator in chunked data chunk-size lines. This can permit request smuggling if a net/http server is used in conjunction with a server that incorrectly accepts a bare LF as part of a chunk-ext.",
                    cve: "CVE-2025-22871",
                    severity: "Critical",
                    solution: "Upgrade stdlib@1.20 to 1.23.8"
                  }
                ]
              },
              {
                name: "local-path-provisioner",
                image: "rancher/local-path-provisioner:v0.0.31",
                vulnerabilities: [
                  {
                    id: "65ed24915088521f79395cc77e064ee68a7fe7eddc145a5608e00b53f7362b20",
                    category: "container_scanning",
                    message: "CVE-2025-22866 on stdlib@1.23.5",
                    description: "Due to the usage of a variable time instruction in the assembly implementation of an internal function, a small number of bits of secret scalars are leaked on the ppc64le architecture.",
                    cve: "CVE-2025-22866",
                    severity: "Medium",
                    solution: "Upgrade stdlib@1.23.5 to 1.23.6"
                  },
                  {
                    id: "d99c2f5573ad26710437c59cf84ae96630eee87b9bde3a5420bbc9b2479a9095",
                    category: "container_scanning",
                    message: "CVE-2025-26519 on alpine/musl@1.2.5-r8",
                    description: "",
                    cve: "CVE-2025-26519",
                    severity: "High",
                    solution: "Upgrade alpine/musl@1.2.5-r8 to 1.2.5-r9"
                  }
                ]
              }
            ]
          }
        ],
        apiVersions: ["v1", "apps/v1"],
        permissions: {
          canListNodes: true,
          canListPods: true,
          canGetMetrics: false
        }
      }
    ]
  };

  useEffect(() => {
    // Simulate loading the data
    setIsLoading(true);
    setTimeout(() => {
      setVulnerabilityData(mockVulnerabilityData);
      setLastUpdated(new Date());
      setIsLoading(false);
    }, 1000);
  }, []);

  // Calculate metrics
  const getAllVulnerabilities = (): Array<Vulnerability & { clusterName: string; containerName: string; image: string }> => {
    if (!vulnerabilityData) return [];

    const allVulns: Array<Vulnerability & { clusterName: string; containerName: string; image: string }> = [];
    
    vulnerabilityData.clusterStatuses.forEach(cluster => {
      cluster.nodes.forEach(node => {
        node.containerImages.forEach(container => {
          if (container.vulnerabilities) {
            container.vulnerabilities.forEach(vuln => {
              allVulns.push({
                ...vuln,
                clusterName: cluster.name,
                containerName: container.name,
                image: container.image
              });
            });
          }
        });
      });
    });

    return allVulns;
  };

  const allVulnerabilities = getAllVulnerabilities();
  
  // Filter vulnerabilities
  const filteredVulnerabilities = allVulnerabilities.filter(vuln => {
    const matchesSearch = 
      vuln.cve.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.containerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vuln.image.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = severityFilter === "all" || vuln.severity === severityFilter;
    const matchesCluster = selectedCluster === "all" || vuln.clusterName === selectedCluster;
    
    return matchesSearch && matchesSeverity && matchesCluster;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "bg-red-500 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-yellow-500 text-black";
      case "Low":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const criticalCount = allVulnerabilities.filter(v => v.severity === "Critical").length;
  const highCount = allVulnerabilities.filter(v => v.severity === "High").length;
  const mediumCount = allVulnerabilities.filter(v => v.severity === "Medium").length;
  const lowCount = allVulnerabilities.filter(v => v.severity === "Low").length;

  const metrics = [
    {
      title: "Total Vulnerabilities",
      value: allVulnerabilities.length.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: Bug,
    },
    {
      title: "Critical & High",
      value: (criticalCount + highCount).toString(),
      change: criticalCount > 0 ? "Immediate attention required" : "Good",
      changeType: criticalCount > 0 ? ("negative" as const) : ("positive" as const),
      icon: AlertTriangle,
    },
    {
      title: "Affected Images",
      value: new Set(allVulnerabilities.map(v => v.image)).size.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: Package,
    },
    {
      title: "Clusters Scanned",
      value: vulnerabilityData?.clusterStatuses.length.toString() || "0",
      change: "",
      changeType: "neutral" as const,
      icon: Server,
    },
  ];

  const vulnerabilityColumns = [
    { 
      key: "severity", 
      label: "Severity",
      render: (value: string) => (
        <Badge className={getSeverityColor(value)}>
          {value}
        </Badge>
      )
    },
    { key: "cve", label: "CVE ID" },
    { key: "containerName", label: "Container" },
    { key: "image", label: "Image" },
    { key: "clusterName", label: "Cluster" },
    { 
      key: "solution", 
      label: "Solution",
      render: (value: string) => (
        <span className="text-sm text-text-02">
          {value || "No solution available"}
        </span>
      )
    },
    {
      key: "actions",
      label: "Actions",
      render: (value: any, row: any) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => window.open(`https://nvd.nist.gov/vuln/detail/${row.cve}`, '_blank')}
            className="p-1 hover:bg-ui-02 rounded transition-colors"
            title="View CVE Details"
          >
            <ExternalLink className="h-4 w-4 text-text-02" />
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="col-span-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="carbon-type-productive-heading-04 text-text-01 mb-2">
                Vulnerability Management
              </h1>
              <p className="carbon-type-body-02 text-text-02">
                Comprehensive view of all security vulnerabilities across your infrastructure with risk prioritization and remediation tracking
              </p>
              {lastUpdated && (
                <p className="carbon-type-label-01 text-text-03 flex items-center space-x-1 mt-2">
                  <Activity className="h-3 w-3" />
                  <span>Last updated: {lastUpdated.toLocaleString()}</span>
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  // Export functionality could be implemented here
                  console.log("Exporting vulnerabilities...");
                }}
                className="flex items-center space-x-2 px-4 py-2 border border-ui-04 text-text-01 rounded carbon-type-body-01 hover:bg-ui-01 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Report</span>
              </button>
              <button
                onClick={() => {
                  setIsLoading(true);
                  setTimeout(() => {
                    setVulnerabilityData(mockVulnerabilityData);
                    setLastUpdated(new Date());
                    setIsLoading(false);
                  }, 1000);
                }}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-interactive-01 text-white rounded carbon-type-body-01 hover:bg-interactive-03 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh Scan</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 p-4 bg-support-01 text-white rounded">
            <AlertTriangle className="h-5 w-5" />
            <span className="carbon-type-body-01">{error}</span>
          </div>
        )}

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Severity Distribution */}
        <div className="mb-8">
          <div className="bg-layer-01 border border-ui-03 rounded p-6">
            <h3 className="carbon-type-productive-heading-02 text-text-01 mb-4">
              Vulnerability Severity Distribution
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-500 mb-1">{criticalCount}</div>
                <div className="carbon-type-label-01 text-text-02">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-500 mb-1">{highCount}</div>
                <div className="carbon-type-label-01 text-text-02">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-500 mb-1">{mediumCount}</div>
                <div className="carbon-type-label-01 text-text-02">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500 mb-1">{lowCount}</div>
                <div className="carbon-type-label-01 text-text-02">Low</div>
              </div>
            </div>
          </div>
        </div>

        {isLoading && allVulnerabilities.length === 0 ? (
          <div className="bg-layer-01 border border-ui-03 rounded p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin h-8 w-8 border-2 border-interactive-01 border-t-transparent rounded-full" />
              <div>
                <h3 className="carbon-type-productive-heading-02 text-text-01 mb-2">
                  Scanning for Vulnerabilities
                </h3>
                <p className="carbon-type-body-01 text-text-02">
                  Analyzing container images across all clusters...
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="mb-6">
              <div className="bg-layer-01 border border-ui-03 rounded p-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-text-02" />
                    <Input
                      placeholder="Search CVE, container, or image..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-64"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-text-02" />
                    <Select value={severityFilter} onValueChange={setSeverityFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Severities</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Server className="h-4 w-4 text-text-02" />
                    <Select value={selectedCluster} onValueChange={setSelectedCluster}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Clusters</SelectItem>
                        {vulnerabilityData?.clusterStatuses.map(cluster => (
                          <SelectItem key={cluster.name} value={cluster.name}>
                            {cluster.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-sm text-text-02">
                    Showing {filteredVulnerabilities.length} of {allVulnerabilities.length} vulnerabilities
                  </div>
                </div>
              </div>
            </div>

            {/* Vulnerabilities Table */}
            <div>
              <h3 className="carbon-type-productive-heading-03 text-text-01 mb-4">
                All Vulnerabilities ({filteredVulnerabilities.length})
              </h3>
              {filteredVulnerabilities.length > 0 ? (
                <DataTable
                  columns={vulnerabilityColumns}
                  data={filteredVulnerabilities}
                />
              ) : (
                <div className="bg-layer-01 border border-ui-03 rounded p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ui-03">
                      <Shield className="h-6 w-6 text-text-02" />
                    </div>
                    <div>
                      <h3 className="carbon-type-productive-heading-02 text-text-01 mb-2">
                        No Vulnerabilities Found
                      </h3>
                      <p className="carbon-type-body-01 text-text-02">
                        {searchTerm || severityFilter !== "all" || selectedCluster !== "all"
                          ? "No vulnerabilities match your current filters."
                          : "Great! No vulnerabilities were detected in your container images."}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
