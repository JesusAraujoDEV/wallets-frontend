import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  colorScheme: "primary" | "secondary" | "accent";
}

export const KPICard = ({ title, value, icon: Icon, trend, colorScheme }: KPICardProps) => {
  const colorClasses = {
    primary: "bg-primary-light text-primary-foreground",
    secondary: "bg-secondary-light text-secondary-foreground",
    accent: "bg-accent-light text-accent-foreground",
  };

  return (
    <Card className="p-6 shadow-md hover:shadow-lg transition-all duration-300 border-0">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-foreground mb-2">{value}</h3>
          {trend && (
            <p className={`text-sm font-medium ${trend.isPositive ? "text-primary" : "text-destructive"}`}>
              {trend.isPositive ? "+" : ""}{trend.value}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorClasses[colorScheme]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
