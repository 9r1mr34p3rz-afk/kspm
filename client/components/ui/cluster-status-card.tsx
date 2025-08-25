import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Server, 
  CheckCircle, 
  XCircle, 
  ChevronDown, 
  ChevronRight,
  Container,
  Settings,
  Shield,
  AlertTriangle
} from "lucide-react";
import { ClusterStatus } from "@shared/cluster-status";

interface ClusterStatusCardProps {
  clusterStatus: ClusterStatus;
  className?: string;
}

export function ClusterStatusCard({ clusterStatus, className }: ClusterStatusCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusColor = (reachable: boolean) => {
    return reachable ? "text-support-02" : "text-support-01";
  };

  const getStatusBadge = (reachable: boolean) => {
    return (
      <span className={cn(
        "inline-flex items-center px-2 py-1 rounded carbon-type-label-01 font-medium",
        reachable ? "bg-support-02 text-white" : "bg-support-01 text-white"
      )}>
        {reachable ? "Online" : "Offline"}
      </span>
    );
  };

  const getPermissionIcon = (hasPermission: boolean) => {
    return hasPermission ? (
      <CheckCircle className="h-4 w-4 text-support-02" />
    ) : (
      <XCircle className="h-4 w-4 text-support-01" />
    );
  };

  const totalImages = clusterStatus.nodes.reduce((sum, node) => sum + node.containerImages.length, 0);

  return (
    <div className={cn("bg-layer-01 border border-ui-03 rounded overflow-hidden", className)}>
      {/* Header */}
      <div className="p-6 border-b border-ui-03">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded bg-interactive-01">
              <Server className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="carbon-type-productive-heading-02 text-text-01">
                {clusterStatus.name}
              </h3>
              <p className="carbon-type-body-01 text-text-02 font-mono text-sm">
                {clusterStatus.server}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {getStatusBadge(clusterStatus.reachable)}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center space-x-1 px-3 py-2 border border-ui-04 rounded carbon-type-body-01 hover:bg-ui-01 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span>Details</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="carbon-type-productive-heading-02 text-text-01">
              {clusterStatus.nodes.length}
            </p>
            <p className="carbon-type-label-01 text-text-02">Nodes</p>
          </div>
          <div className="text-center">
            <p className="carbon-type-productive-heading-02 text-text-01">
              {totalImages}
            </p>
            <p className="carbon-type-label-01 text-text-02">Images</p>
          </div>
          <div className="text-center">
            <p className="carbon-type-productive-heading-02 text-text-01">
              {clusterStatus.apiVersions.length}
            </p>
            <p className="carbon-type-label-01 text-text-02">API Versions</p>
          </div>
          <div className="text-center">
            <div className="flex justify-center">
              {clusterStatus.reachable ? (
                <CheckCircle className={cn("h-6 w-6", getStatusColor(clusterStatus.reachable))} />
              ) : (
                <XCircle className={cn("h-6 w-6", getStatusColor(clusterStatus.reachable))} />
              )}
            </div>
            <p className="carbon-type-label-01 text-text-02">Status</p>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Permissions */}
          <div>
            <h4 className="carbon-type-productive-heading-01 text-text-01 mb-3 flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Permissions</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center space-x-2">
                {getPermissionIcon(clusterStatus.permissions.canListNodes)}
                <span className="carbon-type-body-01 text-text-01">List Nodes</span>
              </div>
              <div className="flex items-center space-x-2">
                {getPermissionIcon(clusterStatus.permissions.canListPods)}
                <span className="carbon-type-body-01 text-text-01">List Pods</span>
              </div>
              <div className="flex items-center space-x-2">
                {getPermissionIcon(clusterStatus.permissions.canGetMetrics)}
                <span className="carbon-type-body-01 text-text-01">Get Metrics</span>
              </div>
            </div>
          </div>

          {/* Nodes */}
          <div>
            <h4 className="carbon-type-productive-heading-01 text-text-01 mb-3 flex items-center space-x-2">
              <Container className="h-4 w-4" />
              <span>Nodes ({clusterStatus.nodes.length})</span>
            </h4>
            <div className="space-y-3">
              {clusterStatus.nodes.map((node, index) => (
                <div key={index} className="bg-layer-02 border border-ui-03 rounded p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h5 className="carbon-type-body-01 text-text-01 font-medium">{node.name}</h5>
                      <p className="carbon-type-label-01 text-text-02">
                        Kubelet: {node.kubeletVersion}
                      </p>
                    </div>
                    <span className="carbon-type-label-01 bg-ui-03 text-text-02 px-2 py-1 rounded">
                      {node.containerImages.length} images
                    </span>
                  </div>
                  
                  {/* Container Images Preview */}
                  {node.containerImages.length > 0 && (
                    <div className="space-y-2">
                      <p className="carbon-type-label-01 text-text-02">Container Images:</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                        {node.containerImages.slice(0, 8).map((image, imgIndex) => (
                          <div key={imgIndex} className="flex items-center space-x-2 text-xs">
                            <Container className="h-3 w-3 text-text-03" />
                            <span className="carbon-type-code-01 text-text-01 truncate">
                              {image.image}
                            </span>
                          </div>
                        ))}
                        {node.containerImages.length > 8 && (
                          <p className="carbon-type-label-01 text-text-03 italic">
                            +{node.containerImages.length - 8} more images...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* API Versions Preview */}
          <div>
            <h4 className="carbon-type-productive-heading-01 text-text-01 mb-3 flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>API Versions ({clusterStatus.apiVersions.length})</span>
            </h4>
            <div className="bg-layer-02 border border-ui-03 rounded p-3 max-h-32 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {clusterStatus.apiVersions.slice(0, 12).map((version, index) => (
                  <span key={index} className="carbon-type-code-01 text-text-02 text-xs">
                    {version}
                  </span>
                ))}
                {clusterStatus.apiVersions.length > 12 && (
                  <span className="carbon-type-label-01 text-text-03 italic text-xs">
                    +{clusterStatus.apiVersions.length - 12} more...
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
