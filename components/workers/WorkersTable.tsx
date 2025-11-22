"use client";

import Link from "next/link";
import { ServiceWorker } from "@/types";
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

interface WorkerTableProps {
  workers: ServiceWorker[];
  onDelete: (id: number, name: string) => void;
}

export function WorkerTable({ workers, onDelete }: WorkerTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      active: "default",
      inactive: "secondary",
      potential: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (workers.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No workers found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Upcoming Appointments</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workers.map((worker) => (
          <TableRow key={worker.id}>
            <TableCell className="font-medium">{worker.full_name}</TableCell>
            <TableCell>
              <div className="text-sm">
                {worker.email && <div>{worker.email}</div>}
                <div className="text-muted-foreground">{worker.phone}</div>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(worker.status)}</TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {worker.upcoming_appointments || 0} total
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/workers/${worker.id}`}>View</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(worker.id, worker.full_name)}
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
