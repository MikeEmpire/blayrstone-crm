"use client";

import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import apiClient from "@/lib/api";
import { Client, ServiceWorker, Appointment } from "@/types";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AppointmentFormData } from "@/types/appointments";

interface AppointmentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  onSuccess: () => void;
}

export function AppointmentEditDialog({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: AppointmentEditDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<ServiceWorker[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const [formData, setFormData] = useState<AppointmentFormData>({
    client: appointment.client,
    service_worker: appointment.service_worker,
    appointment_type: appointment.appointment_type,
    status: appointment.status,
    scheduled_date: appointment.scheduled_date,
    scheduled_time: appointment.scheduled_time,
    duration_minutes: appointment.duration_minutes,
    location: appointment.location || "",
    description: appointment.description || "",
    notes: appointment.notes || "",
  });

  // Load clients and workers when dialog opens
  useEffect(() => {
    if (open) {
      loadClientsAndWorkers();

      // Set form data from appointment
      setFormData({
        client: appointment.client,
        service_worker: appointment.service_worker,
        appointment_type: appointment.appointment_type,
        status: appointment.status,
        scheduled_date: appointment.scheduled_date,
        scheduled_time: appointment.scheduled_time,
        duration_minutes: appointment.duration_minutes,
        location: appointment.location || "",
        description: appointment.description || "",
        notes: appointment.notes || "",
      });

      // Parse and set the date
      try {
        const date = parse(
          appointment.scheduled_date,
          "yyyy-MM-dd",
          new Date()
        );
        setSelectedDate(date);
      } catch (error) {
        console.error("Failed to parse date:", error);
      }
    }
  }, [open, appointment]);

  const loadClientsAndWorkers = async () => {
    try {
      setIsLoadingData(true);
      const [clientsData, workersData] = await Promise.all([
        apiClient.getClients({ status: "active" }),
        apiClient.getWorkers({ status: "active" }),
      ]);

      setClients(clientsData.results || clientsData);
      setWorkers(workersData.results || workersData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load clients and workers");
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setFormData((prev) => ({
        ...prev,
        scheduled_date: format(date, "yyyy-MM-dd"),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.client === -1) {
      toast.error("Please select a client");
      return;
    }

    if (!formData.scheduled_date || !formData.scheduled_time) {
      toast.error("Please select date and time");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare data for API
      const submitData: any = {
        client: formData.client,
        appointment_type: formData.appointment_type,
        status: formData.status,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        duration_minutes: formData.duration_minutes,
        location: formData.location,
        description: formData.description,
        notes: formData.notes,
      };

      // Handle service_worker (can be null/undefined)
      if (formData.service_worker && formData.service_worker !== -1) {
        submitData.service_worker = formData.service_worker;
      } else {
        submitData.service_worker = null;
      }

      await apiClient.updateAppointment(appointment.id, submitData);

      onSuccess();
    } catch (err: any) {
      toast.error(err.message || "Failed to update appointment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Appointment</DialogTitle>
          <DialogDescription>Update appointment details</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="edit_client">Client *</Label>
            {isLoadingData ? (
              <div className="text-sm text-muted-foreground">
                Loading clients...
              </div>
            ) : (
              <Select
                value={formData.client.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, client: parseInt(value) })
                }
              >
                <SelectTrigger id="edit_client">
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Service Worker Selection */}
          <div className="space-y-2">
            <Label htmlFor="edit_worker">Service Worker</Label>
            {isLoadingData ? (
              <div className="text-sm text-muted-foreground">
                Loading workers...
              </div>
            ) : (
              <Select
                value={formData.service_worker?.toString() || "unassigned"}
                onValueChange={(value) =>
                  setFormData({
                    ...formData,
                    service_worker:
                      value === "unassigned" ? undefined : parseInt(value),
                  })
                }
              >
                <SelectTrigger id="edit_worker">
                  <SelectValue placeholder="Select a worker (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {workers.map((worker) => (
                    <SelectItem key={worker.id} value={worker.id.toString()}>
                      {worker.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Date and Time Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Date Picker */}
            <div className="space-y-2">
              <Label>Scheduled Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div className="space-y-2">
              <Label htmlFor="edit_time">Scheduled Time *</Label>
              <Input
                id="edit_time"
                type="time"
                required
                value={formData.scheduled_time}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_time: e.target.value })
                }
              />
            </div>
          </div>

          {/* Duration, Type, and Status Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="edit_duration">Duration (min) *</Label>
              <Input
                id="edit_duration"
                type="number"
                min="15"
                step="15"
                required
                value={formData.duration_minutes}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    duration_minutes: parseInt(e.target.value),
                  })
                }
              />
            </div>

            {/* Appointment Type */}
            <div className="space-y-2">
              <Label htmlFor="edit_type">Type</Label>
              <Select
                value={formData.appointment_type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, appointment_type: value })
                }
              >
                <SelectTrigger id="edit_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">Service Call</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label htmlFor="edit_status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, status: value })
                }
              >
                <SelectTrigger id="edit_status">
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
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="edit_location">Location</Label>
            <Textarea
              id="edit_location"
              rows={2}
              placeholder="Service location"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Textarea
              id="edit_description"
              rows={2}
              placeholder="Brief description of the service"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="edit_notes">Internal Notes</Label>
            <Textarea
              id="edit_notes"
              rows={2}
              placeholder="Internal notes"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
