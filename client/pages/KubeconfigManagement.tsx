import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { KubeconfigUpload } from "@/components/ui/kubeconfig-upload";
import { KubeconfigTable } from "@/components/ui/kubeconfig-table";
import { MetricCard } from "@/components/ui/metric-card";
import {
  Container,
  CheckCircle,
  AlertTriangle,
  Settings,
  Upload,
  Eye,
  FileText
} from "lucide-react";
import { KubeconfigValidationResponse, KubeconfigEntry } from "@shared/kubeconfig";
import { Link } from "react-router-dom";

export default function KubeconfigManagement() {
  const [kubeconfigs, setKubeconfigs] = useState<KubeconfigEntry[]>([]);

  // Load kubeconfigs from localStorage on component mount
  useEffect(() => {
    const storedKubeconfigs = localStorage.getItem('kubeconfigs');
    if (storedKubeconfigs) {
      try {
        const configs = JSON.parse(storedKubeconfigs);
        setKubeconfigs(configs);
      } catch (error) {
        console.error('Error parsing stored kubeconfigs:', error);
      }
    }
  }, []);

  // Save kubeconfigs to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('kubeconfigs', JSON.stringify(kubeconfigs));
  }, [kubeconfigs]);

  const handleUploadSuccess = (response: KubeconfigValidationResponse) => {
    const newKubeconfig: KubeconfigEntry = {
      name: response.name,
      importDate: new Date().toISOString(),
      status: response.valid ? 'valid' : 'invalid'
    };

    setKubeconfigs(prev => [...prev, newKubeconfig]);
  };

  const handleDelete = (name: string) => {
    setKubeconfigs(prev => prev.filter(k => k.name !== name));
  };


  // Calculate metrics
  const totalConfigs = kubeconfigs.length;
  const validConfigs = kubeconfigs.filter(k => k.status === 'valid').length;
  const invalidConfigs = kubeconfigs.filter(k => k.status === 'invalid').length;
  const recentlyAdded = kubeconfigs.filter(k => {
    const importDate = new Date(k.importDate);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return importDate > dayAgo;
  }).length;

  const metrics = [
    {
      title: "Total Configs",
      value: totalConfigs.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: FileText
    },
    {
      title: "Valid Configs",
      value: validConfigs.toString(),
      change: validConfigs > 0 ? `${Math.round((validConfigs/totalConfigs)*100)}%` : "",
      changeType: "positive" as const,
      icon: CheckCircle
    },
    {
      title: "Invalid Configs",
      value: invalidConfigs.toString(),
      change: "",
      changeType: invalidConfigs > 0 ? "negative" as const : "neutral" as const,
      icon: AlertTriangle
    },
    {
      title: "Added Today",
      value: recentlyAdded.toString(),
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
            <Link
              to="/clusters"
              className="flex items-center space-x-2 px-4 py-2 bg-interactive-01 text-white rounded carbon-type-body-01 hover:bg-interactive-03 transition-colors"
            >
              <Eye className="h-4 w-4" />
              <span>View Cluster Details</span>
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Content Grid */}
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

              {/* Next Steps */}
              {validConfigs > 0 && (
                <div className="mt-6 pt-6 border-t border-ui-03">
                  <h4 className="carbon-type-productive-heading-01 text-text-01 mb-3">
                    Next Steps
                  </h4>
                  <Link
                    to="/clusters"
                    className="w-full flex items-center space-x-2 p-3 bg-interactive-01 text-white rounded carbon-type-body-01 hover:bg-interactive-03 transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View Cluster Details</span>
                  </Link>
                </div>
              )}
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

        {/* Additional Information */}
        {kubeconfigs.length > 0 && (
          <div className="mt-8 bg-layer-01 border border-ui-03 rounded p-6">
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
                  <li>• Monitor cluster health through the details page</li>
                </ul>
              </div>
              <div>
                <h4 className="carbon-type-productive-heading-01 text-text-01 mb-2">
                  Security Notes
                </h4>
                <ul className="space-y-2 carbon-type-body-01 text-text-02">
                  <li>• Kubeconfig files contain sensitive credentials</li>
                  <li>• Validation ensures proper cluster connectivity</li>
                  <li>• Check cluster details for permission status</li>
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
