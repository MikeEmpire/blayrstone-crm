"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api";
import { Appointment, ServiceWorker } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkerEditDialog } from "@/components/workers/WorkerEditDialog";
import InfoField from "@/components/shared/InfoField";
import AppointmentCard from "@/components/shared/AppointmentCard";

export default function WorkerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const workerId = Number(params.id);

  const [worker, setWorker] = useState<ServiceWorker | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchWorkerData();
  }, [workerId]);

  const fetchWorkerData = async () => {
    try {
      setIsLoading(true);
      const [workerData, appointmentData] = await Promise.all([
        apiClient.getWorker(workerId),
        apiClient.getAppointments({ worker: workerId.toString() }),
      ]);
      setWorker(workerData as ServiceWorker);
      setAppointments(appointmentData.results);
    } catch (error) {
      console.error("Failed to fetch worker data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this worker? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteWorker(workerId);
      router.push("/workers");
    } catch (error) {
      console.error("Failed to delete worker:", error);
      alert("Failed to delete worker");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading worker details...</div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Worker Not Found</h2>
        <Button asChild>
          <Link href="/workers">← Back to Workers</Link>
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
            <Link href="/workers">← Back to Workers</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            {worker.full_name}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {getStatusBadge(worker.status)}
            <span className="text-sm text-muted-foreground">
              Worker ID: {worker.id}
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
          <InfoField label="Email" value={worker.email || "Not provided"} />
          <InfoField label="Phone" value={worker.phone} />
          <InfoField
            label="Skills"
            value={worker.skills || "Not provided"}
            className="md:col-span-2"
          />
          {worker.notes && (
            <InfoField
              label="Notes"
              value={worker.notes}
              className="md:col-span-2"
            />
          )}
          <InfoField
            label="Created"
            value={new Date(worker.created_at).toLocaleDateString()}
          />
          <InfoField
            label="Last Updated"
            value={new Date(worker.updated_at).toLocaleDateString()}
          />
        </CardContent>
      </Card>

      {/* Appointment History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Appointment History ({appointments.length})</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/appointments/new?worker=${workerId}`}>
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
      <WorkerEditDialog
        open={isEditing}
        onOpenChange={setIsEditing}
        worker={worker}
        onSuccess={() => {
          setIsEditing(false);
          fetchWorkerData();
        }}
      />
    </div>
  );
}
