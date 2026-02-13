import * as LucideIcons from "lucide-react";
import {
  Baby,
  Beer,
  Bus,
  Coffee,
  Dumbbell,
  Hammer,
  PawPrint,
  Plane,
  Smartphone,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

const iconMap: Record<string, LucideIcon> = {
  Plane,
  Bus,
  Dumbbell,
  Beer,
  Coffee,
  PawPrint,
  Wrench,
  Zap,
  Smartphone,
  Wifi,
  Baby,
  Hammer,
};

export function getCategoryIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  const Icon = iconMap[name] || (LucideIcons as Record<string, LucideIcon>)[name];
  return Icon || null;
}

export function CategoryIcon({
  name,
  className,
  color,
  style,
}: {
  name?: string | null;
  className?: string;
  color?: string;
  style?: CSSProperties;
}) {
  const Icon = getCategoryIcon(name);
  if (!Icon) return null;
  return <Icon className={className} style={{ color, ...style }} />;
}
