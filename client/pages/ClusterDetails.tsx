import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/metric-card";
import { ClusterStatusCard } from "@/components/ui/cluster-status-card";
import { DataTable } from "@/components/ui/data-table";
import { 
  Server, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw,
  Container,
  Shield,
  Activity,
  Cpu,
  HardDrive,
  Network,
  Clock,
  Package,
  Users,
  Settings,
  Eye
} from "lucide-react";
import { KubeconfigEntry } from "@shared/kubeconfig";
import { ClusterStatusResponse, ClusterStatus } from "@shared/cluster-status";
import { Link } from "react-router-dom";

export default function ClusterDetails() {
  const [clusterStatuses, setClusterStatuses] = useState<ClusterStatus[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<ClusterStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load cluster statuses on component mount
  useEffect(() => {
    fetchClusterStatuses();
  }, []);

  const fetchClusterStatuses = async () => {
    setIsLoading(true);
    setError("");

    try {
      const storedKubeconfigs = localStorage.getItem('kubeconfigs');
      if (!storedKubeconfigs) {
        setClusterStatuses([]);
        return;
      }

      const kubeconfigs: KubeconfigEntry[] = JSON.parse(storedKubeconfigs);
      const validConfigs = kubeconfigs.filter(k => k.status === 'valid');

      if (validConfigs.length === 0) {
        setClusterStatuses([]);
        return;
      }

      const statuses: ClusterStatus[] = [];

      for (const config of validConfigs) {
        try {
          const response = await fetch(`http://localhost:8080/api/v1/kubeconfigs/${config.name}/status`);
          if (response.ok) {
            const data: ClusterStatusResponse = await response.json();
            if (data.valid && data.clusterStatuses) {
              statuses.push(...data.clusterStatuses);
            }
          }
        } catch (error) {
          console.error(`Error fetching status for ${config.name}:`, error);
        }
      }

      setClusterStatuses(statuses);
      setLastUpdated(new Date());
      
      // Auto-select first cluster if none selected
      if (statuses.length > 0 && !selectedCluster) {
        setSelectedCluster(statuses[0]);
      }
    } catch (error) {
      console.error('Error fetching cluster statuses:', error);
      setError('Failed to load cluster information');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate overall metrics
  const totalClusters = clusterStatuses.length;
  const reachableClusters = clusterStatuses.filter(c => c.reachable).length;
  const totalNodes = clusterStatuses.reduce((sum, c) => sum + c.nodes.length, 0);
  const totalImages = clusterStatuses.reduce((sum, c) => 
    sum + c.nodes.reduce((nodeSum, n) => nodeSum + n.containerImages.length, 0), 0
  );

  const overallMetrics = [
    {
      title: "Total Clusters",
      value: totalClusters.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: Server
    },
    {
      title: "Online Clusters",
      value: reachableClusters.toString(),
      change: reachableClusters === totalClusters ? "100%" : `${Math.round((reachableClusters/totalClusters)*100)}%`,
      changeType: reachableClusters === totalClusters ? "positive" as const : "neutral" as const,
      icon: CheckCircle
    },
    {
      title: "Total Nodes",
      value: totalNodes.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: Container
    },
    {
      title: "Container Images",
      value: totalImages.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: Package
    }
  ];

  // Selected cluster details
  const getClusterHealth = (cluster: ClusterStatus) => {
    const hasBasicPerms = cluster.permissions.canListNodes && cluster.permissions.canListPods;
    const hasMetrics = cluster.permissions.canGetMetrics;
    
    if (!cluster.reachable) return { status: "Offline", color: "text-support-01", bgColor: "bg-support-01" };
    if (hasBasicPerms && hasMetrics) return { status: "Healthy", color: "text-support-02", bgColor: "bg-support-02" };
    if (hasBasicPerms) return { status: "Limited", color: "text-support-03", bgColor: "bg-support-03" };
    return { status: "Warning", color: "text-support-01", bgColor: "bg-support-01" };
  };

  // Get unique API versions across all clusters
  const getAllApiVersions = () => {
    const allVersions = new Set<string>();
    clusterStatuses.forEach(cluster => {
      cluster.apiVersions.forEach(version => allVersions.add(version));
    });
    return Array.from(allVersions).sort();
  };

  // API versions table data
  const apiVersionsData = selectedCluster ? selectedCluster.apiVersions.map((version, index) => ({
    version,
    category: version.includes('/') ? version.split('/')[0] : 'core',
    apiVersion: version.includes('/') ? version.split('/')[1] || 'v1' : version,
    status: 'Available'
  })) : [];

  const apiVersionsColumns = [
    { key: "version", label: "API Version" },
    { key: "category", label: "Category" },
    { key: "apiVersion", label: "Version" },
    { key: "status", label: "Status" }
  ];

  // Container images for selected cluster
  const getClusterImages = (cluster: ClusterStatus) => {
    const images: any[] = [];
    cluster.nodes.forEach(node => {
      node.containerImages.forEach(image => {
        images.push({
          name: image.name,
          image: image.image,
          node: node.name,
          registry: image.image.split('/')[0] || 'docker.io'
        });
      });
    });
    return images;
  };

  const clusterImagesColumns = [
    { key: "name", label: "Container Name" },
    { key: "image", label: "Image" },
    { key: "node", label: "Node" },
    { key: "registry", label: "Registry" }
  ];

  return (
    <DashboardLayout>
      <div className="col-span-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="carbon-type-productive-heading-04 text-text-01 mb-2">
                Cluster Details & Monitoring
              </h1>
              <p className="carbon-type-body-02 text-text-02">
                Comprehensive cluster health monitoring and resource analysis
              </p>
              {lastUpdated && (
                <p className="carbon-type-label-01 text-text-03 flex items-center space-x-1 mt-2">
                  <Clock className="h-3 w-3" />
                  <span>Last updated: {lastUpdated.toLocaleString()}</span>
                </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                to="/kubernetes"
                className="flex items-center space-x-2 px-4 py-2 border border-ui-04 text-text-01 rounded carbon-type-body-01 hover:bg-ui-01 transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span>Manage Configs</span>
              </Link>
              <button
                onClick={fetchClusterStatuses}
                disabled={isLoading}
                className="flex items-center space-x-2 px-4 py-2 bg-interactive-01 text-white rounded carbon-type-body-01 hover:bg-interactive-03 transition-colors"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
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

        {/* Overall Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {overallMetrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {isLoading && clusterStatuses.length === 0 ? (
          <div className="bg-layer-01 border border-ui-03 rounded p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin h-8 w-8 border-2 border-interactive-01 border-t-transparent rounded-full" />
              <div>
                <h3 className="carbon-type-productive-heading-02 text-text-01 mb-2">
                  Loading Cluster Data
                </h3>
                <p className="carbon-type-body-01 text-text-02">
                  Fetching cluster information and health status...
                </p>
              </div>
            </div>
          </div>
        ) : clusterStatuses.length === 0 ? (
          <div className="bg-layer-01 border border-ui-03 rounded p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ui-03">
                <Server className="h-6 w-6 text-text-02" />
              </div>
              <div>
                <h3 className="carbon-type-productive-heading-02 text-text-01 mb-2">
                  No Clusters Connected
                </h3>
                <p className="carbon-type-body-01 text-text-02 mb-4">
                  Upload and validate kubeconfig files to view cluster details.
                </p>
                <Link 
                  to="/kubernetes"
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-interactive-01 text-white rounded carbon-type-body-01 hover:bg-interactive-03 transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  <span>Manage Kubeconfigs</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cluster List */}
            <div className="lg:col-span-1">
              <div className="bg-layer-01 border border-ui-03 rounded">
                <div className="px-6 py-4 border-b border-ui-03">
                  <h3 className="carbon-type-productive-heading-02 text-text-01">
                    Clusters ({clusterStatuses.length})
                  </h3>
                </div>
                <div className="divide-y divide-ui-03 max-h-96 overflow-y-auto">
                  {clusterStatuses.map((cluster, index) => {
                    const health = getClusterHealth(cluster);
                    const isSelected = selectedCluster?.name === cluster.name;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedCluster(cluster)}
                        className={`w-full p-4 text-left hover:bg-layer-02 transition-colors ${
                          isSelected ? 'bg-layer-02 border-r-2 border-interactive-01' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-interactive-01">
                              <Server className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="carbon-type-body-01 text-text-01 font-medium">
                                {cluster.name}
                              </p>
                              <p className="carbon-type-label-01 text-text-02">
                                {cluster.nodes.length} node{cluster.nodes.length !== 1 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                          <span className={`inline-flex items-center px-2 py-1 rounded carbon-type-label-01 font-medium text-white ${health.bgColor}`}>
                            {health.status}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Selected Cluster Details */}
            <div className="lg:col-span-2 space-y-6">
              {selectedCluster ? (
                <>
                  {/* Cluster Overview Card */}
                  <ClusterStatusCard clusterStatus={selectedCluster} />

                  {/* Detailed Analysis */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Health & Permissions */}
                    <div className="bg-layer-01 border border-ui-03 rounded p-6">
                      <h4 className="carbon-type-productive-heading-02 text-text-01 mb-4 flex items-center space-x-2">
                        <Activity className="h-4 w-4" />
                        <span>Cluster Health</span>
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="carbon-type-body-01 text-text-02">Overall Status</span>
                          <span className={`carbon-type-body-01 font-medium ${getClusterHealth(selectedCluster).color}`}>
                            {getClusterHealth(selectedCluster).status}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="carbon-type-body-01 text-text-02">Reachability</span>
                          <div className="flex items-center space-x-2">
                            {selectedCluster.reachable ? (
                              <CheckCircle className="h-4 w-4 text-support-02" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-support-01" />
                            )}
                            <span className="carbon-type-body-01 text-text-01">
                              {selectedCluster.reachable ? 'Online' : 'Offline'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="carbon-type-body-01 text-text-02">Node Access</span>
                          <div className="flex items-center space-x-2">
                            {selectedCluster.permissions.canListNodes ? (
                              <CheckCircle className="h-4 w-4 text-support-02" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-support-01" />
                            )}
                            <span className="carbon-type-body-01 text-text-01">
                              {selectedCluster.permissions.canListNodes ? 'Enabled' : 'Restricted'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="carbon-type-body-01 text-text-02">Pod Access</span>
                          <div className="flex items-center space-x-2">
                            {selectedCluster.permissions.canListPods ? (
                              <CheckCircle className="h-4 w-4 text-support-02" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-support-01" />
                            )}
                            <span className="carbon-type-body-01 text-text-01">
                              {selectedCluster.permissions.canListPods ? 'Enabled' : 'Restricted'}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="carbon-type-body-01 text-text-02">Metrics Access</span>
                          <div className="flex items-center space-x-2">
                            {selectedCluster.permissions.canGetMetrics ? (
                              <CheckCircle className="h-4 w-4 text-support-02" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-support-01" />
                            )}
                            <span className="carbon-type-body-01 text-text-01">
                              {selectedCluster.permissions.canGetMetrics ? 'Enabled' : 'Restricted'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cluster Stats */}
                    <div className="bg-layer-01 border border-ui-03 rounded p-6">
                      <h4 className="carbon-type-productive-heading-02 text-text-01 mb-4 flex items-center space-x-2">
                        <Cpu className="h-4 w-4" />
                        <span>Resource Summary</span>
                      </h4>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="carbon-type-body-01 text-text-02">Total Nodes</span>
                          <span className="carbon-type-productive-heading-02 text-text-01">
                            {selectedCluster.nodes.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="carbon-type-body-01 text-text-02">Container Images</span>
                          <span className="carbon-type-productive-heading-02 text-text-01">
                            {selectedCluster.nodes.reduce((sum, n) => sum + n.containerImages.length, 0)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="carbon-type-body-01 text-text-02">API Versions</span>
                          <span className="carbon-type-productive-heading-02 text-text-01">
                            {selectedCluster.apiVersions.length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="carbon-type-body-01 text-text-02">Server Endpoint</span>
                          <span className="carbon-type-code-01 text-text-01 text-xs">
                            {selectedCluster.server.replace('https://', '')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Versions Table */}
                  <div>
                    <h4 className="carbon-type-productive-heading-03 text-text-01 mb-4">
                      API Versions ({selectedCluster.apiVersions.length})
                    </h4>
                    <DataTable columns={apiVersionsColumns} data={apiVersionsData} />
                  </div>

                  {/* Container Images Table */}
                  <div>
                    <h4 className="carbon-type-productive-heading-03 text-text-01 mb-4">
                      Container Images ({getClusterImages(selectedCluster).length})
                    </h4>
                    <DataTable columns={clusterImagesColumns} data={getClusterImages(selectedCluster)} />
                  </div>
                </>
              ) : (
                <div className="bg-layer-01 border border-ui-03 rounded p-8 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ui-03">
                      <Eye className="h-6 w-6 text-text-02" />
                    </div>
                    <div>
                      <h3 className="carbon-type-productive-heading-02 text-text-01 mb-2">
                        Select a Cluster
                      </h3>
                      <p className="carbon-type-body-01 text-text-02">
                        Choose a cluster from the list to view detailed information.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
