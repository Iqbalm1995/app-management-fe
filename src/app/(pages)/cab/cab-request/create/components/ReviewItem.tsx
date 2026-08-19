"use client";

import { Badge, HStack, Text, useColorMode, VStack } from "@chakra-ui/react";
import React from "react";

interface ReviewItemProps {
  label: string;
  value: string | React.ReactNode;
  isHighlight?: boolean;
}

const ReviewItem = ({ label, value, isHighlight }: ReviewItemProps) => {
  const { colorMode } = useColorMode();

  return (
    <VStack align="start" spacing={0}>
      <Text fontSize="xs" color="gray.500">{label}</Text>
      {typeof value === "string" ? (
        <Text
          fontSize="sm"
          fontWeight={isHighlight ? "bold" : "600"}
          color={isHighlight ? (colorMode === "light" ? "blue.700" : "blue.300") : (colorMode === "light" ? "gray.800" : "gray.100")}
        >
          {value || "-"}
        </Text>
      ) : (
        value
      )}
    </VStack>
  );
};

export default ReviewItem;
