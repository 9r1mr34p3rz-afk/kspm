export interface ContainerImage {
  name: string;
  image: string;
}

export interface ClusterNode {
  name: string;
  kubeletVersion: string;
  containerImages: ContainerImage[];
}

export interface ClusterPermissions {
  canListNodes: boolean;
  canListPods: boolean;
  canGetMetrics: boolean;
}

export interface ClusterStatus {
  name: string;
  server: string;
  reachable: boolean;
  nodes: ClusterNode[];
  apiVersions: string[];
  permissions: ClusterPermissions;
}

export interface ClusterStatusResponse {
  valid: boolean;
  message: string;
  clusterStatuses: ClusterStatus[];
}

export interface DockerImageSummary {
  image: string;
  name: string;
  clusters: string[];
  nodes: string[];
  totalInstances: number;
}
