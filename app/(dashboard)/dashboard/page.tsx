"use client";

// app/(dashboard)/dashboard/page.tsx - Main dashboard

import { useEffect, useState } from "react";
import apiClient from "@/lib/api";
import {
  AppointmentStats,
  ClientStats,
  WorkerStats,
  Appointment,
} from "@/types";

export default function DashboardPage() {
  const [appointmentStats, setAppointmentStats] =
    useState<AppointmentStats | null>(null);
  const [clientStats, setClientStats] = useState<ClientStats | null>(null);
  const [workerStats, setWorkerStats] = useState<WorkerStats | null>(null);
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [appointments, clients, workers, today] = await Promise.all([
          apiClient.getAppointmentStats(),
          apiClient.getClientStats(),
          apiClient.getWorkerStats(),
          apiClient.getTodayAppointments(),
        ]);

        setAppointmentStats(appointments as AppointmentStats);
        setClientStats(clients as ClientStats);
        setWorkerStats(workers as WorkerStats);
        setTodayAppointments(today as Appointment[]);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Today's Appointments */}
        <StatsCard
          title="Today's Appointments"
          value={appointmentStats?.today || 0}
          icon="📅"
          color="blue"
        />

        {/* Upcoming Appointments */}
        <StatsCard
          title="Upcoming (7 days)"
          value={appointmentStats?.upcoming || 0}
          icon="📆"
          color="green"
        />

        {/* Active Clients */}
        <StatsCard
          title="Active Clients"
          value={clientStats?.active || 0}
          icon="👥"
          color="purple"
        />

        {/* Active Workers */}
        <StatsCard
          title="Active Workers"
          value={workerStats?.active || 0}
          icon="👷"
          color="orange"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Appointments"
          value={appointmentStats?.total || 0}
          subtitle={`${appointmentStats?.completed || 0} completed`}
          icon="📊"
          color="gray"
        />
        <StatsCard
          title="Total Clients"
          value={clientStats?.total || 0}
          subtitle={`${clientStats?.potential || 0} potential`}
          icon="📈"
          color="gray"
        />
        <StatsCard
          title="Service Workers"
          value={workerStats?.total || 0}
          subtitle={`${workerStats?.on_leave || 0} on leave`}
          icon="📋"
          color="gray"
        />
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Today's Schedule
          </h3>
        </div>
        <div className="p-6">
          {todayAppointments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No appointments scheduled for today
            </p>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <AppointmentCard
                  key={appointment.id}
                  appointment={appointment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: string;
  color: "blue" | "green" | "purple" | "orange" | "gray";
}

function StatsCard({ title, value, subtitle, icon, color }: StatsCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
    gray: "bg-gray-50 text-gray-600",
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-4xl ${colorClasses[color]} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Appointment Card Component
interface AppointmentCardProps {
  appointment: Appointment;
}

function AppointmentCard({ appointment }: AppointmentCardProps) {
  const statusColors: Record<string, string> = {
    scheduled: "bg-blue-100 text-blue-800",
    in_progress: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-gray-100 text-gray-800",
  };

  const typeLabels: Record<string, string> = {
    service: "Service",
    consultation: "Consultation",
    follow_up: "Follow-up",
    emergency: "Emergency",
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <p className="font-semibold text-gray-900">
              {appointment.scheduled_time.slice(0, 5)}
            </p>
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${
                statusColors[appointment.status]
              }`}
            >
              {appointment.status.replace("_", " ")}
            </span>
            <span className="text-xs text-gray-500">
              {typeLabels[appointment.appointment_type]}
            </span>
          </div>
          <p className="text-gray-900 mt-2">{appointment.client_name}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
            <span>👷 {appointment.worker_name || "Unassigned"}</span>
            <span>⏱️ {appointment.duration_minutes} min</span>
          </div>
          {appointment.description && (
            <p className="text-sm text-gray-600 mt-2">
              {appointment.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
