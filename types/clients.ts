import { Appointment } from ".";

export interface GetAppointmentResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Appointment[];
}
