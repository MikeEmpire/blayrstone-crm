"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WorkerFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
}

export function WorkerFilters({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
}: WorkerFiltersProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search by name, email, or phone..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={statusFilter} onValueChange={onStatusChange}>
          <SelectTrigger id="status">
            <SelectValue placeholder="All Workers" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Workers</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="potential">Potential</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
