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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CanAccess } from "@/context/CanAccess";
import { Users } from "lucide-react";

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
  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      service: "Service",
      consultation: "Consultation",
      follow_up: "Follow-up",
      emergency: "Emergency",
    };
    return labels[type] || type;
  };

  const renderWorkers = (appointment: Appointment) => {
    const workers = appointment.service_workers_details || [];

    if (workers.length === 0) {
      return <span className="text-muted-foreground text-sm">Unassigned</span>;
    }

    // Show first worker
    const firstWorker = workers[0];
    const remainingCount = workers.length - 1;

    return (
      <div className="flex items-center gap-1.5">
        <Link
          href={`/workers/${firstWorker.id}`}
          className="text-blue-600 hover:underline text-sm"
        >
          {firstWorker.full_name}
        </Link>

        {remainingCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  className="cursor-help text-xs px-1.5 py-0"
                >
                  +{remainingCount}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="space-y-1">
                  {workers.slice(1).map((worker) => (
                    <div key={worker.id} className="text-sm">
                      {worker.full_name}
                    </div>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {workers.length > 1 && (
          <Users className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </div>
    );
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
          <TableHead>Workers</TableHead>
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
            <TableCell>{renderWorkers(appointment)}</TableCell>
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
                <CanAccess permission="admin">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      onDelete(appointment.id, appointment.client_name)
                    }
                  >
                    Delete
                  </Button>
                </CanAccess>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
