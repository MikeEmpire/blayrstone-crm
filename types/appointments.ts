import { Appointment } from ".";

export interface GetAppointmentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Appointment[];
}

export type AppointmentType =
  | "Service Call"
  | "Consultation"
  | "Follow-up"
  | "Emergency";

export type AppointmentTypeValues =
  | "service"
  | "consultation"
  | "follow_up"
  | "emergency";

export type AppointmentStatus =
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "No Show";

export type AppointmentStatusValues =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface AppointmentFormData
  extends Omit<
    Appointment,
    | "id"
    | "created_at"
    | "updated_at"
    | "is_upcoming"
    | "completed_at"
    | "completion_notes"
    | "client_name"
    | "worker_name"
  > {}

export const initialAppointmentFormData: AppointmentFormData = {
  client: -1,
  service_worker: undefined,
  appointment_type: "service",
  status: "scheduled",
  scheduled_date: "",
  scheduled_time: "",
  duration_minutes: 60,
  location: "",
  description: "",
  notes: "",
};
