"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import apiClient from "@/lib/api";
import { Client, ServiceWorker } from "@/types";
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
import {
  AppointmentFormData,
  initialAppointmentFormData,
} from "@/types/appointments";
import { ServiceWorkerMultiSelect } from "./ServiceWorkerMultiSelect";
import { CanAccess } from "@/context/CanAccess";

interface AppointmentCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function AppointmentCreateDialog({
  open,
  onOpenChange,
  onSuccess,
}: AppointmentCreateDialogProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [workers, setWorkers] = useState<ServiceWorker[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedWorkerIds, setSelectedWorkerIds] = useState<number[]>([]);
  const [formData, setFormData] = useState<AppointmentFormData>(
    initialAppointmentFormData
  );

  // Load clients and workers when dialog opens
  useEffect(() => {
    if (open) {
      loadClientsAndWorkers();
      // Reset form when opening
      setSelectedWorkerIds([]);
      setFormData(initialAppointmentFormData);
      setSelectedDate(undefined);
    }
  }, [open]);

  // Auto-fill location when client is selected
  useEffect(() => {
    if (formData.client !== -1) {
      const selectedClient = clients.find((c) => c.id === formData.client);
      if (selectedClient) {
        setFormData((prev) => ({
          ...prev,
          location: selectedClient.service_location || selectedClient.address,
        }));
      }
    }
  }, [formData.client, clients]);

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

    if (!selectedWorkerIds || selectedWorkerIds.length === 0) {
      toast.error("Please select at least one service worker");
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
        service_workers: selectedWorkerIds,
        appointment_type: formData.appointment_type,
        status: formData.status,
        scheduled_date: formData.scheduled_date,
        scheduled_time: formData.scheduled_time,
        duration_minutes: formData.duration_minutes,
        location: formData.location,
        description: formData.description,
        notes: formData.notes,
      };

      await apiClient.createAppointment(submitData);

      toast.success("Appointment created successfully");

      // Reset form
      setFormData(initialAppointmentFormData);
      setSelectedDate(undefined);
      setSelectedWorkerIds([]);

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      // Handle validation errors from backend
      if (err.service_workers && Array.isArray(err.service_workers)) {
        toast.error(err.service_workers[0]);
      } else {
        toast.error(err.message || "Failed to create appointment");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule New Appointment</DialogTitle>
          <DialogDescription>
            Create a new service appointment for a client
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Client Selection */}
          <div className="space-y-2">
            <Label htmlFor="client">Client *</Label>
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
                <SelectTrigger id="client">
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
            <Label htmlFor="worker">Service Workers *</Label>
            {isLoadingData ? (
              <div className="text-sm text-muted-foreground">
                Loading workers...
              </div>
            ) : (
              <>
                <ServiceWorkerMultiSelect
                  workers={workers}
                  selectedWorkerIds={selectedWorkerIds}
                  onChange={setSelectedWorkerIds}
                  placeholder="Select one or more workers"
                />
                {selectedWorkerIds.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    At least one worker is required
                  </p>
                )}
                {selectedWorkerIds.length > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {selectedWorkerIds.length} worker
                    {selectedWorkerIds.length > 1 ? "s" : ""} selected
                  </p>
                )}
              </>
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
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Time Picker */}
            <div className="space-y-2">
              <Label htmlFor="time">Scheduled Time *</Label>
              <Input
                id="time"
                type="time"
                required
                value={formData.scheduled_time}
                onChange={(e) =>
                  setFormData({ ...formData, scheduled_time: e.target.value })
                }
              />
            </div>
          </div>

          {/* Duration and Type Row */}
          <div className="grid grid-cols-2 gap-4">
            {/* Duration */}
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes) *</Label>
              <Input
                id="duration"
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
              <Label htmlFor="type">Appointment Type</Label>
              <Select
                value={formData.appointment_type}
                onValueChange={(value: any) =>
                  setFormData({ ...formData, appointment_type: value })
                }
              >
                <SelectTrigger id="type">
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
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Textarea
              id="location"
              rows={2}
              placeholder="Service location (auto-filled from client)"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={2}
              placeholder="Brief description of the service needed"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Internal notes (not visible to client)"
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
            <CanAccess permission="admin">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Appointment"}
              </Button>
            </CanAccess>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
