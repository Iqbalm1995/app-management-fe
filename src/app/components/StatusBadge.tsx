"use client";

import { Badge, BadgeProps } from "@chakra-ui/react";
import { formatCabStatusLabel, getStatusColor } from "@/app/constants/masterStatusConstants";

interface StatusBadgeProps extends Omit<BadgeProps, 'colorScheme'> {
  status: string;
  variant?: "solid" | "subtle" | "outline";
}

export function StatusBadge({ status = "", variant = "subtle", ...props }: StatusBadgeProps) {
  const safeStatus = String(status || "");
  const color = getStatusColor(safeStatus);
  const label = formatCabStatusLabel(safeStatus);

  return (
    <Badge
      colorScheme={color}
      variant={variant}
      {...props}
    >
      {label || "—"}
    </Badge>
  );
}
