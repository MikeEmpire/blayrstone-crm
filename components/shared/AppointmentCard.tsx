import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/types";

export default function AppointmentCard({
  appointment,
}: {
  appointment: Appointment;
}) {
  const statusVariants: Record<
    string,
    "default" | "secondary" | "outline" | "destructive"
  > = {
    scheduled: "default",
    in_progress: "outline",
    completed: "secondary",
    cancelled: "destructive",
    no_show: "destructive",
  };

  return (
    <Link href={`/appointments/${appointment.id}`}>
      <Card className="hover:border-primary transition-colors cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-semibold">
                  {appointment.scheduled_date}
                </span>
                <span className="text-muted-foreground">
                  {appointment.scheduled_time.slice(0, 5)}
                </span>
                <Badge variant={statusVariants[appointment.status]}>
                  {appointment.status.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                👷 {appointment.worker_name || "Unassigned"}
              </p>
              {appointment.description && (
                <p className="text-sm text-muted-foreground">
                  {appointment.description}
                </p>
              )}
            </div>
            <span className="text-muted-foreground">→</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
