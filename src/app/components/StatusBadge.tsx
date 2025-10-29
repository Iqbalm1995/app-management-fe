"use client";

import { Badge, BadgeProps } from "@chakra-ui/react";
import { getStatusColor } from "@/app/constants/masterStatusConstants";

interface StatusBadgeProps extends Omit<BadgeProps, 'colorScheme'> {
  status: string;
  variant?: "solid" | "subtle" | "outline";
}

export function StatusBadge({ status, variant = "subtle", ...props }: StatusBadgeProps) {
  return (
    <Badge
      colorScheme={getStatusColor(status)}
      variant={variant}
      {...props}
    >
      {status}
    </Badge>
  );
}
