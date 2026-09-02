import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";
import { categoryIconMap } from "@/lib/categoryIconMap";

export function getCategoryIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  return categoryIconMap[name] || null;
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
