// lib/api.ts - API client for Django backend

import { GetAppointmentResponse } from "@/types/clients";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { token, ...fetchOptions } = options;

    const headers = new Headers(fetchOptions.headers);

    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "An error occurred",
      }));
      throw new Error(error.detail || "Request failed");
    }

    return response.json();
  }

  // Auth methods (for future JWT implementation)
  async login(username: string, password: string) {
    return this.request("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  }

  // Client methods
  async getClients(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : "";
    return this.request(`/clients/${queryString}`);
  }

  async getClient(id: number) {
    return this.request(`/clients/${id}/`);
  }

  async createClient(data: any) {
    return this.request(`/clients/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateClient(id: number, data: any) {
    return this.request(`/clients/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteClient(id: number) {
    return this.request(`/clients/${id}/`, {
      method: "DELETE",
    });
  }

  async getClientStats() {
    return this.request("/clients/stats/");
  }

  // Worker methods
  async getWorkers(params?: Record<string, string>) {
    const queryString = params ? `?${new URLSearchParams(params)}` : "";
    return this.request(`/workers/${queryString}`);
  }

  async getWorker(id: number) {
    return this.request(`/workers/${id}/`);
  }

  async createWorker(data: any) {
    return this.request(`/workers/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateWorker(id: number, data: any) {
    return this.request(`/workers/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteWorker(id: number) {
    return this.request(`/workers/${id}/`, {
      method: "DELETE",
    });
  }

  async getWorkerStats() {
    return this.request("/workers/stats/");
  }

  async getWorkerAvailability(id: number, date: string) {
    return this.request(`/workers/${id}/availability/?date=${date}`);
  }

  // Appointment methods
  async getAppointments(
    params?: Record<string, string>
  ): Promise<GetAppointmentResponse> {
    const queryString = params ? `?${new URLSearchParams(params)}` : "";
    return this.request(`/appointments/${queryString}`);
  }

  async getAppointment(id: number) {
    return this.request(`/appointments/${id}/`);
  }

  async createAppointment(data: any) {
    return this.request(`/appointments/`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(id: number, data: any) {
    return this.request(`/appointments/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async deleteAppointment(id: number) {
    return this.request(`/appointments/${id}/`, {
      method: "DELETE",
    });
  }

  async getTodayAppointments() {
    return this.request("/appointments/today/");
  }

  async getUpcomingAppointments() {
    return this.request("/appointments/upcoming/");
  }

  async getAppointmentStats() {
    return this.request("/appointments/stats/");
  }

  async completeAppointment(id: number, completionNotes?: string) {
    return this.request(`/appointments/${id}/complete/`, {
      method: "POST",
      body: JSON.stringify({ completion_notes: completionNotes }),
    });
  }

  async cancelAppointment(id: number, notes?: string) {
    return this.request(`/appointments/${id}/cancel/`, {
      method: "POST",
      body: JSON.stringify({ notes }),
    });
  }

  async checkConflicts(date: string, workerId: number) {
    return this.request(
      `/appointments/conflicts/?date=${date}&worker_id=${workerId}`
    );
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;
