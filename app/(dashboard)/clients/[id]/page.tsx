"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api";
import { Client, Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfoField from "@/components/shared/InfoField";
import AppointmentCard from "@/components/shared/AppointmentCard";
import { ClientEditDialog } from "@/components/clients/ClientEditDialog";

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const clientId = Number(params.id);

  const [client, setClient] = useState<Client | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchClientData();
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setIsLoading(true);
      const [clientData, appointmentsData] = await Promise.all([
        apiClient.getClient(clientId),
        apiClient.getAppointments({ client: clientId.toString() }),
      ]);
      setClient(clientData as Client);
      setAppointments(appointmentsData.results);
    } catch (error) {
      console.error("Failed to fetch client data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this client? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteClient(clientId);
      router.push("/clients");
    } catch (error) {
      console.error("Failed to delete client:", error);
      alert("Failed to delete client");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading client details...</div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Client Not Found</h2>
        <Button asChild>
          <Link href="/clients">← Back to Clients</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      active: "default",
      inactive: "secondary",
      potential: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-4">
            <Link href="/clients">← Back to Clients</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {client.full_name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {getStatusBadge(client.status)}
            <span className="text-sm text-muted-foreground">
              Client ID: {client.id}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField label="Email" value={client.email || "Not provided"} />
          <InfoField label="Phone" value={client.phone} />
          <InfoField
            label="Address"
            value={client.address}
            className="md:col-span-2"
          />
          {client.service_location && (
            <InfoField
              label="Service Location"
              value={client.service_location}
              className="md:col-span-2"
            />
          )}
          {client.notes && (
            <InfoField
              label="Notes"
              value={client.notes}
              className="md:col-span-2"
            />
          )}
          <InfoField
            label="Created"
            value={new Date(client.created_at).toLocaleDateString()}
          />
          <InfoField
            label="Last Updated"
            value={new Date(client.updated_at).toLocaleDateString()}
          />
        </CardContent>
      </Card>

      {/* Appointment History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Appointment History ({appointments.length})</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/appointments/new?client=${clientId}`}>
              + Schedule New
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No appointments scheduled
            </p>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <ClientEditDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        client={client}
        onSuccess={() => {
          setIsEditing(false);
          fetchClientData();
        }}
      />
    </div>
  );
}
