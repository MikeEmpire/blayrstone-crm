"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { ServiceWorker } from "@/types";

interface ServiceWorkerMultiSelectProps {
  workers: ServiceWorker[];
  selectedWorkerIds: number[];
  onChange: (workerIds: number[]) => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ServiceWorkerMultiSelect({
  workers,
  selectedWorkerIds,
  onChange,
  placeholder = "Select service workers...",
  disabled = false,
}: ServiceWorkerMultiSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedWorkers = workers.filter((w) =>
    selectedWorkerIds.includes(w.id)
  );

  const toggleWorker = (workerId: number) => {
    if (selectedWorkerIds.includes(workerId)) {
      onChange(selectedWorkerIds.filter((id) => id !== workerId));
    } else {
      onChange([...selectedWorkerIds, workerId]);
    }
  };

  const removeWorker = (workerId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(selectedWorkerIds.filter((id) => id !== workerId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between min-h-10 h-auto"
          disabled={disabled}
          type="button"
        >
          <div className="flex gap-1 flex-wrap flex-1">
            {selectedWorkers.length === 0 ? (
              <span className="text-muted-foreground">{placeholder}</span>
            ) : (
              selectedWorkers.map((worker) => (
                <Badge key={worker.id} variant="secondary" className="gap-1">
                  {worker.full_name}
                  <span
                    onClick={(e) => removeWorker(worker.id, e)}
                    className="ml-1 rounded-full hover:bg-muted cursor-pointer"
                    role="button"
                    aria-label={`Remove ${worker.full_name}`}
                  >
                    <X className="h-3 w-3" />
                  </span>
                </Badge>
              ))
            )}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput placeholder="Search workers..." />
          <CommandEmpty>No worker found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {workers
              .filter((w) => w.status === "active")
              .map((worker) => (
                <CommandItem
                  key={worker.id}
                  value={worker.full_name}
                  onSelect={() => toggleWorker(worker.id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedWorkerIds.includes(worker.id)
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{worker.full_name}</span>
                    {worker.skills && (
                      <span className="text-xs text-muted-foreground">
                        {worker.skills}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
