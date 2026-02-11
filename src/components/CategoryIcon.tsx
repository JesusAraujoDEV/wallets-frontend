import * as LucideIcons from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

export function getCategoryIcon(name?: string | null): LucideIcon | null {
  if (!name) return null;
  const Icon = (LucideIcons as Record<string, LucideIcon>)[name];
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
