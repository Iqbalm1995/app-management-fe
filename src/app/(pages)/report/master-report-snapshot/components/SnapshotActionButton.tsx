import { Button, Tooltip } from "@chakra-ui/react";
import React from "react";

interface SnapshotActionButtonProps {
  label: string;
  isLoading: boolean;
  isSuccess: boolean;
  error: string | null;
  onClick: () => void;
  disabled?: boolean;
}

export function SnapshotActionButton({
  label,
  isLoading,
  isSuccess,
  error,
  onClick,
  disabled = false,
}: SnapshotActionButtonProps) {
  const getButtonColor = () => {
    if (error) return "red";
    if (isSuccess) return "green";
    return "blue";
  };

  const getButtonText = () => {
    if (isLoading) return "Executing...";
    if (isSuccess) return "✓ Success";
    if (error) return "✗ Error";
    return label;
  };

  return (
    <Tooltip label={error || ""} isDisabled={!error}>
      <Button
        colorScheme={getButtonColor()}
        isLoading={isLoading}
        isDisabled={disabled || isLoading}
        onClick={onClick}
        width="100%"
      >
        {getButtonText()}
      </Button>
    </Tooltip>
  );
}
