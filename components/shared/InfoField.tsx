import { Label } from "@/components/ui/label";

interface InfoFieldProps {
  label: string;
  value: string;
  className?: string;
}

export default function InfoField({ label, value, className = "" }: InfoFieldProps) {
  return (
    <div className={className}>
      <Label className="text-muted-foreground">{label}</Label>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}
