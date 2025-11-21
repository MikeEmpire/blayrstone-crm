"use client";

import Link from "next/link";
import { Client } from "@/types";
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

interface ClientTableProps {
  clients: Client[];
  onDelete: (id: number, name: string) => void;
}

export function ClientTable({ clients, onDelete }: ClientTableProps) {
  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      active: "default",
      inactive: "secondary",
      potential: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  if (clients.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        No clients found
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
          <TableHead>Appointments</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell className="font-medium">{client.full_name}</TableCell>
            <TableCell>
              <div className="text-sm">
                {client.email && <div>{client.email}</div>}
                <div className="text-muted-foreground">{client.phone}</div>
              </div>
            </TableCell>
            <TableCell>{getStatusBadge(client.status)}</TableCell>
            <TableCell>
              <span className="text-sm text-muted-foreground">
                {client.appointment_count || 0} total
              </span>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/clients/${client.id}`}>View</Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(client.id, client.full_name)}
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
