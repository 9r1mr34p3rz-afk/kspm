import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { MetricCard } from "@/components/ui/metric-card";
import { DataTable } from "@/components/ui/data-table";
import {
  Container,
  Package,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  Info,
  Server,
} from "lucide-react";
import { KubeconfigEntry } from "@shared/kubeconfig";
import {
  ClusterStatusResponse,
  DockerImageSummary,
} from "@shared/cluster-status";

export default function DockerImages() {
  const [dockerImages, setDockerImages] = useState<DockerImageSummary[]>([]);
  const [filteredImages, setFilteredImages] = useState<DockerImageSummary[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [registryFilter, setRegistryFilter] = useState("all");
  const [error, setError] = useState("");

  // Load and aggregate docker images from all clusters
  useEffect(() => {
    fetchDockerImages();
  }, []);

  // Filter images based on search and registry filter
  useEffect(() => {
    let filtered = dockerImages;

    if (searchTerm) {
      filtered = filtered.filter(
        (img) =>
          img.image.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (registryFilter !== "all") {
      filtered = filtered.filter((img) => {
        const registry = img.image.split("/")[0];
        return registry.includes(registryFilter);
      });
    }

    setFilteredImages(filtered);
  }, [dockerImages, searchTerm, registryFilter]);

  const fetchDockerImages = async () => {
    setIsLoading(true);
    setError("");

    try {
      const storedKubeconfigs = localStorage.getItem("kubeconfigs");
      if (!storedKubeconfigs) {
        setDockerImages([]);
        return;
      }

      const kubeconfigs: KubeconfigEntry[] = JSON.parse(storedKubeconfigs);
      const validConfigs = kubeconfigs.filter((k) => k.status === "valid");

      if (validConfigs.length === 0) {
        setDockerImages([]);
        return;
      }

      const allImages: DockerImageSummary[] = [];
      const imageMap = new Map<string, DockerImageSummary>();

      for (const config of validConfigs) {
        try {
          const response = await fetch(
            `http://localhost:8080/api/v1/kubeconfigs/${config.name}/status`,
          );
          if (response.ok) {
            const data: ClusterStatusResponse = await response.json();

            if (data.valid && data.clusterStatuses) {
              data.clusterStatuses.forEach((cluster) => {
                cluster.nodes.forEach((node) => {
                  node.containerImages.forEach((image) => {
                    const key = image.image;
                    if (imageMap.has(key)) {
                      const existing = imageMap.get(key)!;
                      existing.totalInstances++;
                      if (!existing.clusters.includes(cluster.name)) {
                        existing.clusters.push(cluster.name);
                      }
                      if (!existing.nodes.includes(node.name)) {
                        existing.nodes.push(node.name);
                      }
                    } else {
                      imageMap.set(key, {
                        image: image.image,
                        name: image.name,
                        clusters: [cluster.name],
                        nodes: [node.name],
                        totalInstances: 1,
                      });
                    }
                  });
                });
              });
            }
          }
        } catch (error) {
          console.error(`Error fetching images for ${config.name}:`, error);
        }
      }

      const sortedImages = Array.from(imageMap.values()).sort(
        (a, b) => b.totalInstances - a.totalInstances,
      );

      setDockerImages(sortedImages);
    } catch (error) {
      console.error("Error fetching docker images:", error);
      setError("Failed to load docker images");
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique registries for filter
  const registries = Array.from(
    new Set(
      dockerImages.map((img) => {
        const parts = img.image.split("/");
        return parts.length > 1 ? parts[0] : "docker.io";
      }),
    ),
  ).sort();

  // Calculate metrics
  const totalImages = dockerImages.length;
  const totalInstances = dockerImages.reduce(
    (sum, img) => sum + img.totalInstances,
    0,
  );
  const totalClusters = new Set(dockerImages.flatMap((img) => img.clusters))
    .size;
  const totalNodes = new Set(dockerImages.flatMap((img) => img.nodes)).size;

  const metrics = [
    {
      title: "Unique Images",
      value: totalImages.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: Package,
    },
    {
      title: "Total Instances",
      value: totalInstances.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: Container,
    },
    {
      title: "Across Clusters",
      value: totalClusters.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: Server,
    },
    {
      title: "Across Nodes",
      value: totalNodes.toString(),
      change: "",
      changeType: "neutral" as const,
      icon: Container,
    },
  ];

  const tableColumns = [
    { key: "image", label: "Image" },
    { key: "name", label: "Container Name" },
    { key: "totalInstances", label: "Instances" },
    { key: "clusters", label: "Clusters" },
    { key: "nodes", label: "Nodes" },
  ];

  const tableData = filteredImages.map((img) => ({
    image: img.image,
    name: img.name,
    totalInstances: img.totalInstances,
    clusters: img.clusters.join(", "),
    nodes: `${img.nodes.length} node${img.nodes.length !== 1 ? "s" : ""}`,
  }));

  return (
    <DashboardLayout>
      <div className="col-span-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="carbon-type-productive-heading-04 text-text-01 mb-2">
                Docker Images
              </h1>
              <p className="carbon-type-body-02 text-text-02">
                Comprehensive view of all container images across your
                Kubernetes clusters
              </p>
            </div>
            <button
              onClick={fetchDockerImages}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 border border-ui-04 text-text-01 rounded carbon-type-body-01 hover:bg-ui-01 transition-colors"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-center space-x-2 p-4 bg-support-01 text-white rounded">
            <AlertTriangle className="h-5 w-5" />
            <span className="carbon-type-body-01">{error}</span>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <MetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Filters */}
        <div className="mb-6 bg-layer-01 border border-ui-03 rounded p-6">
          <h3 className="carbon-type-productive-heading-02 text-text-01 mb-4">
            Filters & Search
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block carbon-type-label-01 text-text-02 mb-2">
                Search Images
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-03" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by image name or container name..."
                  className="w-full pl-10 pr-3 py-2 bg-field-01 border border-ui-04 rounded carbon-type-body-01 text-text-01 placeholder-text-03 focus:outline-none focus:ring-2 focus:ring-interactive-01"
                />
              </div>
            </div>

            {/* Registry Filter */}
            <div>
              <label className="block carbon-type-label-01 text-text-02 mb-2">
                Registry
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-03" />
                <select
                  value={registryFilter}
                  onChange={(e) => setRegistryFilter(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-field-01 border border-ui-04 rounded carbon-type-body-01 text-text-01 focus:outline-none focus:ring-2 focus:ring-interactive-01 appearance-none"
                >
                  <option value="all">All Registries</option>
                  {registries.map((registry) => (
                    <option key={registry} value={registry}>
                      {registry}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="bg-ui-03 px-3 py-2 rounded">
                <span className="carbon-type-body-01 text-text-01">
                  Showing {filteredImages.length} of {totalImages} images
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Images Table */}
        {isLoading ? (
          <div className="bg-layer-01 border border-ui-03 rounded p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin h-8 w-8 border-2 border-interactive-01 border-t-transparent rounded-full" />
              <div>
                <h3 className="carbon-type-productive-heading-02 text-text-01 mb-2">
                  Loading Docker Images
                </h3>
                <p className="carbon-type-body-01 text-text-02">
                  Fetching container images from all connected clusters...
                </p>
              </div>
            </div>
          </div>
        ) : filteredImages.length > 0 ? (
          <DataTable columns={tableColumns} data={tableData} />
        ) : dockerImages.length === 0 ? (
          <div className="bg-layer-01 border border-ui-03 rounded p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ui-03">
                <Package className="h-6 w-6 text-text-02" />
              </div>
              <div>
                <h3 className="carbon-type-productive-heading-02 text-text-01 mb-2">
                  No Docker Images Found
                </h3>
                <p className="carbon-type-body-01 text-text-02">
                  Connect and validate kubeconfig files to view container
                  images.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-layer-01 border border-ui-03 rounded p-8 text-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ui-03">
                <Search className="h-6 w-6 text-text-02" />
              </div>
              <div>
                <h3 className="carbon-type-productive-heading-02 text-text-01 mb-2">
                  No Results Found
                </h3>
                <p className="carbon-type-body-01 text-text-02">
                  Try adjusting your search terms or filters.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Registry Information */}
        {registries.length > 0 && (
          <div className="mt-8 bg-layer-01 border border-ui-03 rounded p-6">
            <h3 className="carbon-type-productive-heading-02 text-text-01 mb-4">
              Registry Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registries.map((registry) => {
                const registryImages = dockerImages.filter((img) => {
                  const imgRegistry = img.image.split("/")[0];
                  return (
                    imgRegistry === registry ||
                    (registry === "docker.io" && !img.image.includes("/"))
                  );
                });
                const registryInstances = registryImages.reduce(
                  (sum, img) => sum + img.totalInstances,
                  0,
                );

                return (
                  <div
                    key={registry}
                    className="bg-layer-02 border border-ui-03 rounded p-4"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="h-4 w-4 text-interactive-01" />
                      <span className="carbon-type-body-01 text-text-01 font-medium">
                        {registry}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p className="carbon-type-label-01 text-text-02">
                        {registryImages.length} unique images
                      </p>
                      <p className="carbon-type-label-01 text-text-02">
                        {registryInstances} total instances
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
