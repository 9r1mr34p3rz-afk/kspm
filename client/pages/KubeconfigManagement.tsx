import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KubeconfigUpload } from "@/components/ui/kubeconfig-upload";
import { KubeconfigTable } from "@/components/ui/kubeconfig-table";
import { MetricCard } from "@/components/ui/metric-card";
import { ClusterStatusCard } from "@/components/ui/cluster-status-card";
import {
  Container,
  CheckCircle,
  AlertTriangle,
  Settings,
  RefreshCw,
  Upload,
  Server
} from "lucide-react";
import { KubeconfigValidationResponse, KubeconfigEntry } from "@shared/kubeconfig";
import { ClusterStatusResponse, ClusterStatus } from "@shared/cluster-status";

export default function KubeconfigManagement() {
  const [kubeconfigs, setKubeconfigs] = useState<KubeconfigEntry[]>([]);
  const [clusterStatuses, setClusterStatuses] = useState<ClusterStatus[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingStatuses, setIsLoadingStatuses] = useState(false);

  // Load kubeconfigs from localStorage on component mount
  useEffect(() => {
    const storedKubeconfigs = localStorage.getItem('kubeconfigs');
    if (storedKubeconfigs) {
      try {
        const configs = JSON.parse(storedKubeconfigs);
        setKubeconfigs(configs);
        // Fetch cluster statuses for valid configs
        fetchClusterStatuses(configs.filter(k => k.status === 'valid'));
      } catch (error) {
        console.error('Error parsing stored kubeconfigs:', error);
      }
    }
  }, []);

  // Save kubeconfigs to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('kubeconfigs', JSON.stringify(kubeconfigs));
  }, [kubeconfigs]);

  // Fetch cluster statuses for all valid kubeconfigs
  const fetchClusterStatuses = async (validConfigs: KubeconfigEntry[]) => {
    if (validConfigs.length === 0) {
      setClusterStatuses([]);
      return;
    }

    setIsLoadingStatuses(true);
    const statuses: ClusterStatus[] = [];

    try {
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
    } finally {
      setIsLoadingStatuses(false);
    }
  };

  const handleUploadSuccess = (response: KubeconfigValidationResponse) => {
    const newKubeconfig: KubeconfigEntry = {
      name: response.name,
      importDate: new Date().toISOString(),
      status: response.valid ? 'valid' : 'invalid'
    };

    setKubeconfigs(prev => {
      const updated = [...prev, newKubeconfig];
      // Fetch cluster statuses after adding new config
      if (response.valid) {
        fetchClusterStatuses(updated.filter(k => k.status === 'valid'));
      }
      return updated;
    });
  };

  const handleDelete = (name: string) => {
    setKubeconfigs(prev => {
      const updated = prev.filter(k => k.name !== name);
      // Refresh cluster statuses after deletion
      fetchClusterStatuses(updated.filter(k => k.status === 'valid'));
      return updated;
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const validConfigs = kubeconfigs.filter(k => k.status === 'valid');
      await fetchClusterStatuses(validConfigs);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate metrics
  const totalClusters = clusterStatuses.length;
  const reachableClusters = clusterStatuses.filter(c => c.reachable).length;
  const totalNodes = clusterStatuses.reduce((sum, c) => sum + c.nodes.length, 0);
  const totalImages = clusterStatuses.reduce((sum, c) =>
    sum + c.nodes.reduce((nodeSum, n) => nodeSum + n.containerImages.length, 0), 0
  );

  const metrics = [
    {
      title: "Active Clusters",
      value: totalClusters.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: Server
    },
    {
      title: "Reachable",
      value: reachableClusters.toString(),
      change: "",
      changeType: "positive" as const,
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
      icon: Upload
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
                Kubernetes Configuration Management
              </h1>
              <p className="carbon-type-body-02 text-text-02">
                Upload, validate, and manage kubeconfig files for your Kubernetes clusters
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 border border-ui-04 text-text-01 rounded carbon-type-body-01 hover:bg-ui-01 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Content Grid */}
        <div className="space-y-8">
          {/* Upload and Management Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Form */}
            <div className="lg:col-span-1">
              <KubeconfigUpload onUploadSuccess={handleUploadSuccess} />

              {/* Quick Info */}
              <div className="mt-6 bg-layer-01 border border-ui-03 rounded p-6">
                <h3 className="carbon-type-productive-heading-02 text-text-01 mb-4">
                  Quick Info
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Settings className="h-4 w-4 text-interactive-01" />
                    <span className="carbon-type-body-01 text-text-01">
                      Supported formats: YAML, YML
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-support-02" />
                    <span className="carbon-type-body-01 text-text-01">
                      Automatic validation on upload
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Container className="h-4 w-4 text-interactive-01" />
                    <span className="carbon-type-body-01 text-text-01">
                      Secure file processing
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Kubeconfigs Table */}
            <div className="lg:col-span-2">
              <KubeconfigTable
                kubeconfigs={kubeconfigs}
                onDelete={handleDelete}
              />
            </div>
          </div>

          {/* Cluster Status Section */}
          {clusterStatuses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="carbon-type-productive-heading-03 text-text-01">
                  Cluster Status ({clusterStatuses.length})
                </h2>
                {isLoadingStatuses && (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-interactive-01 border-t-transparent rounded-full" />
                    <span className="carbon-type-body-01 text-text-02">Loading cluster data...</span>
                  </div>
                )}
              </div>
              <div className="space-y-6">
                {clusterStatuses.map((clusterStatus, index) => (
                  <ClusterStatusCard key={index} clusterStatus={clusterStatus} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        {kubeconfigs.length > 0 && (
          <div className="bg-layer-01 border border-ui-03 rounded p-6">
            <h3 className="carbon-type-productive-heading-02 text-text-01 mb-4">
              Management Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="carbon-type-productive-heading-01 text-text-01 mb-2">
                  Best Practices
                </h4>
                <ul className="space-y-2 carbon-type-body-01 text-text-02">
                  <li>• Use descriptive cluster names for easy identification</li>
                  <li>• Regularly rotate and update kubeconfig credentials</li>
                  <li>• Remove unused cluster configurations</li>
                  <li>• Monitor cluster reachability and permissions</li>
                </ul>
              </div>
              <div>
                <h4 className="carbon-type-productive-heading-01 text-text-01 mb-2">
                  Security Notes
                </h4>
                <ul className="space-y-2 carbon-type-body-01 text-text-02">
                  <li>• Kubeconfig files contain sensitive credentials</li>
                  <li>• Validation ensures proper cluster connectivity</li>
                  <li>• Check permissions regularly for security compliance</li>
                  <li>• Delete configurations when access is no longer needed</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
