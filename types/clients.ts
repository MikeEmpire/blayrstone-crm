import { Client } from ".";
export interface GetClientResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Client[];
}
