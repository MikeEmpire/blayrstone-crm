"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/lib/api";
import { Appointment } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppointmentTable } from "@/components/appointments/AppointmentTable";
import { AppointmentFilters } from "@/components/appointments/AppointmentFilters";
import { AppointmentCreateDialog } from "@/components/appointments/AppointmentCreateDialog";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const params: Record<string, string> = {};

      if (statusFilter !== "all") {
        params.status = statusFilter;
      }

      // Handle date filters
      if (dateFilter === "today") {
        const response: any = await apiClient.getTodayAppointments();
        setAppointments(response);
        setIsLoading(false);
        return;
      } else if (dateFilter === "upcoming") {
        const response: any = await apiClient.getUpcomingAppointments();
        setAppointments(response);
        setIsLoading(false);
        return;
      }

      const response: any = await apiClient.getAppointments(params);
      setAppointments(response.results || response);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, clientName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete the appointment with ${clientName}?`
      )
    ) {
      return;
    }

    try {
      await apiClient.deleteAppointment(id);
      setAppointments(appointments.filter((a) => a.id !== id));
      toast.success("Appointment deleted successfully");
    } catch (error) {
      console.error("Failed to delete appointment:", error);
      toast.error("Failed to delete appointment");
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      if (newStatus === "completed") {
        await apiClient.completeAppointment(id);
      } else if (newStatus === "cancelled") {
        await apiClient.cancelAppointment(id);
      } else {
        await apiClient.updateAppointment(id, { status: newStatus });
      }

      // Refresh appointments
      fetchAppointments();
      toast.success("Status updated successfully");
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      appointment.client_name.toLowerCase().includes(searchLower) ||
      appointment.worker_name?.toLowerCase().includes(searchLower) ||
      appointment.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
          <p className="text-muted-foreground mt-2">
            Manage service appointments and schedules
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <span className="mr-2">+</span>
          Schedule Appointment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {appointments.filter((a) => a.status === "scheduled").length}
            </div>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {appointments.filter((a) => a.status === "completed").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {appointments.filter((a) => a.status === "in_progress").length}
            </div>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {appointments.filter((a) => a.is_upcoming).length}
            </div>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <AppointmentFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
            dateFilter={dateFilter}
            onDateChange={setDateFilter}
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading appointments...
            </div>
          ) : (
            <AppointmentTable
              appointments={filteredAppointments}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
            />
          )}
        </CardContent>
      </Card>

      {/* Create Modal */}
      <AppointmentCreateDialog
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={() => {
          setShowCreateModal(false);
          fetchAppointments();
          toast.success("Appointment created successfully");
        }}
      />
    </div>
  );
}
