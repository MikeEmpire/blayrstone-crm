"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import apiClient from "@/lib/api";
import { Appointment } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppointmentEditDialog } from "@/components/appointments/AppointmentEditDialog";
import InfoField from "@/components/shared/InfoField";

export default function AppointmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const appointmentId = Number(params.id);

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchAppointmentData();
  }, [appointmentId]);

  const fetchAppointmentData = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.getAppointment(appointmentId);
      setAppointment(data);
    } catch (error) {
      console.error("Failed to fetch appointment data:", error);
      toast.error("Failed to load appointment");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this appointment? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteAppointment(appointmentId);
      toast.success("Appointment deleted successfully");
      router.push("/appointments");
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  const handleComplete = async () => {
    if (!confirm("Mark this appointment as completed?")) return;

    try {
      await apiClient.completeAppointment(appointmentId);
      toast.success("Appointment marked as completed");
      fetchAppointmentData();
    } catch (error) {
      console.error("Failed to complete appointment:", error);
      toast.error("Failed to update status");
    }
  };

  const handleCancel = async () => {
    const reason = prompt("Reason for cancellation (optional):");

    try {
      await apiClient.cancelAppointment(appointmentId, reason || undefined);
      toast.success("Appointment cancelled");
      fetchAppointmentData();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">
          Loading appointment details...
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Appointment Not Found</h2>
        <Button asChild>
          <Link href="/appointments">← Back to Appointments</Link>
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "secondary" | "outline" | "destructive"
    > = {
      scheduled: "default",
      in_progress: "outline",
      completed: "secondary",
      cancelled: "destructive",
      no_show: "destructive",
    };
    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      service: "Service Call",
      consultation: "Consultation",
      follow_up: "Follow-up",
      emergency: "Emergency",
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Button variant="ghost" asChild className="mb-2 -ml-4">
            <Link href="/appointments">← Back to Appointments</Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">
            Appointment Details
          </h1>
          <div className="flex items-center gap-3 mt-2">
            {getStatusBadge(appointment.status)}
            <Badge variant="outline">
              {getTypeLabel(appointment.appointment_type)}
            </Badge>
            <span className="text-sm text-muted-foreground">
              ID: {appointment.id}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          {appointment.status === "scheduled" && (
            <>
              <Button variant="outline" onClick={handleComplete}>
                Mark Complete
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </>
          )}
          <Button variant="outline" onClick={() => setIsEditing(true)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoField label="Date" value={appointment.scheduled_date} />
          <InfoField
            label="Time"
            value={appointment.scheduled_time.slice(0, 5)}
          />
          <InfoField
            label="Duration"
            value={`${appointment.duration_minutes} minutes`}
          />
        </CardContent>
      </Card>

      {/* Client & Worker */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Information */}
        <Card>
          <CardHeader>
            <CardTitle>Client</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoField label="Name" value={appointment.client_name} />
            <Button variant="outline" size="sm" asChild>
              <Link href={`/clients/${appointment.client}`}>
                View Client Details →
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Worker Information */}
        <Card>
          <CardHeader>
            <CardTitle>Service Worker</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InfoField
              label="Assigned Worker"
              value={appointment.worker_name || "Unassigned"}
            />
            {appointment.service_worker && (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/workers/${appointment.service_worker}`}>
                  View Worker Details →
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Appointment Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-6">
          <InfoField
            label="Location"
            value={appointment.location || "Not specified"}
          />
          {appointment.description && (
            <InfoField label="Description" value={appointment.description} />
          )}
          {appointment.notes && (
            <InfoField label="Notes" value={appointment.notes} />
          )}
        </CardContent>
      </Card>

      {/* Completion Info (if completed) */}
      {appointment.status === "completed" && appointment.completed_at && (
        <Card>
          <CardHeader>
            <CardTitle>Completion Details</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoField
              label="Completed At"
              value={new Date(appointment.completed_at).toLocaleString()}
            />
            {appointment.completion_notes && (
              <InfoField
                label="Completion Notes"
                value={appointment.completion_notes}
                className="md:col-span-2"
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Metadata</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoField
            label="Created"
            value={new Date(appointment.created_at).toLocaleString()}
          />
          <InfoField
            label="Last Updated"
            value={new Date(appointment.updated_at).toLocaleString()}
          />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {isEditing && (
        <AppointmentEditDialog
          open={isEditing}
          onOpenChange={setIsEditing}
          appointment={appointment}
          onSuccess={() => {
            setIsEditing(false);
            fetchAppointmentData();
            toast.success("Appointment updated successfully");
          }}
        />
      )}
    </div>
  );
}
