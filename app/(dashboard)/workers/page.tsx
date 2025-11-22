"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import { ServiceWorker } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkerTable } from "@/components/workers/WorkersTable";
import { WorkerFilters } from "@/components/workers/WorkerFilters";
import { WorkerCreateDialog } from "@/components/workers/WorkerCreateDialog";

export default function WorkersPage() {
  const [workers, setWorkers] = useState<ServiceWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchWorkers();
  }, [statusFilter]);

  const fetchWorkers = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response: any = await apiClient.getWorkers(params);
      setWorkers(response.results || response);
    } catch (error) {
      console.error("Failed to fetch workers:", error);
      toast.error(
        "Failed to fetch workers, please try again or reach out to Mike"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await apiClient.deleteWorker(id);
      setWorkers(workers.filter((c) => c.id !== id));
      toast.success(`${name} has been deleted successfully`);
    } catch (error) {
      console.error("Failed to delete worker:", error);
      toast.error("Failed to delete worker, please try again");
    }
  };

  const filteredWorkers = workers.filter((worker) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      worker.first_name.toLowerCase().includes(searchLower) ||
      worker.last_name.toLowerCase().includes(searchLower) ||
      worker.email?.toLowerCase().includes(searchLower) ||
      worker.phone.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workers</h1>
          <p className="text-muted-foreground mt-2">
            Manage your service worker database
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <span className="mr-2">+</span>
          Add Service Worker
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <WorkerFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading workers...
            </div>
          ) : (
            <WorkerTable workers={filteredWorkers} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <WorkerCreateDialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchWorkers();
        }}
      />
    </div>
  );
}
