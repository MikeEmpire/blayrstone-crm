// types/index.ts - Main type definitions for the CRM

import { AppointmentStatusValues, AppointmentTypeValues } from "./appointments";

export type Client = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone: string;
  address: string;
  service_location?: string;
  status: "active" | "inactive" | "potential";
  notes?: string;
  appointment_count?: number;
  created_at: string;
  updated_at: string;
};

export type ServiceWorker = {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email?: string;
  phone: string;
  skills?: string;
  status: "active" | "inactive" | "on_leave";
  availability_notes?: string;
  notes?: string;
  upcoming_appointments?: number;
  created_at: string;
  updated_at: string;
};

export interface Appointment {
  id: number;
  client: number;
  client_name: string;
  service_worker?: number;
  worker_name?: string;
  appointment_type: AppointmentTypeValues;
  status: AppointmentStatusValues;
  scheduled_date: string;
  scheduled_time: string;
  duration_minutes: number;
  location?: string;
  description?: string;
  notes?: string;
  completed_at?: string;
  completion_notes?: string;
  is_upcoming: boolean;
  created_at: string;
  updated_at: string;
}

export type AppointmentStats = {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
  today: number;
  upcoming: number;
};

export type ClientStats = {
  total: number;
  active: number;
  inactive: number;
  potential: number;
};

export type WorkerStats = {
  total: number;
  active: number;
  inactive: number;
  on_leave: number;
};

export type User = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
};

export type AuthResponse = {
  access: string;
  refresh: string;
  user: User;
};

export type LoginCredentials = {
  username: string;
  password: string;
};

// API Response types
export type PaginatedResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

export type ApiError = {
  detail?: string;
  [key: string]: any;
};
