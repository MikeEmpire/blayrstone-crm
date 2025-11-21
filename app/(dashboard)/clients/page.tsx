"use client";

import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import { Client } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClientTable } from "@/components/clients/ClientTable";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { ClientCreateDialog } from "@/components/clients/ClientCreateDialog";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchClients();
  }, [statusFilter]);

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      const response: any = await apiClient.getClients(params);
      setClients(response.results || response);
    } catch (error) {
      console.error("Failed to fetch clients:", error);
      toast.error(
        "Failed to fetch clients, please try again or reach out to Mike"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await apiClient.deleteClient(id);
      setClients(clients.filter((c) => c.id !== id));
      toast.success(`${name} has been deleted successfully`);
    } catch (error) {
      console.error("Failed to delete client:", error);
      toast.error("Failed to delete client, please try again");
    }
  };

  const filteredClients = clients.filter((client) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.first_name.toLowerCase().includes(searchLower) ||
      client.last_name.toLowerCase().includes(searchLower) ||
      client.email?.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchTerm)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-2">
            Manage your client database
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <span className="mr-2">+</span>
          Add Client
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <ClientFilters
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
              Loading clients...
            </div>
          ) : (
            <ClientTable clients={filteredClients} onDelete={handleDelete} />
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <ClientCreateDialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchClients();
        }}
      />
    </div>
  );
}
