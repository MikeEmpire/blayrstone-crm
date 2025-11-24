import { ServiceWorker } from ".";
export interface GetWorkerResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ServiceWorker[];
}
