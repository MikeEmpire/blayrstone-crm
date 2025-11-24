"use client";

import Link from "next/link";
import { Appointment } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppointmentTableProps {
  appointments: Appointment[];
  onDelete: (id: number, clientName: string) => void;
  onStatusChange: (id: number, status: string) => void;
}

export function AppointmentTable({
  appointments,
  onDelete,
  onStatusChange,
}: AppointmentTableProps) {
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
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      service: "Service",
      consultation: "Consultation",
      follow_up: "Follow-up",
      emergency: "Emergency",
    };
    return labels[type] || type;
  };

  if (appointments.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No appointments found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date & Time</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Worker</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Duration</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {appointments.map((appointment) => (
          <TableRow key={appointment.id}>
            <TableCell>
              <div className="font-medium">{appointment.scheduled_date}</div>
              <div className="text-sm text-muted-foreground">
                {appointment.scheduled_time.slice(0, 5)}
              </div>
            </TableCell>
            <TableCell>
              <Link
                href={`/clients/${appointment.client}`}
                className="text-blue-600 hover:underline"
              >
                {appointment.client_name}
              </Link>
            </TableCell>
            <TableCell>
              {appointment.service_worker ? (
                <Link
                  href={`/workers/${appointment.service_worker}`}
                  className="text-blue-600 hover:underline"
                >
                  {appointment.worker_name}
                </Link>
              ) : (
                <span className="text-muted-foreground">Unassigned</span>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {getTypeLabel(appointment.appointment_type)}
              </Badge>
            </TableCell>
            <TableCell>
              <Select
                value={appointment.status}
                onValueChange={(value) => onStatusChange(appointment.id, value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no_show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {appointment.duration_minutes} min
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/appointments/${appointment.id}`}>View</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onDelete(appointment.id, appointment.client_name)
                  }
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
