import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  className?: string;
}

export function MetricCard({
  title,
  value,
  change,
  changeType = "neutral",
  icon: Icon,
  className
}: MetricCardProps) {
  return (
    <div className={cn(
      "bg-layer-01 border border-ui-03 rounded p-6 hover:bg-layer-02 transition-colors",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-ui-03">
            <Icon className="h-5 w-5 text-text-01" />
          </div>
          <div>
            <p className="carbon-type-label-01 text-text-02">{title}</p>
            <p className="carbon-type-productive-heading-04 text-text-01 mt-1">
              {value}
            </p>
          </div>
        </div>
        {change && (
          <div className={cn(
            "carbon-type-label-01 px-2 py-1 rounded",
            changeType === "positive" && "bg-support-02 text-white",
            changeType === "negative" && "bg-support-01 text-white",
            changeType === "neutral" && "bg-ui-03 text-text-02"
          )}>
            {change}
          </div>
        )}
      </div>
    </div>
  );
}
